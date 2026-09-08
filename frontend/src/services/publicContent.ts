import {
  DEMO_ARTICLES,
  DEMO_PROJECTS,
  type PublicArticle,
  type PublicProject,
} from '../mocks/publicDemo'
import { fetchArticles, fetchArticleById, fetchProjectRelatedArticles } from '../api/article'
import { fetchProjects, fetchProjectById } from '../api/project'
import { fetchPublicProfile } from '../api/users'
import type { Article } from '../types/article'
import type { Project } from '../types/project'
import { resolveMediaUrl } from '../utils/mediaUrl'

type AuthorInfo = { name: string; avatarUrl?: string }

const authorCache = new Map<number, AuthorInfo>()

/** 仅本地开发：接口失败时允许显式演示降级；生产空库/失败一律真空态 */
const allowDemoFallback = import.meta.env.DEV

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

/** 优先真 API；空列表返回空（不灌演示）。仅 DEV 且接口失败时显式降级演示数据。 */
export async function loadPublicArticles(): Promise<{ items: PublicArticle[]; fromDemo: boolean }> {
  try {
    const res = await fetchArticles()
    const data = res.data.data ?? []
    return { items: await mapArticles(data), fromDemo: false }
  } catch {
    if (allowDemoFallback) return { items: DEMO_ARTICLES, fromDemo: true }
    return { items: [], fromDemo: false }
  }
}

export async function loadPublicArticle(
  id: string | number,
): Promise<{ item: PublicArticle | null; fromDemo: boolean }> {
  const demo = DEMO_ARTICLES.find((a) => String(a.id) === String(id))
  try {
    const res = await fetchArticleById(id)
    const data = res.data.data
    if (!data) {
      return { item: null, fromDemo: false }
    }
    return { item: await asPublicArticle(data), fromDemo: false }
  } catch {
    if (allowDemoFallback && demo) return { item: demo, fromDemo: true }
    return { item: null, fromDemo: false }
  }
}

export async function loadPublicProjects(): Promise<{ items: PublicProject[]; fromDemo: boolean }> {
  try {
    const res = await fetchProjects()
    const data = res.data.data ?? []
    return { items: await mapProjects(data), fromDemo: false }
  } catch {
    if (allowDemoFallback) return { items: DEMO_PROJECTS, fromDemo: true }
    return { items: [], fromDemo: false }
  }
}

export async function loadPublicProject(
  id: string | number,
): Promise<{ item: PublicProject | null; fromDemo: boolean }> {
  const demo = DEMO_PROJECTS.find((p) => String(p.id) === String(id))
  try {
    const res = await fetchProjectById(id)
    const data = res.data.data
    if (!data) {
      return { item: null, fromDemo: false }
    }
    return { item: await asPublicProject(data), fromDemo: false }
  } catch {
    if (allowDemoFallback && demo) return { item: demo, fromDemo: true }
    return { item: null, fromDemo: false }
  }
}

/** 项目展映「制作特辑」：已发布且 relatedProjectId = 该项目的文章 */
export async function loadRelatedArticlesForProject(
  projectId: string | number,
): Promise<{ items: PublicArticle[]; fromDemo: boolean }> {
  try {
    const res = await fetchProjectRelatedArticles(projectId)
    const data = res.data.data ?? []
    return { items: await mapArticles(data), fromDemo: false }
  } catch {
    if (!allowDemoFallback) return { items: [], fromDemo: false }
    const items = DEMO_ARTICLES.filter(
      (a) => a.relatedProjectId != null && String(a.relatedProjectId) === String(projectId),
    )
    return { items, fromDemo: items.length > 0 }
  }
}

export function searchDemoContent(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return { articles: [] as PublicArticle[], projects: [] as PublicProject[] }
  return {
    articles: DEMO_ARTICLES.filter(
      (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q),
    ),
    projects: DEMO_PROJECTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.techStack ?? '').toLowerCase().includes(q),
    ),
  }
}
