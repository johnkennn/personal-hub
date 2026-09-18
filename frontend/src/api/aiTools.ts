import { getToken } from '../utils/authStorage'
import { requestIdHeader } from '../utils/requestId'

export type AiStreamHandlers = {
  onDelta: (text: string) => void
  onDone?: (info: { remainingQuota: number; dailyQuota: number }) => void
  signal?: AbortSignal
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** 解析 POST SSE 响应体（delta / done / error） */
export async function consumeSseResponse(
  res: Response,
  handlers: AiStreamHandlers,
): Promise<void> {
  if (!res.body) {
    throw new Error('浏览器不支持流式响应')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let sawDone = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sep
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const rawEvent = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const parsed = parseSseBlock(rawEvent)
      if (!parsed) continue

      if (parsed.event === 'delta' && typeof parsed.data.text === 'string') {
        handlers.onDelta(parsed.data.text)
      } else if (parsed.event === 'done') {
        sawDone = true
        handlers.onDone?.({
          remainingQuota: Number(parsed.data.remainingQuota ?? -1),
          dailyQuota: Number(parsed.data.dailyQuota ?? -1),
        })
      } else if (parsed.event === 'error') {
        const msg = String(parsed.data.message || '生成失败')
        const code = Number(parsed.data.code ?? 0)
        const err = new Error(msg) as Error & { status?: number; code?: number }
        if (code > 0) {
          err.code = code
          err.status = code
        }
        throw err
      }
    }
  }

  if (!sawDone) {
    throw new Error('连接中断，未收到完整结果')
  }
}

function parseSseBlock(block: string): { event: string; data: Record<string, unknown> } | null {
  let event = 'message'
  const dataLines: string[] = []
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }
  if (dataLines.length === 0) return null
  try {
    const data = JSON.parse(dataLines.join('\n')) as Record<string, unknown>
    return { event, data }
  } catch {
    return null
  }
}

async function postStream(
  path: string,
  body: unknown,
  handlers: AiStreamHandlers,
): Promise<void> {
  const token = getToken()
  const res = await fetch(`${baseURL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...requestIdHeader(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal: handlers.signal,
  })

  if (!res.ok) {
    let message = `请求失败（HTTP ${res.status}）`
    try {
      const errBody = (await res.json()) as { message?: string }
      if (errBody?.message) message = errBody.message
    } catch {
      /* ignore */
    }
    const err = new Error(message) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  await consumeSseResponse(res, handlers)
}

/**
 * 统一聊天门面（推荐）：意图由前端规则路由后传入 intent。
 * attachmentUrls：临时附件的 /media/chat-temp/... 路径（可选）。
 */
export async function runChatStream(
  intent: string,
  message: string,
  handlers: AiStreamHandlers,
  attachmentUrls?: string[],
  history?: { role: string; content: string }[],
): Promise<void> {
  await postStream(
    '/api/chat/stream',
    {
      intent,
      message,
      ...(attachmentUrls?.length ? { attachmentUrls } : {}),
      ...(history?.length ? { history } : {}),
    },
    handlers,
  )
}

/** 旧路径：按技能 slug 流式（门面回退用） */
export async function runAiToolStream(
  slug: string,
  prompt: string,
  handlers: AiStreamHandlers,
): Promise<void> {
  await postStream(
    `/api/ai-tools/${encodeURIComponent(slug)}/run/stream`,
    { prompt },
    handlers,
  )
}

/**
 * 优先走聊天门面，404/网络失败再回退旧技能接口。
 */
export async function runSkillStream(
  slug: string,
  prompt: string,
  handlers: AiStreamHandlers,
  attachmentUrls?: string[],
  history?: { role: string; content: string }[],
): Promise<void> {
  try {
    await runChatStream(slug, prompt, handlers, attachmentUrls, history)
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 404 || status === 405) {
      await runAiToolStream(slug, prompt, handlers)
      return
    }
    throw err
  }
}
