export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  BLOG: '/blog',
  PROJECTS: '/projects',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]

export const NAV_ITEMS = [
  { path: ROUTES.HOME, label: 'Home' },
  { path: ROUTES.ABOUT, label: 'About' },
  { path: ROUTES.BLOG, label: 'Blog' },
  { path: ROUTES.PROJECTS, label: 'Projects' },
] as const
