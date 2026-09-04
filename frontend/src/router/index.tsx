import { createBrowserRouter, Navigate } from 'react-router-dom'

import { MainLayout } from '../layouts/MainLayout'
import { AboutPage } from '../pages/About'
import { BlogPage } from '../pages/Blog'
import { BlogDetailPage } from '../pages/Blog/Details'
import { HomePage } from '../pages/Home'
import { ProjectsPage } from '../pages/Projects'
import { LoginPage } from '../pages/Login'
import { RegisterPage } from '../pages/Register'
import { ArticleNewPage } from '../pages/Blog/New'
import { ProjectDetailPage } from '../pages/Projects/Details'
import { ProjectNewPage } from '../pages/Projects/New'
import { ArticleEditPage } from '../pages/Blog/Edit'
import { ProjectEditPage } from '../pages/Projects/Edit'
import { AdminArticlesPage } from '../pages/Admin/Articles'
import { AdminProjectsPage } from '../pages/Admin/Projects'
import { AdminUsersPage } from '../pages/Admin/Users'
import { AdminSuggestionsPage } from '../pages/Admin/Suggestions'
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },

      // V1.0.0 公开内容
      { path: 'articles', element: <BlogPage /> },
      { path: 'articles/:id', element: <BlogDetailPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/new', element: <ProjectNewPage /> },
      { path: 'projects/:id/edit', element: <ProjectEditPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },

      // 兼容旧 blog 路径
      { path: 'blog', element: <Navigate to="/articles" replace /> },
      { path: 'blog/new', element: <ArticleNewPage /> },
      { path: 'blog/:id/edit', element: <ArticleEditPage /> },
      { path: 'blog/:id', element: <BlogDetailPage /> },
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
      { path: 'admin/projects', element: <AdminProjectsPage /> },
      { path: 'admin/suggestions', element: <AdminSuggestionsPage /> },
    ],
  },
])
