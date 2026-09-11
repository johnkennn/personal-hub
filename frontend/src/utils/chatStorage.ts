export type ChatHit = {
  kind: 'tool' | 'review'
  title: string
  to: string
  meta?: string
}

/** 统一聊天里的「可点选项」（追问时用） */
export type ChatOption = {
  id: string
  label: string
}

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  actions?: { label: string; to: string }[]
  hits?: ChatHit[]
  /** 意图不清时的追问选项 */
  options?: ChatOption[]
}

const MESSAGES_KEY = 'ai-hub-chat-messages-v2'
const LEGACY_MODE_KEY = 'ai-hub-chat-mode-v1'

export const UNIFIED_WELCOME: ChatMessage = {
  id: 'welcome-unified-v3',
  role: 'assistant',
  text: '你好。搜产品、翻译、写文案，直接说即可。附件仅本会话有效。',
}

function isHit(value: unknown): value is ChatHit {
  if (!value || typeof value !== 'object') return false
  const h = value as ChatHit
  return (
    (h.kind === 'tool' || h.kind === 'review') &&
    typeof h.title === 'string' &&
    typeof h.to === 'string'
  )
}

function isOption(value: unknown): value is ChatOption {
  if (!value || typeof value !== 'object') return false
  const o = value as ChatOption
  return typeof o.id === 'string' && typeof o.label === 'string'
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const m = value as ChatMessage
  if (
    typeof m.id !== 'string' ||
    (m.role !== 'user' && m.role !== 'assistant') ||
    typeof m.text !== 'string'
  ) {
    return false
  }
  if (m.hits != null && (!Array.isArray(m.hits) || !m.hits.every(isHit))) {
    return false
  }
  if (m.options != null && (!Array.isArray(m.options) || !m.options.every(isOption))) {
    return false
  }
  return true
}

/** 读取本标签页会话；关闭标签即消失（sessionStorage） */
export function loadChatMessages(): ChatMessage[] {
  const fallback = [UNIFIED_WELCOME]
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback
    const list = parsed.filter(isMessage)
    if (list.length === 0) return fallback
    // 仅欢迎语时换成最新短文案；有真实对话则保留历史
    if (list.length === 1 && list[0].id.startsWith('welcome-unified')) {
      return fallback
    }
    if (list[0]?.id.startsWith('welcome-unified')) {
      return [UNIFIED_WELCOME, ...list.slice(1)]
    }
    return list
  } catch {
    return fallback
  }
}

export function saveChatMessages(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  } catch {
    /* ignore */
  }
}

export function clearChatMessages() {
  try {
    sessionStorage.removeItem(MESSAGES_KEY)
    sessionStorage.removeItem(LEGACY_MODE_KEY)
    const modes = [
      'chat',
      'copywriting',
      'translate',
      'resume',
      'image-gen',
      'vision',
      'video',
      'doc-summary',
      'contract',
    ]
    for (const m of modes) {
      sessionStorage.removeItem(`ai-hub-chat-messages-v1:${m}`)
    }
  } catch {
    /* ignore */
  }
}
