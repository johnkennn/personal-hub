export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:id',
  PROJECTS: '/projects',
  LOGIN: '/login',
  ARTICLE_NEW: '/blog/new',
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