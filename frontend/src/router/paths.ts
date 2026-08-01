export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:id',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
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
  STUDIO_SUGGESTIONS: '/studio/suggestions',
  USER_PROFILE: '/u/:userId',
  ADMIN: '/admin',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_PROJECTS: '/admin/projects',
  /** @deprecated 兼容旧链接，路由层重定向到 ARTICLES */
  BLOG: '/blog',
  ARTICLE_NEW: '/blog/new',
  ARTICLE_EDIT: '/blog/:id/edit',
  BLOG_DETAIL: '/blog/:id',
  PROJECT_NEW: '/projects/new',
  PROJECT_EDIT: '/projects/:id/edit',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: '发现' },
  { path: ROUTES.ARTICLES, label: '文章' },
  { path: ROUTES.PROJECTS, label: '项目' },
  { path: ROUTES.ABOUT, label: '关于' },
] as const

export function articleDetailPath(id: number | string) {
  return `/articles/${id}`
}

export function blogDetailPath(id: number | string) {
  return articleDetailPath(id)
}

export function projectDetailPath(id: number | string) {
  return `/projects/${id}`
}

/** 过渡期仍指向旧编辑页；M3 切到 Studio */
export function blogEditPath(id: number | string) {
  return `/blog/${id}/edit`
}

export function projectEditPath(id: number | string) {
  return `/projects/${id}/edit`
}

export function userProfilePath(userId: number | string) {
  return `/u/${userId}`
}
