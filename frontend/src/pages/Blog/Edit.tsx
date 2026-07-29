import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { fetchArticleForManage, updateArticle } from '../../api/blog'
import { ROUTES, blogDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    if (!id) return

    fetchArticleForManage(id)
      .then((res) => {
        const article = res.data.data
        setTitle(article.title)
        setContent(article.content)
        setPublished(article.published)
      })
      .catch(() => setError('加载文章失败'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return
    setError('')
    setSubmitting(true)

    try {
      const res = await updateArticle(id, { title, content, published })
      if (res.data.data.published) {
        navigate(blogDetailPath(res.data.data.id))
      } else {
        navigate(ROUTES.BLOG)
      }
    } catch {
      setError('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>加载中...</p>

  return (
    <div>
      <p>
        <Link to={ROUTES.BLOG}>← 返回列表</Link>
      </p>
      <h1>编辑文章</h1>
      <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="title">标题</label>
            <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            />
        </div>
        <div>
            <label htmlFor="content">正文</label>
            <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            />
        </div>
        <div>
            <label>
            <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
            />{' '}
            立即发布
            </label>
        </div>
        {error ? <p>{error}</p> : null}
        <button type="submit" disabled={submitting}>
            {submitting ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  )
}