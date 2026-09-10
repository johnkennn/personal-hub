import type { ChatModeId } from '../pages/Chat/chatModes'
import { getChatMode } from '../pages/Chat/chatModes'

export type ChatRole = 'user' | 'assistant'

export type ChatHit = {
  kind: 'tool' | 'review'
  title: string
  to: string
  meta?: string
}

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  actions?: { label: string; to: string }[]
  hits?: ChatHit[]
}

const MODE_KEY = 'ai-hub-chat-mode-v1'
const messagesKey = (mode: ChatModeId) => `ai-hub-chat-messages-v1:${mode}`

function welcomeMessage(mode: ChatModeId): ChatMessage {
  const m = getChatMode(mode)
  return {
    id: `welcome-${mode}`,
    role: 'assistant',
    text: m.welcome,
  }
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
  return true
}

export function loadChatMode(): ChatModeId {
  try {
    const raw = sessionStorage.getItem(MODE_KEY)
    if (
      raw === 'chat' ||
      raw === 'copywriting' ||
      raw === 'translate' ||
      raw === 'resume' ||
      raw === 'image-gen' ||
      raw === 'vision' ||
      raw === 'video' ||
      raw === 'doc-summary' ||
      raw === 'contract'
    ) {
      return raw
    }
  } catch {
    /* ignore */
  }
  return 'chat'
}

export function saveChatMode(mode: ChatModeId) {
  try {
    sessionStorage.setItem(MODE_KEY, mode)
  } catch {
    /* ignore */
  }
}

/** 读取某模式聊天记录；切页再回来仍在 */
export function loadChatMessages(mode: ChatModeId = loadChatMode()): ChatMessage[] {
  const fallback = [welcomeMessage(mode)]
  try {
    const raw = sessionStorage.getItem(messagesKey(mode))
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback
    const list = parsed.filter(isMessage)
    return list.length > 0 ? list : fallback
  } catch {
    return fallback
  }
}

export function saveChatMessages(mode: ChatModeId, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(messagesKey(mode), JSON.stringify(messages))
  } catch {
    /* ignore */
  }
}

export function clearChatMessages(mode: ChatModeId) {
  try {
    sessionStorage.removeItem(messagesKey(mode))
  } catch {
    /* ignore */
  }
}

/** @deprecated 使用 welcomeMessage via loadChatMessages */
export const CHAT_WELCOME = welcomeMessage('chat')
