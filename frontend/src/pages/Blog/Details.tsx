import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { fetchArticleById, deleteArticle } from '../../api/blog'
import { ROUTES,blogEditPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import type { Article } from '../../types/article'

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    if (!id) return

    let cancelled = false

    fetchArticleById(id)
      .then((res) => {
        if (!cancelled) {
          setArticle(res.data.data)
          setError('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setArticle(null)
          setError('文章不存在或加载失败')
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (!id || error) {
    return (
      <div>
        <p>{error || '文章不存在'}</p>
        <Link to={ROUTES.BLOG}>返回列表</Link>
      </div>
    )
  }

  if (!article) {
    return <p>加载中...</p>
  }

  async function handleDelete() {
    if (!window.confirm('确认删除这篇文章？不可恢复')) return
    await deleteArticle(article.id)
    navigate(ROUTES.BLOG)
  }

  return (
    <article>
      <p>
        <Link to={ROUTES.BLOG}>← 返回列表</Link>
      </p>
      <h1>{article.title}</h1>
      <div>{article.content}</div>
      {isLoggedIn() ? (
        <p>
          <Link to={blogEditPath(id)}>编辑</Link>
          <button onClick={handleDelete}>删除</button>
        </p>
      ) : null}
    </article>
  )
}
