import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, type ComponentType } from 'react'

import { MainLayout } from '../layouts/MainLayout'
import { HomePage } from '../pages/Home' // 首页保持同步加载，首屏更快
import {
  LegacyBlogDetailRedirect,
  LegacyBlogEditRedirect,
} from './LegacyBlogRedirects'

/** 具名导出 → lazy 需要的 default */
function lazyNamed<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  name: keyof T & string,
) {
  return lazy(() =>
    loader().then((mod) => ({
      default: mod[name] as ComponentType,
    })),
  )
}

const AboutPage = lazyNamed(() => import('../pages/About'), 'AboutPage')
const ArticlesPage = lazyNamed(() => import('../pages/Articles'), 'ArticlesPage')
const ArticleDetailPage = lazyNamed(() => import('../pages/Articles/Details'), 'ArticleDetailPage')
const ChatPage = lazyNamed(() => import('../pages/Chat'), 'ChatPage')
const ToolsPage = lazyNamed(() => import('../pages/Tools'), 'ToolsPage')
const ToolDetailPage = lazyNamed(() => import('../pages/Tools/Details'), 'ToolDetailPage')
const DealsPage = lazyNamed(() => import('../pages/Deals'), 'DealsPage')
const AiToolsPage = lazyNamed(() => import('../pages/AiTools'), 'AiToolsPage')
const ProductDescPage = lazyNamed(() => import('../pages/AiTools/ProductDesc'), 'ProductDescPage')
const ProjectsPage = lazyNamed(() => import('../pages/Projects'), 'ProjectsPage')
const LoginPage = lazyNamed(() => import('../pages/Login'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('../pages/Register'), 'RegisterPage')
const ArticleNewPage = lazyNamed(() => import('../pages/Articles/New'), 'ArticleNewPage')
const ProjectDetailPage = lazyNamed(() => import('../pages/Projects/Details'), 'ProjectDetailPage')
const ProjectNewPage = lazyNamed(() => import('../pages/Projects/New'), 'ProjectNewPage')
const ArticleEditPage = lazyNamed(() => import('../pages/Articles/Edit'), 'ArticleEditPage')
const ProjectEditPage = lazyNamed(() => import('../pages/Projects/Edit'), 'ProjectEditPage')
const AdminArticlesPage = lazyNamed(() => import('../pages/Admin/Articles'), 'AdminArticlesPage')
const AdminDeletedArticlesPage = lazyNamed(
  () => import('../pages/Admin/DeletedArticles'),
  'AdminDeletedArticlesPage',
)
const AdminDeletedProjectsPage = lazyNamed(
  () => import('../pages/Admin/DeletedProjects'),
  'AdminDeletedProjectsPage',
)
const AdminProjectsPage = lazyNamed(() => import('../pages/Admin/Projects'), 'AdminProjectsPage')
const AdminUsersPage = lazyNamed(() => import('../pages/Admin/Users'), 'AdminUsersPage')
const AdminSuggestionsPage = lazyNamed(
  () => import('../pages/Admin/Suggestions'),
  'AdminSuggestionsPage',
)
const AdminToolsPage = lazyNamed(() => import('../pages/Admin/Tools'), 'AdminToolsPage')
const AdminDealsPage = lazyNamed(() => import('../pages/Admin/Deals'), 'AdminDealsPage')
const AdminHomePage = lazyNamed(() => import('../pages/Admin'), 'AdminHomePage')
const StudioHomePage = lazyNamed(() => import('../pages/Studio'), 'StudioHomePage')
const StudioArticleDraftsPage = lazyNamed(
  () => import('../pages/Studio'),
  'StudioArticleDraftsPage',
)
const StudioArticlePublishedPage = lazyNamed(
  () => import('../pages/Studio'),
  'StudioArticlePublishedPage',
)
const StudioProjectDraftsPage = lazyNamed(
  () => import('../pages/Studio'),
  'StudioProjectDraftsPage',
)
const StudioProjectPublishedPage = lazyNamed(
  () => import('../pages/Studio'),
  'StudioProjectPublishedPage',
)
const UserProfilePage = lazyNamed(() => import('../pages/UserProfile'), 'UserProfilePage')
const UserFollowersPage = lazyNamed(
  () => import('../pages/UserProfile/FollowList'),
  'UserFollowersPage',
)
const UserFollowingPage = lazyNamed(
  () => import('../pages/UserProfile/FollowList'),
  'UserFollowingPage',
)
const ProfileSettingsPage = lazyNamed(
  () => import('../pages/Studio/ProfileSettings'),
  'ProfileSettingsPage',
)
const ChangePasswordPage = lazyNamed(
  () => import('../pages/Studio/ChangePassword'),
  'ChangePasswordPage',
)
const SuggestionsPage = lazyNamed(() => import('../pages/Studio/Suggestions'), 'SuggestionsPage')
const ForgotPasswordPage = lazyNamed(
  () => import('../pages/ForgotPassword'),
  'ForgotPasswordPage',
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'discover', element: <Navigate to="/" replace /> },
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
      { path: 'admin/deals', element: <AdminDealsPage /> },
    ],
  },
])
