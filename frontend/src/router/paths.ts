export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  BLOG: '/blog',
  PROJECTS: '/projects',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
