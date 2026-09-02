const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

/** 后端 /media/... → 浏览器可打开的地址；http(s) 外链原样返回 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/')) {
    return `${apiBase.replace(/\/$/, '')}${url}`
  }
  return url
}