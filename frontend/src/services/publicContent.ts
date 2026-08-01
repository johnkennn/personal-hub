import {
  DEMO_ARTICLES,
  DEMO_PROJECTS,
  type PublicArticle,
  type PublicProject,
} from '../mocks/publicDemo'
import { fetchArticles, fetchArticleById } from '../api/blog'
import { fetchProjects, fetchProjectById } from '../api/project'
import type { Article } from '../types/article'
import type { Project } from '../types/project'

function asPublicArticle(a: Article): PublicArticle {
  return {
    ...a,
    authorId: 0,
    authorName: '创作者',
  }
}

function asPublicProject(p: Project): PublicProject {
  return {
    ...p,
    authorId: 0,
    authorName: '创作者',
  }
}

/** 优先真 API；失败或空列表时用演示数据，保证现场可演 */
export async function loadPublicArticles(): Promise<{ items: PublicArticle[]; fromDemo: boolean }> {
  try {
    const res = await fetchArticles()
    const data = res.data.data ?? []
    if (data.length === 0) {
      return { items: DEMO_ARTICLES, fromDemo: true }
    }
    return { items: data.map(asPublicArticle), fromDemo: false }
  } catch {
    return { items: DEMO_ARTICLES, fromDemo: true }
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
      return { item: demo ?? null, fromDemo: Boolean(demo) }
    }
    return { item: asPublicArticle(data), fromDemo: false }
  } catch {
    return { item: demo ?? null, fromDemo: Boolean(demo) }
  }
}

export async function loadPublicProjects(): Promise<{ items: PublicProject[]; fromDemo: boolean }> {
  try {
    const res = await fetchProjects()
    const data = res.data.data ?? []
    if (data.length === 0) {
      return { items: DEMO_PROJECTS, fromDemo: true }
    }
    return { items: data.map(asPublicProject), fromDemo: false }
  } catch {
    return { items: DEMO_PROJECTS, fromDemo: true }
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
      return { item: demo ?? null, fromDemo: Boolean(demo) }
    }
    return { item: asPublicProject(data), fromDemo: false }
  } catch {
    return { item: demo ?? null, fromDemo: Boolean(demo) }
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
