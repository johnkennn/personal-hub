import type { PublicArticle, PublicProject } from '../mocks/publicDemo'
import { fetchArticles, fetchArticleById, fetchProjectRelatedArticles } from '../api/article'
import { fetchProjects, fetchProjectById } from '../api/project'
import { fetchPublicProfile } from '../api/users'
import type { Article } from '../types/article'
import type { Project } from '../types/project'
import { resolveMediaUrl } from '../utils/mediaUrl'

type AuthorInfo = { name: string; avatarUrl?: string }

const authorCache = new Map<number, AuthorInfo>()

async function loadAuthor(authorId?: number | null): Promise<AuthorInfo> {
  if (!authorId) return { name: '未知作者' }
  const cached = authorCache.get(authorId)
  if (cached) return cached
  try {
    const res = await fetchPublicProfile(authorId)
    const p = res.data.data
    const info: AuthorInfo = {
      name: (p.nickname?.trim() || p.username || `用户${authorId}`).trim(),
      avatarUrl: resolveMediaUrl(p.avatarUrl) || undefined,
    }
    authorCache.set(authorId, info)
    return info
  } catch {
    const fallback = { name: `用户${authorId}` }
    authorCache.set(authorId, fallback)
    return fallback
  }
}

async function asPublicArticle(a: Article): Promise<PublicArticle> {
  const authorId = a.authorId ?? 0
  const author = await loadAuthor(authorId || null)
  return {
    ...a,
    authorId,
    authorName: author.name,
    avatarUrl: author.avatarUrl,
  }
}

async function asPublicProject(p: Project): Promise<PublicProject> {
  const authorId = p.authorId ?? 0
  const author = await loadAuthor(authorId || null)
  return {
    ...p,
    authorId,
    authorName: author.name,
    avatarUrl: author.avatarUrl,
  }
}

async function mapArticles(list: Article[]) {
  return Promise.all(list.map(asPublicArticle))
}

async function mapProjects(list: Project[]) {
  return Promise.all(list.map(asPublicProject))
}

/** 只走真 API：空库 / 失败一律真空态，不再注入演示数据 */
export async function loadPublicArticles(): Promise<{ items: PublicArticle[] }> {
  try {
    const res = await fetchArticles()
    return { items: await mapArticles(res.data.data ?? []) }
  } catch {
    return { items: [] }
  }
}

export async function loadPublicArticle(
  id: string | number,
): Promise<{ item: PublicArticle | null }> {
  try {
    const res = await fetchArticleById(id)
    const data = res.data.data
    if (!data) return { item: null }
    return { item: await asPublicArticle(data) }
  } catch {
    return { item: null }
  }
}

export async function loadPublicProjects(): Promise<{ items: PublicProject[] }> {
  try {
    const res = await fetchProjects()
    return { items: await mapProjects(res.data.data ?? []) }
  } catch {
    return { items: [] }
  }
}

export async function loadPublicProject(
  id: string | number,
): Promise<{ item: PublicProject | null }> {
  try {
    const res = await fetchProjectById(id)
    const data = res.data.data
    if (!data) return { item: null }
    return { item: await asPublicProject(data) }
  } catch {
    return { item: null }
  }
}

/** 发现页目录：合并请求并缓存，避免 React StrictMode 开发态打两遍 */
let discoverCatalogPromise: Promise<{
  articles: PublicArticle[]
  projects: PublicProject[]
}> | null = null

export function loadDiscoverCatalog() {
  if (!discoverCatalogPromise) {
    discoverCatalogPromise = Promise.all([loadPublicArticles(), loadPublicProjects()]).then(
      ([a, p]) => ({ articles: a.items, projects: p.items }),
    )
  }
  return discoverCatalogPromise
}

/** 项目展映「制作特辑」 */
export async function loadRelatedArticlesForProject(
  projectId: string | number,
): Promise<{ items: PublicArticle[] }> {
  try {
    const res = await fetchProjectRelatedArticles(projectId)
    return { items: await mapArticles(res.data.data ?? []) }
  } catch {
    return { items: [] }
  }
}
