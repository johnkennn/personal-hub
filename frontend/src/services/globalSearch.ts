import { fetchSearch } from '../api/search'
import { SEED_TOOLS, seedToolToCatalogHit } from '../data/seedTools'
import { loadPublicArticles } from './publicContent'

/** 目录检索：AI 产品（导航库）+ AI 评测；由「聊天检索」模式调用 */
export type CatalogToolHit = {
  /** 稳定键；有真实 id 后可改用数字 */
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

function searchSeedTools(q: string): CatalogToolHit[] {
  return SEED_TOOLS.filter(
    (t) =>
      match(t.name, q) ||
      match(t.category, q) ||
      match(t.summary, q) ||
      t.keywords.some((k) => match(k, q) || q.includes(k.toLowerCase())) ||
      t.tags.some((tag) => match(tag, q)),
  )
    .slice(0, LIMIT_PER_TYPE)
    .map(seedToolToCatalogHit)
}

/**
 * 目录检索（关键词）。预留同一返回结构，便于日后换成语义检索 API。
 */
export async function searchCatalog(query: string): Promise<CatalogSearchResult> {
  const raw = query.trim()
  const q = raw.toLowerCase()
  if (!q) {
    return { tools: [], reviews: [] }
  }

  const tools = searchSeedTools(q)
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
