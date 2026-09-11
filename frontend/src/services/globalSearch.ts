import { fetchSearch } from '../api/search'
import { hubToolToCatalogHit, loadHubTools } from './toolCatalog'
import { loadPublicArticles } from './publicContent'

/** 目录检索：AI 产品（导航库）+ AI 评测；由「聊天检索」模式调用 */
export type CatalogToolHit = {
  key: string
  title: string
  category: string
  href: string
  hint?: string
}

export type CatalogReviewHit = {
  id: number
  title: string
  authorName?: string
}

export type CatalogSearchResult = {
  tools: CatalogToolHit[]
  reviews: CatalogReviewHit[]
}

const LIMIT_PER_TYPE = 8

let reviewIndexPromise: Promise<CatalogReviewHit[]> | null = null

async function ensureReviewIndex() {
  if (!reviewIndexPromise) {
    reviewIndexPromise = loadPublicArticles().then((a) =>
      a.items.map((item) => ({
        id: item.id,
        title: item.title,
        authorName: item.authorName,
      })),
    )
  }
  return reviewIndexPromise
}

export function invalidateCatalogSearchIndex() {
  reviewIndexPromise = null
}

/** @deprecated 使用 invalidateCatalogSearchIndex */
export function invalidateGlobalSearchIndex() {
  invalidateCatalogSearchIndex()
}

function match(text: string, q: string) {
  return text.toLowerCase().includes(q)
}

/**
 * 目录检索（关键词）。工具优先读 API 缓存，评测走搜索接口/本地索引。
 */
export async function searchCatalog(query: string): Promise<CatalogSearchResult> {
  const raw = query.trim()
  const q = raw.toLowerCase()
  if (!q) {
    return { tools: [], reviews: [] }
  }

  const hubTools = await loadHubTools()
  const tools = hubTools
    .filter(
      (t) =>
        match(t.name, q) ||
        match(t.category, q) ||
        match(t.summary, q) ||
        match(t.intro, q) ||
        t.keywords.some((k) => match(k, q) || q.includes(k.toLowerCase())) ||
        t.tags.some((tag) => match(tag, q)),
    )
    .slice(0, LIMIT_PER_TYPE)
    .map(hubToolToCatalogHit)

  const reviewIndex = await ensureReviewIndex()

  try {
    const res = await fetchSearch(raw)
    const items = res.data.data ?? []
    const reviews = items
      .filter((i) => i.type === 'ARTICLE')
      .map((i) => ({
        id: i.id,
        title: i.titleOrName,
        authorName: i.authorUsername,
      }))
      .slice(0, LIMIT_PER_TYPE)
    if (reviews.length > 0) {
      return { tools, reviews }
    }
  } catch {
    /* 降级本地评测索引 */
  }

  return {
    tools,
    reviews: reviewIndex.filter((r) => match(r.title, q)).slice(0, LIMIT_PER_TYPE),
  }
}

/** @deprecated 兼容旧名，请用 searchCatalog */
export async function searchGlobal(query: string): Promise<CatalogSearchResult> {
  return searchCatalog(query)
}

export function countSearchHits(r: CatalogSearchResult) {
  return r.tools.length + r.reviews.length
}

/** @deprecated */
export type GlobalSearchResult = CatalogSearchResult
