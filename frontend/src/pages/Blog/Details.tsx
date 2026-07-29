import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { fetchArticleById } from '../../api/blog'
import { ROUTES } from '../../router/paths'
import type { Article } from '../../types/article'

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState('')

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

  return (
    <article>
      <p>
        <Link to={ROUTES.BLOG}>← 返回列表</Link>
      </p>
      <h1>{article.title}</h1>
      <div>{article.content}</div>
    </article>
  )
}
