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
  id: 'welcome-unified',
  role: 'assistant',
  text: [
    '你好，我是 AI Tools Hub 助手。',
    '',
    '直接说需求即可，例如：',
    '· 「搜豆包」——找产品 / 评测',
    '· 「译成英文：……」——翻译',
    '· 「写个耳机卖点文案」——写作',
    '· 「帮我润色这段简历：……」——简历优化（仅供参考，非求职保证）',
    '',
    '也可稍后上传图片或 PDF 等（当前会话有效；关闭标签页后对话与附件会消失，我们不长期保存原文）。',
    '',
    '若我说不清你的意图，会先追问再动手，避免跑偏。',
  ].join('\n'),
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
    return list.length > 0 ? list : fallback
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
