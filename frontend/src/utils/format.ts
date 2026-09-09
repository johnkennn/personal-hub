export function formatDateTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function excerpt(text: string, max = 120) {
  const normalized = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[#>*_`~\[\]]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max)}…`
}

export function splitTechStack(techStack: string | null | undefined, limit = 12) {
  if (!techStack) return []
  return techStack
    .split(/[,，/|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, limit)
}

/** 距到期彻底删除的剩余时间文案 */
export function formatPurgeRemaining(purgeAt?: string | null) {
  if (!purgeAt) return '—'
  const end = new Date(purgeAt).getTime()
  if (Number.isNaN(end)) return '—'
  const ms = end - Date.now()
  if (ms <= 0) return '即将清除'
  const totalMinutes = Math.floor(ms / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  if (days > 0) return `${days} 天 ${hours} 小时`
  if (hours > 0) {
    const minutes = totalMinutes % 60
    return `${hours} 小时 ${minutes} 分`
  }
  return `${Math.max(totalMinutes, 1)} 分`
}

