import { Route, Routes } from 'react-router-dom'

import { AboutPage } from '../pages/About'
import { BlogPage } from '../pages/Blog'
import { HomePage } from '../pages/Home'
import { ProjectsPage } from '../pages/Projects'
import { ROUTES } from './paths'

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.BLOG} element={<BlogPage />} />
      <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
    </Routes>
  )
}
