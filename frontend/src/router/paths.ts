export const ROUTES = {
  /** 默认落地：AI 聊天 */
  CHAT: '/',
  /** 发现页 */
  DISCOVER: '/discover',
  ABOUT: '/about',
  /** AI 导航（分类产品库） */
  TOOLS: '/tools',
  TOOL_DETAIL: '/tools/:slug',
  /** 限时优惠 */
  DEALS: '/deals',
  /** AI 实用工具 */
  AI_TOOLS: '/ai-tools',
  AI_TOOL_PRODUCT_DESC: '/ai-tools/product-desc',
  /** AI 评测（复用文章） */
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:id',
  ARTICLE_NEW: '/articles/new',
  ARTICLE_EDIT: '/articles/:id/edit',
  /** 项目展映：降权，路由保留，不进主导航 */
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_NEW: '/projects/new',
  PROJECT_EDIT: '/projects/:id/edit',
  LOGIN: '/login',
  REGISTER: '/register',
  STUDIO: '/studio',
  STUDIO_ARTICLE_DRAFTS: '/studio/articles/drafts',
  STUDIO_ARTICLE_PUBLISHED: '/studio/articles/published',
  STUDIO_ARTICLE_NEW: '/studio/articles/new',
  STUDIO_ARTICLE_EDIT: '/studio/articles/:id/edit',
  STUDIO_PROJECT_DRAFTS: '/studio/projects/drafts',
  STUDIO_PROJECT_PUBLISHED: '/studio/projects/published',
  STUDIO_PROJECT_NEW: '/studio/projects/new',
  STUDIO_PROJECT_EDIT: '/studio/projects/:id/edit',
  STUDIO_PROFILE: '/studio/profile',
  STUDIO_PASSWORD: '/studio/password',
  STUDIO_SUGGESTIONS: '/studio/suggestions',
  FORGOT_PASSWORD: '/forgot-password',
  USER_PROFILE: '/u/:userId',
  USER_FOLLOWERS: '/u/:userId/followers',
  USER_FOLLOWING: '/u/:userId/following',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_ARTICLES_DELETED: '/admin/articles/deleted',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_PROJECTS_DELETED: '/admin/projects/deleted',
  ADMIN_SUGGESTIONS: '/admin/suggestions',
  ADMIN_TOOLS: '/admin/tools',
  /** @deprecated 兼容旧链接，路由层重定向到 /articles */
  BLOG: '/blog',
  /** @deprecated 请用 CHAT；保留以免旧引用报错 */
  HOME: '/',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

/** 顶栏：聊天检索为统一入口（含模糊搜）；实用技能在聊天侧栏 */
export const NAV_ITEMS = [
  { path: ROUTES.CHAT, label: '聊天' },
  { path: ROUTES.DISCOVER, label: '发现' },
  { path: ROUTES.TOOLS, label: 'AI导航' },
  { path: ROUTES.ARTICLES, label: 'AI评测' },
  { path: ROUTES.DEALS, label: '限时优惠' },
  { path: ROUTES.ABOUT, label: '关于' },
] as const

export const SITE_BRAND = 'AI Tools Hub'

export function articleDetailPath(id: number | string) {
  return `/articles/${id}`
}

export function articleEditPath(id: number | string) {
  return `/studio/articles/${id}/edit`
}

export function projectDetailPath(id: number | string) {
  return `/projects/${id}`
}

export function projectEditPath(id: number | string) {
  return `/studio/projects/${id}/edit`
}

export function toolDetailPath(slug: string) {
  return `/tools/${slug}`
}

export function userProfilePath(userId: number | string) {
  return `/u/${userId}`
}

export function userFollowersPath(userId: number | string) {
  return `/u/${userId}/followers`
}

export function userFollowingPath(userId: number | string) {
  return `/u/${userId}/following`
}
