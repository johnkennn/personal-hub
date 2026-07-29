import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createArticle } from '../../api/blog'
import { ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'

export function ArticleNewPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await createArticle({ title, content, published })
      navigate(`/blog/${res.data.data.id}`)
    } catch {
      setError('发布失败，请确认已登录且内容有效')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p>
        <Link to={ROUTES.BLOG}>← 返回列表</Link>
      </p>
      <h1>新建文章</h1>
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