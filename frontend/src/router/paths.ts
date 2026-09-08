export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:id',
  ARTICLE_NEW: '/articles/new',
  ARTICLE_EDIT: '/articles/:id/edit',
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
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_SUGGESTIONS: '/admin/suggestions',
  /** @deprecated 兼容旧链接，路由层重定向到 /articles */
  BLOG: '/blog',
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

export function articleEditPath(id: number | string) {
  return `/studio/articles/${id}/edit`
}

export function projectDetailPath(id: number | string) {
  return `/projects/${id}`
}

export function projectEditPath(id: number | string) {
  return `/studio/projects/${id}/edit`
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
