import { useEffect, useState } from 'react'

import { fetchArticles } from '../../api/blog'
import type { Article } from '../../types/article'
import { Link } from 'react-router-dom'
import { blogDetailPath } from '../../router/paths'

export function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchArticles()
      .then((res) => {
        setArticles(res.data.data)
      })
      .catch(() => {
        setError('接口请求失败')
      })
  }, [])

  if (error) {
    return <h1>{error}</h1>
  }

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <Link to={blogDetailPath(article.id)}>{article.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}