const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080'

/** 将后端返回的 /media/... 转为浏览器可加载的绝对地址；外链原样返回 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/')) {
    const base = apiBase.replace(/\/$/, '')
    return `${base}${url}`
  }
  return url
}
