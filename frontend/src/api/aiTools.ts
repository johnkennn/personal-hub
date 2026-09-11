import { getToken } from '../utils/authStorage'

export type AiRunResponse = {
  text: string
  remainingQuota: number
  dailyQuota: number
}

export type AiStreamHandlers = {
  onDelta: (text: string) => void
  onDone?: (info: { remainingQuota: number; dailyQuota: number }) => void
  signal?: AbortSignal
}

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * 文案等技能的流式调用：POST + SSE（EventSource 只支持 GET，故用 fetch 自己拆包）。
 */
export async function runAiToolStream(
  slug: string,
  prompt: string,
  handlers: AiStreamHandlers,
): Promise<void> {
  const token = getToken()
  const res = await fetch(
    `${baseURL}/api/ai-tools/${encodeURIComponent(slug)}/run/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ prompt }),
      signal: handlers.signal,
    },
  )

  if (!res.ok) {
    let message = `请求失败（HTTP ${res.status}）`
    try {
      const body = (await res.json()) as { message?: string }
      if (body?.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

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

    // SSE 事件块以空行分隔
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
        throw new Error(String(parsed.data.message || '生成失败'))
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
