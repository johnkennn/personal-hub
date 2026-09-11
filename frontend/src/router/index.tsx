import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'

import { MainLayout } from '../layouts/MainLayout'
import { AboutPage } from '../pages/About'
import { ArticlesPage } from '../pages/Articles'
import { ArticleDetailPage } from '../pages/Articles/Details'
import { HomePage } from '../pages/Home'
import { ChatPage } from '../pages/Chat'
import { ToolsPage } from '../pages/Tools'
import { ToolDetailPage } from '../pages/Tools/Details'
import { DealsPage } from '../pages/Deals'
import { AiToolsPage } from '../pages/AiTools'
import { ProductDescPage } from '../pages/AiTools/ProductDesc'
import { ProjectsPage } from '../pages/Projects'
import { LoginPage } from '../pages/Login'
import { RegisterPage } from '../pages/Register'
import { ArticleNewPage } from '../pages/Articles/New'
import { ProjectDetailPage } from '../pages/Projects/Details'
import { ProjectNewPage } from '../pages/Projects/New'
import { ArticleEditPage } from '../pages/Articles/Edit'
import { ProjectEditPage } from '../pages/Projects/Edit'
import { AdminArticlesPage } from '../pages/Admin/Articles'
import { AdminDeletedArticlesPage } from '../pages/Admin/DeletedArticles'
import { AdminDeletedProjectsPage } from '../pages/Admin/DeletedProjects'
import { AdminProjectsPage } from '../pages/Admin/Projects'
import { AdminUsersPage } from '../pages/Admin/Users'
import { AdminSuggestionsPage } from '../pages/Admin/Suggestions'
import { AdminToolsPage } from '../pages/Admin/Tools'
import { AdminHomePage } from '../pages/Admin'
import {
  StudioArticleDraftsPage,
  StudioArticlePublishedPage,
  StudioHomePage,
  StudioProjectDraftsPage,
  StudioProjectPublishedPage,
} from '../pages/Studio'
import { UserProfilePage } from '../pages/UserProfile'
import { UserFollowersPage, UserFollowingPage } from '../pages/UserProfile/FollowList'
import { ProfileSettingsPage } from '../pages/Studio/ProfileSettings'
import { ChangePasswordPage } from '../pages/Studio/ChangePassword'
import { SuggestionsPage } from '../pages/Studio/Suggestions'
import { ForgotPasswordPage } from '../pages/ForgotPassword'

/** 旧 /blog/:id → /articles/:id */
function LegacyBlogDetailRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/articles/${id}` : '/articles'} replace />
}

function LegacyBlogEditRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/articles/${id}/edit` : '/articles'} replace />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <ChatPage /> },
      { path: 'chat', element: <Navigate to="/" replace /> },
      { path: 'discover', element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'tools/:slug', element: <ToolDetailPage /> },
      { path: 'deals', element: <DealsPage /> },
      { path: 'ai-tools', element: <AiToolsPage /> },
      { path: 'ai-tools/product-desc', element: <ProductDescPage /> },

      { path: 'articles', element: <ArticlesPage /> },
      { path: 'articles/new', element: <ArticleNewPage /> },
      { path: 'articles/:id/edit', element: <ArticleEditPage /> },
      { path: 'articles/:id', element: <ArticleDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/new', element: <ProjectNewPage /> },
      { path: 'projects/:id/edit', element: <ProjectEditPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },

      // 兼容旧 /blog 路径
      { path: 'blog', element: <Navigate to="/articles" replace /> },
      { path: 'blog/new', element: <Navigate to="/articles/new" replace /> },
      { path: 'blog/:id/edit', element: <LegacyBlogEditRedirect /> },
      { path: 'blog/:id', element: <LegacyBlogDetailRedirect /> },

      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'u/:userId', element: <UserProfilePage /> },
      { path: 'u/:userId/followers', element: <UserFollowersPage /> },
      { path: 'u/:userId/following', element: <UserFollowingPage /> },

      { path: 'studio', element: <StudioHomePage /> },
      { path: 'studio/articles/drafts', element: <StudioArticleDraftsPage /> },
      { path: 'studio/articles/published', element: <StudioArticlePublishedPage /> },
      { path: 'studio/articles/new', element: <ArticleNewPage /> },
      { path: 'studio/articles/:id/edit', element: <ArticleEditPage /> },
      { path: 'studio/projects/drafts', element: <StudioProjectDraftsPage /> },
      { path: 'studio/projects/published', element: <StudioProjectPublishedPage /> },
      { path: 'studio/projects/new', element: <ProjectNewPage /> },
      { path: 'studio/projects/:id/edit', element: <ProjectEditPage /> },
      { path: 'studio/profile', element: <ProfileSettingsPage /> },
      { path: 'studio/password', element: <ChangePasswordPage /> },
      { path: 'studio/suggestions', element: <SuggestionsPage /> },
      { path: 'admin', element: <AdminHomePage /> },
      { path: 'admin/users', element: <AdminUsersPage /> },
      { path: 'admin/articles', element: <AdminArticlesPage /> },
      { path: 'admin/articles/deleted', element: <AdminDeletedArticlesPage /> },
      { path: 'admin/projects', element: <AdminProjectsPage /> },
      { path: 'admin/projects/deleted', element: <AdminDeletedProjectsPage /> },
      { path: 'admin/suggestions', element: <AdminSuggestionsPage /> },
      { path: 'admin/tools', element: <AdminToolsPage /> },
    ],
  },
])
