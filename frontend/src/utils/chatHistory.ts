import type { ChatMessage } from './chatStorage'

/** 与后端双限制对齐：约 8 轮、总字符上限 */
export const CHAT_HISTORY_MAX_MESSAGES = 16
export const CHAT_HISTORY_MAX_CHARS = 10_000

export type ChatHistoryPayloadItem = {
  role: 'user' | 'assistant'
  content: string
}

function stripNoise(text: string): string {
  return text
    .replace(/\s*（参考信息：用户本地日期为[^）]*）\s*/g, '')
    .replace(/\s*<!--seed:bulk-v1-->\s*/g, '')
    .trim()
}

/**
 * 从当前会话消息中截取要发给模型的上下文（不含本轮刚发出的用户句，由调用方决定切片）。
 * 双限制：条数 + 总字符；从最新往旧保留。
 */
export function buildChatHistoryPayload(
  messages: ChatMessage[],
  opts?: { maxMessages?: number; maxChars?: number },
): ChatHistoryPayloadItem[] {
  const maxMessages = opts?.maxMessages ?? CHAT_HISTORY_MAX_MESSAGES
  const maxChars = opts?.maxChars ?? CHAT_HISTORY_MAX_CHARS

  const turns: ChatHistoryPayloadItem[] = []
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue
    const content = stripNoise(m.text || '')
    if (!content) continue
    // 跳过还在流式生成的空助手气泡
    if (m.role === 'assistant' && !content.trim()) continue
    turns.push({
      role: m.role,
      content: content.length > 2000 ? `${content.slice(0, 2000)}…` : content,
    })
  }

  const recent = turns.length <= maxMessages ? turns : turns.slice(-maxMessages)
  let total = 0
  let from = recent.length
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const len = recent[i].content.length
    if (total + len > maxChars) break
    total += len
    from = i
  }
  return from >= recent.length ? [] : recent.slice(from)
}
