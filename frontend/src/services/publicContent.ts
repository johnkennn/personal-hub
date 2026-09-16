import type { PublicArticle, PublicProject } from '../mocks/publicDemo'
import {
  fetchArticles,
  fetchArticleById,
  fetchArticleForManage,
  fetchProjectRelatedArticles,
  fetchToolRelatedArticles,
} from '../api/article'
import { fetchProjects, fetchProjectById, fetchProjectForManage } from '../api/project'
import {
  fetchAdminDeletedArticle,
  fetchAdminDeletedProject,
  type AdminDeletedContent,
} from '../api/adminDeleted'
import { fetchPublicProfile } from '../api/users'
import type { Article } from '../types/article'
import type { Project } from '../types/project'
import { isAdmin, isLoggedIn } from '../utils/authStorage'
import { resolveMediaUrl } from '../utils/mediaUrl'

type AuthorInfo = { name: string; avatarUrl?: string }

export type ViewerLoadResult<T> = {
  item: T | null
  ownerPreview: boolean
  adminDeletedPreview: boolean
  deletedAt?: string | null
  purgeAt?: string | null
}

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

async function asPublicArticleFromDeleted(d: AdminDeletedContent): Promise<PublicArticle> {
  const author = await loadAuthor(d.authorId)
  return {
    id: d.id,
    title: d.title,
    content: d.body ?? '',
    published: Boolean(d.published),
    createdAt: d.createdAt || d.deletedAt,
    updatedAt: d.updatedAt || d.deletedAt,
    authorId: d.authorId,
    authorName: d.authorName || author.name,
    avatarUrl: author.avatarUrl,
    coverUrl: d.coverUrl,
    relatedProjectId: d.relatedProjectId,
  }
}

async function asPublicProjectFromDeleted(d: AdminDeletedContent): Promise<PublicProject> {
  const author = await loadAuthor(d.authorId)
  return {
    id: d.id,
    name: d.title,
    description: d.body ?? '',
    techStack: d.techStack ?? null,
    repoUrl: d.repoUrl ?? null,
    demoUrl: d.demoUrl ?? null,
    published: Boolean(d.published),
    createdAt: d.createdAt || d.deletedAt,
    updatedAt: d.updatedAt || d.deletedAt,
    authorId: d.authorId,
    authorName: d.authorName || author.name,
    avatarUrl: author.avatarUrl,
    coverUrl: d.coverUrl,
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

/** 公开可读则走公开接口；草稿仅作者可通过 manage 预览；已删内容管理员可预览 */
export async function loadArticleForViewer(
  id: string | number,
): Promise<ViewerLoadResult<PublicArticle>> {
  const pub = await loadPublicArticle(id)
  if (pub.item) {
    return { item: pub.item, ownerPreview: false, adminDeletedPreview: false }
  }
  if (!isLoggedIn()) {
    return { item: null, ownerPreview: false, adminDeletedPreview: false }
  }
  try {
    const res = await fetchArticleForManage(id)
    const data = res.data.data
    if (data) {
      return {
        item: await asPublicArticle(data),
        ownerPreview: true,
        adminDeletedPreview: false,
      }
    }
  } catch {
    // continue
  }
  if (isAdmin()) {
    try {
      const res = await fetchAdminDeletedArticle(id)
      const data = res.data.data
      if (data) {
        return {
          item: await asPublicArticleFromDeleted(data),
          ownerPreview: false,
          adminDeletedPreview: true,
          deletedAt: data.deletedAt,
          purgeAt: data.purgeAt,
        }
      }
    } catch {
      // fall through
    }
  }
  return { item: null, ownerPreview: false, adminDeletedPreview: false }
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

/** 公开可读则走公开接口；草稿仅作者可通过 manage 预览；已删内容管理员可预览 */
export async function loadProjectForViewer(
  id: string | number,
): Promise<ViewerLoadResult<PublicProject>> {
  const pub = await loadPublicProject(id)
  if (pub.item) {
    return { item: pub.item, ownerPreview: false, adminDeletedPreview: false }
  }
  if (!isLoggedIn()) {
    return { item: null, ownerPreview: false, adminDeletedPreview: false }
  }
  try {
    const res = await fetchProjectForManage(id)
    const data = res.data.data
    if (data) {
      return {
        item: await asPublicProject(data),
        ownerPreview: true,
        adminDeletedPreview: false,
      }
    }
  } catch {
    // continue
  }
  if (isAdmin()) {
    try {
      const res = await fetchAdminDeletedProject(id)
      const data = res.data.data
      if (data) {
        return {
          item: await asPublicProjectFromDeleted(data),
          ownerPreview: false,
          adminDeletedPreview: true,
          deletedAt: data.deletedAt,
          purgeAt: data.purgeAt,
        }
      }
    } catch {
      // fall through
    }
  }
  return { item: null, ownerPreview: false, adminDeletedPreview: false }
}

/** 发现页目录：只合并进行中的请求；完成后不常驻缓存，避免写操作后仍看到旧数据 */
let discoverCatalogInflight: Promise<{
  articles: PublicArticle[]
  projects: PublicProject[]
}> | null = null

export function invalidateDiscoverCatalog() {
  discoverCatalogInflight = null
}

export function loadDiscoverCatalog(force = false) {
  if (force) invalidateDiscoverCatalog()
  if (!discoverCatalogInflight) {
    const req = Promise.all([loadPublicArticles(), loadPublicProjects()]).then(([a, p]) => ({
      articles: a.items,
      projects: p.items,
    }))
    discoverCatalogInflight = req
    void req.finally(() => {
      if (discoverCatalogInflight === req) {
        discoverCatalogInflight = null
      }
    })
  }
  return discoverCatalogInflight
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

/** 工具详情「相关评测」：顺带补全作者昵称 */
export async function loadRelatedArticlesForTool(
  slug: string,
): Promise<{ items: PublicArticle[] }> {
  try {
    const res = await fetchToolRelatedArticles(slug)
    return { items: await mapArticles(res.data.data ?? []) }
  } catch {
    return { items: [] }
  }
}
