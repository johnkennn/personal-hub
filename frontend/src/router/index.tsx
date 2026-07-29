import { createBrowserRouter } from 'react-router-dom'

import { MainLayout } from '../layouts/MainLayout'
import { AboutPage } from '../pages/About'
import { BlogPage } from '../pages/Blog'
import { BlogDetailPage } from '../pages/Blog/Details'
import { HomePage } from '../pages/Home'
import { ProjectsPage } from '../pages/Projects'
import { LoginPage } from '../pages/Login'
import { ArticleNewPage } from '../pages/Blog/New'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/new', element: <ArticleNewPage /> },
      { path: 'blog/:id', element: <BlogDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
])
