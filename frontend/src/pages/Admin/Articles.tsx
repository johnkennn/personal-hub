import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { deleteArticle, fetchAllArticles } from '../../api/blog'
import { ROUTES, blogEditPath, blogDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import type { Article } from '../../types/article'

export function AdminArticlesPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    fetchAllArticles()
      .then((res) => setArticles(res.data.data))
      .catch(() => setError('加载失败'))
  }, [navigate])

  async function handleDelete(id: number) {
    if (!window.confirm('确认删除？不可恢复')) return
    await deleteArticle(id)
    setArticles((prev) => prev.filter((item) => item.id !== id))
  }

  if (error) return <h1>{error}</h1>

  return (
    <div>
      <h1>文章管理</h1>
      <p>
        <Link to={ROUTES.ARTICLE_NEW}>新建文章</Link>
      </p>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <strong>{article.title}</strong>
            {' — '}
            {article.published ? '已发布' : '草稿'}
            {' · '}
            {article.published ? (
              <Link to={blogDetailPath(article.id)}>查看</Link>
            ) : null}
            {' · '}
            <Link to={blogEditPath(article.id)}>编辑</Link>
            {' · '}
            <button type="button" onClick={() => handleDelete(article.id)}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}