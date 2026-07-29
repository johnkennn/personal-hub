export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:id',
  ARTICLE_EDIT: '/blog/:id/edit',
  PROJECTS: '/projects',
  LOGIN: '/login',
  ARTICLE_NEW: '/blog/new',
  ADMIN_ARTICLES: '/admin/articles',
  PROJECT_DETAIL: '/projects/:id',
  PROJECT_NEW: '/projects/new',
  PROJECT_EDIT: '/projects/:id/edit',
  ADMIN_PROJECTS: '/admin/projects',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Home' },
  { path: ROUTES.ABOUT, label: 'About' },
  { path: ROUTES.BLOG, label: 'Blog' },
  { path: ROUTES.PROJECTS, label: 'Projects' },
] as const

export function blogDetailPath(id: number | string) {
  return `/blog/${id}`
}

export function projectDetailPath(id: number | string) {
  return `/projects/${id}`
}

export function blogEditPath(id: number | string) {
  return `/blog/${id}/edit`
}

export function projectEditPath(id: number | string) {
  return `/projects/${id}/edit`
}