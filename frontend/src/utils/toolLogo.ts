/**
 * 工具 Logo 地址解析：国内网络常打不开 Google favicon，
 * 统一改写到更可访问的 DuckDuckGo 图标源；站内 /media 仍走 resolveMediaUrl。
 */
import { resolveMediaUrl } from './mediaUrl'

/** 从各类 favicon / 官网 URL 里尽量抽出 hostname */
export function hostnameFromUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const host = new URL(withProto).hostname.replace(/^www\./, '')
    return host || null
  } catch {
    return null
  }
}

/** 国内更稳的站点图标（返回 PNG/ICO，可直接给 <img>） */
export function duckDuckGoIconUrl(hostname: string, size = 128): string {
  const host = hostname.replace(/^www\./, '')
  // 带 size 参数时部分环境更稳；无 size 也可用
  void size
  return `https://icons.duckduckgo.com/ip3/${host}.ico`
}

/** Google s2 favicon → 提取 domain */
function domainFromGoogleFavicon(url: string): string | null {
  try {
    const u = new URL(url)
    if (!/google\.[^/]+$/i.test(u.hostname) && !u.hostname.endsWith('gstatic.com')) {
      return null
    }
    const domain = u.searchParams.get('domain')
    if (domain) return domain.replace(/^www\./, '')
    // 兼容 path 形式
    return null
  } catch {
    return null
  }
}

/**
 * 展示用 Logo URL：
 * - 空 → undefined（组件显示首字）
 * - Google favicon → 改写为 DuckDuckGo
 * - 相对路径 → 拼 API
 * - 其它 http(s) 原样
 */
export function resolveToolLogoUrl(logoUrl: string | null | undefined): string | undefined {
  if (!logoUrl?.trim()) return undefined
  const raw = logoUrl.trim()

  const fromGoogle = domainFromGoogleFavicon(raw)
  if (fromGoogle) return duckDuckGoIconUrl(fromGoogle)

  // 前端 public/logos 静态资源：同源路径，不要拼后端 API 域名
  if (raw.startsWith('/logos/')) return raw

  // 已是 duckduckgo / 站内上传 / 其它 CDN
  return resolveMediaUrl(raw)
}

/** 管理端：根据官网生成默认 Logo（勿再用 Google） */
export function faviconLogoFromWebsite(websiteUrl: string): string {
  const host = hostnameFromUrl(websiteUrl)
  if (!host) return ''
  return duckDuckGoIconUrl(host)
}
