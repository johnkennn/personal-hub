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
import { fetchFeedHot, fetchFeedLatest, type FeedItem } from '../api/feed'
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
const authorInflight = new Map<number, Promise<AuthorInfo>>()

async function loadAuthor(authorId?: number | null): Promise<AuthorInfo> {
  if (!authorId) return { name: '未知作者' }
  const cached = authorCache.get(authorId)
  if (cached) return cached
  const pending = authorInflight.get(authorId)
  if (pending) return pending

  const task = (async () => {
    try {
      const res = await fetchPublicProfile(authorId)
      const p = res.data?.data
      if (!p) throw new Error('empty profile')
      const info: AuthorInfo = {
        name: (p.nickname?.trim() || p.username || `用户${authorId}`).trim(),
        avatarUrl: resolveMediaUrl(p.avatarUrl) || undefined,
      }
      authorCache.set(authorId, info)
      return info
    } catch {
      // 失败不写入缓存，避免一次超时永久显示「用户N」
      return { name: `用户${authorId}` }
    } finally {
      authorInflight.delete(authorId)
    }
  })()

  authorInflight.set(authorId, task)
  return task
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
  const authorIds = [
    ...new Set(
      list.map((a) => a.authorId).filter((id): id is number => typeof id === 'number' && id > 0),
    ),
  ]
  await Promise.all(authorIds.map((id) => loadAuthor(id)))
  return Promise.all(list.map(asPublicArticle))
}

/** 用 Feed 补全作者展示名/头像与服务端点赞（避免列表 N+1 失败时落到「用户N」） */
async function enrichArticlesFromFeed(items: PublicArticle[]): Promise<PublicArticle[]> {
  if (!items.length) return items
  try {
    const [latestRes, hotRes] = await Promise.all([
      fetchFeedLatest(100).catch(() => null),
      fetchFeedHot(100).catch(() => null),
    ])
    const byId = new Map<number, FeedItem>()
    for (const row of latestRes?.data.data ?? []) {
      if (row.type === 'ARTICLE') byId.set(row.id, row)
    }
    for (const row of hotRes?.data.data ?? []) {
      if (row.type !== 'ARTICLE') continue
      const prev = byId.get(row.id)
      // latest 里 likeCount 恒为 0，点赞以 hot 为准
      byId.set(row.id, prev ? { ...prev, likeCount: row.likeCount } : row)
    }
    return items.map((a) => {
      const f = byId.get(a.id)
      if (!f) return a
      const display =
        (f.authorDisplayName?.trim() || f.authorUsername?.trim() || '').trim() || a.authorName
      const avatar = resolveMediaUrl(f.authorAvatarUrl) || a.avatarUrl
      return {
        ...a,
        authorName: display,
        avatarUrl: avatar,
        likeCount: typeof f.likeCount === 'number' ? f.likeCount : a.likeCount,
      }
    })
  } catch {
    return items
  }
}

async function mapProjects(list: Project[]) {
  return Promise.all(list.map(asPublicProject))
}

/** 只走真 API：空库 / 失败一律真空态，不再注入演示数据 */
export async function loadPublicArticles(): Promise<{ items: PublicArticle[] }> {
  try {
    const res = await fetchArticles()
    const items = await mapArticles(res.data.data ?? [])
    return { items: await enrichArticlesFromFeed(items) }
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
    const items = await mapArticles(res.data.data ?? [])
    return { items: await enrichArticlesFromFeed(items) }
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
    const items = await mapArticles(res.data.data ?? [])
    return { items: await enrichArticlesFromFeed(items) }
  } catch {
    return { items: [] }
  }
}
