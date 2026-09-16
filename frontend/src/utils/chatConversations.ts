import {
  clearChatMessages,
  loadChatMessages,
  type ChatMessage,
} from './chatStorage'

export type ChatConversation = {
  id: string
  title: string
  /** 创建时间：列表排序用，切换会话不改变顺序 */
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

type ConversationStore = {
  conversations: ChatConversation[]
  activeId: string
}

const STORE_KEY = 'ai-hub-chat-conversations-v1'
const DEFAULT_TITLE = '新对话'

function uid() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyConversation(): ChatConversation {
  const now = Date.now()
  return {
    id: uid(),
    title: DEFAULT_TITLE,
    createdAt: now,
    updatedAt: now,
    messages: [],
  }
}

function isConversation(value: unknown): value is ChatConversation {
  if (!value || typeof value !== 'object') return false
  const c = value as ChatConversation
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.updatedAt === 'number' &&
    Array.isArray(c.messages)
  )
}

function normalizeConversation(c: ChatConversation): ChatConversation {
  return {
    ...c,
    createdAt: typeof c.createdAt === 'number' ? c.createdAt : c.updatedAt || Date.now(),
  }
}

function readStore(): ConversationStore | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const obj = parsed as ConversationStore
    if (!Array.isArray(obj.conversations) || typeof obj.activeId !== 'string') {
      return null
    }
    const conversations = obj.conversations.filter(isConversation).map(normalizeConversation)
    if (conversations.length === 0) return null
    const activeId = conversations.some((c) => c.id === obj.activeId)
      ? obj.activeId
      : conversations[0].id
    return { conversations, activeId }
  } catch {
    return null
  }
}

function writeStore(store: ConversationStore) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch {
    /* quota / private mode */
  }
}

/** 把旧版单会话 sessionStorage 迁进第一条本地会话，只做一次 */
function migrateLegacyIfNeeded(): ConversationStore {
  const existing = readStore()
  if (existing) return existing

  const legacy = loadChatMessages()
  const first = emptyConversation()
  if (legacy.length > 0) {
    first.messages = legacy
    first.title = titleFromMessages(legacy)
    first.updatedAt = Date.now()
  }
  const store = { conversations: [first], activeId: first.id }
  writeStore(store)
  clearChatMessages()
  return store
}

function ensureStore(): ConversationStore {
  return migrateLegacyIfNeeded()
}

export function titleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.text.trim())
  if (!firstUser) return DEFAULT_TITLE
  const t = firstUser.text.replace(/\s+/g, ' ').trim()
  if (!t || t.startsWith('（仅发送了附件）')) return '附件对话'
  return t.length > 24 ? `${t.slice(0, 24)}…` : t
}

export function listLocalConversations(): ChatConversation[] {
  const store = ensureStore()
  // 按创建时间倒序；切换/发消息不改变相对顺序
  return [...store.conversations].sort((a, b) => b.createdAt - a.createdAt)
}

export function findEmptyLocalConversation(): ChatConversation | null {
  const store = ensureStore()
  return store.conversations.find((c) => c.messages.length === 0) ?? null
}

export function getActiveConversationId(): string {
  return ensureStore().activeId
}

export function getActiveMessages(): ChatMessage[] {
  const store = ensureStore()
  const active = store.conversations.find((c) => c.id === store.activeId)
  return active?.messages ?? []
}

export function setActiveConversationId(id: string): ChatMessage[] {
  const store = ensureStore()
  if (!store.conversations.some((c) => c.id === id)) {
    return getActiveMessages()
  }
  store.activeId = id
  writeStore(store)
  const active = store.conversations.find((c) => c.id === id)
  return active?.messages ?? []
}

/** 保存当前会话消息；若仍是默认标题则按首条用户消息自动命名 */
export function saveActiveMessages(messages: ChatMessage[]) {
  const store = ensureStore()
  const idx = store.conversations.findIndex((c) => c.id === store.activeId)
  if (idx < 0) return
  const prev = store.conversations[idx]
  const nextTitle =
    prev.title === DEFAULT_TITLE || prev.title === '附件对话'
      ? titleFromMessages(messages)
      : prev.title
  store.conversations[idx] = {
    ...prev,
    messages,
    title: messages.length === 0 ? DEFAULT_TITLE : nextTitle,
    // 不改 updatedAt 用于置顶；顺序只看 createdAt
    updatedAt: prev.updatedAt,
  }
  writeStore(store)
}

export type CreateLocalResult = {
  id: string
  messages: ChatMessage[]
  /** 已有空会话，复用而不是新建 */
  reused: boolean
}

export function createLocalConversation(): CreateLocalResult {
  const store = ensureStore()
  const empty = store.conversations.find((c) => c.messages.length === 0)
  if (empty) {
    store.activeId = empty.id
    writeStore(store)
    return { id: empty.id, messages: [], reused: true }
  }
  const created = emptyConversation()
  store.conversations = [created, ...store.conversations]
  store.activeId = created.id
  writeStore(store)
  return { id: created.id, messages: [], reused: false }
}

export function clearActiveMessages(): ChatMessage[] {
  saveActiveMessages([])
  return []
}

export function deleteLocalConversation(id: string): {
  activeId: string
  messages: ChatMessage[]
} {
  const store = ensureStore()
  const nextList = store.conversations.filter((c) => c.id !== id)
  if (nextList.length === 0) {
    const created = emptyConversation()
    const next = { conversations: [created], activeId: created.id }
    writeStore(next)
    return { activeId: created.id, messages: [] }
  }
  const activeId =
    store.activeId === id
      ? [...nextList].sort((a, b) => b.createdAt - a.createdAt)[0].id
      : store.activeId
  const next = { conversations: nextList, activeId }
  writeStore(next)
  const active = nextList.find((c) => c.id === activeId)
  return { activeId, messages: active?.messages ?? [] }
}

export function renameLocalConversation(id: string, title: string) {
  const store = ensureStore()
  const t = title.trim() || DEFAULT_TITLE
  const idx = store.conversations.findIndex((c) => c.id === id)
  if (idx < 0) return
  store.conversations[idx] = {
    ...store.conversations[idx],
    title: t.slice(0, 40),
    updatedAt: Date.now(),
  }
  writeStore(store)
}
