import { createBrowserRouter } from 'react-router-dom'

import { MainLayout } from '../layouts/MainLayout'
import { AboutPage } from '../pages/About'
import { BlogPage } from '../pages/Blog'
import { BlogDetailPage } from '../pages/Blog/Details'
import { HomePage } from '../pages/Home'
import { ProjectsPage } from '../pages/Projects'
import { LoginPage } from '../pages/Login'
import { ArticleNewPage } from '../pages/Blog/New'
import { ProjectDetailPage } from '../pages/Projects/Details'
import { ProjectNewPage } from '../pages/Projects/New'
import { ArticleEditPage } from '../pages/Blog/Edit'
import { ProjectEditPage } from '../pages/Projects/Edit'
import { AdminArticlesPage } from '../pages/Admin/Articles'
import { AdminProjectsPage } from '../pages/Admin/Projects'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/new', element: <ArticleNewPage /> },
      { path: 'blog/:id/edit', element: <ArticleEditPage /> },
      { path: 'blog/:id', element: <BlogDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/new', element: <ProjectNewPage /> },
      { path: 'projects/:id/edit', element: <ProjectEditPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'admin/articles', element: <AdminArticlesPage /> },
      { path: 'admin/projects', element: <AdminProjectsPage /> },
    ],
  },
])
