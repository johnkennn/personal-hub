import { Navigate, useParams } from 'react-router-dom'

/** 旧 /blog/:id → /articles/:id */
export function LegacyBlogDetailRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/articles/${id}` : '/articles'} replace />
}

/** 旧 /blog/:id/edit → /articles/:id/edit */
export function LegacyBlogEditRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/articles/${id}/edit` : '/articles'} replace />
}
