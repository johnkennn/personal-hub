import { useEffect } from 'react'

export type PageMetaInput = {
  title: string
  description?: string
  /** 绝对或站点相对路径；会尽量转成绝对 URL 写入 og:image */
  image?: string
  url?: string
  type?: 'website' | 'article'
}

const SITE = '小智AI'
const DEFAULT_DESC =
  '小智陪你发现分类齐全的 AI 产品、试用站内能力、阅读真实评测，并了解各家 AI 优惠。'

function absoluteUrl(pathOrUrl: string | undefined): string | undefined {
  if (!pathOrUrl) return undefined
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('data:')
  ) {
    return pathOrUrl
  }
  if (typeof window === 'undefined') return pathOrUrl
  if (pathOrUrl.startsWith('/')) {
    return `${window.location.origin}${pathOrUrl}`
  }
  return pathOrUrl
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 客户端写入 title / description / Open Graph。
 * 说明：微信等爬虫通常不执行 SPA JS；真正外链预览需后续 SSR 或后端分享页。
 * 本期覆盖浏览器标签、部分抓取器，以及页面内分享卡片体验。
 */
export function usePageMeta(meta: PageMetaInput | null) {
  useEffect(() => {
    if (!meta) return

    const pageTitle = meta.title.includes(SITE) ? meta.title : `${meta.title} · ${SITE}`
    const description = (meta.description?.trim() || DEFAULT_DESC).slice(0, 160)
    const url = absoluteUrl(meta.url) || (typeof window !== 'undefined' ? window.location.href : '')
    const image = absoluteUrl(meta.image) || absoluteUrl('/favicon.svg')
    const type = meta.type ?? 'website'

    const prevTitle = document.title
    document.title = pageTitle

    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:site_name', SITE)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:title', pageTitle)
    upsertMeta('property', 'og:description', description)
    if (url) upsertMeta('property', 'og:url', url)
    if (image) upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', pageTitle)
    upsertMeta('name', 'twitter:description', description)
    if (image) upsertMeta('name', 'twitter:image', image)

    return () => {
      document.title = prevTitle
    }
  }, [meta?.title, meta?.description, meta?.image, meta?.url, meta?.type])
}

export const PAGE_META_DEFAULTS = {
  site: SITE,
  description: DEFAULT_DESC,
} as const
