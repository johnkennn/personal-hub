import { DEMO_CREATORS } from '../mocks/publicDemo'
import { fetchSearch } from '../api/search'
import { loadPublicArticles, loadPublicProjects } from './publicContent'

export type SearchAuthorHit = {
  id: number
  name: string
  username?: string
}

export type SearchContentHit = {
  id: number
  title: string
  authorName?: string
}

export type GlobalSearchResult = {
  authors: SearchAuthorHit[]
  articles: SearchContentHit[]
  projects: SearchContentHit[]
}

const LIMIT_PER_TYPE = 8

let indexPromise: Promise<{
  authors: SearchAuthorHit[]
  articles: SearchContentHit[]
  projects: SearchContentHit[]
}> | null = null

function buildAuthorIndex(
  articles: { authorId: number; authorName: string }[],
  projects: { authorId: number; authorName: string }[],
): SearchAuthorHit[] {
  const map = new Map<number, SearchAuthorHit>()
  // 演示创作者仅本地开发注入，避免生产空库搜索出假作者
  if (import.meta.env.DEV) {
    for (const c of DEMO_CREATORS) {
      map.set(c.id, {
        id: c.id,
        name: c.displayName || c.username,
        username: c.username,
      })
    }
  }
  for (const a of articles) {
    if (!a.authorId) continue
    const prev = map.get(a.authorId)
    map.set(a.authorId, {
      id: a.authorId,
      name: a.authorName || prev?.name || `用户${a.authorId}`,
      username: prev?.username,
    })
  }
  for (const p of projects) {
    if (!p.authorId) continue
    const prev = map.get(p.authorId)
    map.set(p.authorId, {
      id: p.authorId,
      name: p.authorName || prev?.name || `用户${p.authorId}`,
      username: prev?.username,
    })
  }
  return [...map.values()]
}

async function ensureIndex() {
  if (!indexPromise) {
    indexPromise = Promise.all([loadPublicArticles(), loadPublicProjects()]).then(([a, p]) => ({
      authors: buildAuthorIndex(a.items, p.items),
      articles: a.items.map((item) => ({
        id: item.id,
        title: item.title,
        authorName: item.authorName,
      })),
      projects: p.items.map((item) => ({
        id: item.id,
        title: item.name,
        authorName: item.authorName,
      })),
    }))
  }
  return indexPromise
}

/** 清除缓存（发布后可选刷新）；一般无需调用 */
export function invalidateGlobalSearchIndex() {
  indexPromise = null
}

function match(text: string, q: string) {
  return text.toLowerCase().includes(q)
}

/**
 * 模糊搜索作者 / 文章 / 项目。
 * 文章与项目优先走 /api/search；失败时用本地公开列表降级。
 * 作者从公开内容作者索引 + 演示创作者中匹配。
 */
export async function searchGlobal(query: string): Promise<GlobalSearchResult> {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { authors: [], articles: [], projects: [] }
  }

  const index = await ensureIndex()
  const authors = index.authors
    .filter(
      (a) =>
        match(a.name, q) ||
        (a.username ? match(a.username, q) : false) ||
        match(String(a.id), q),
    )
    .slice(0, LIMIT_PER_TYPE)

  try {
    const res = await fetchSearch(query.trim())
    const items = res.data.data ?? []
    const articles = items
      .filter((i) => i.type === 'ARTICLE')
      .map((i) => ({
        id: i.id,
        title: i.titleOrName,
        authorName: i.authorUsername,
      }))
      .slice(0, LIMIT_PER_TYPE)
    const projects = items
      .filter((i) => i.type === 'PROJECT')
      .map((i) => ({
        id: i.id,
        title: i.titleOrName,
        authorName: i.authorUsername,
      }))
      .slice(0, LIMIT_PER_TYPE)

    // API 有结果则用 API；全空时再试本地（含演示）
    if (articles.length + projects.length > 0) {
      return { authors, articles, projects }
    }
  } catch {
    /* 降级本地 */
  }

  return {
    authors,
    articles: index.articles.filter((a) => match(a.title, q)).slice(0, LIMIT_PER_TYPE),
    projects: index.projects.filter((p) => match(p.title, q)).slice(0, LIMIT_PER_TYPE),
  }
}

export function countSearchHits(r: GlobalSearchResult) {
  return r.authors.length + r.articles.length + r.projects.length
}
