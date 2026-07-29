import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createProject } from '../../api/project'
import { ROUTES, projectDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'

export function ProjectNewPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [techStack, setTechStack] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
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
      const res = await createProject({
        name,
        description,
        techStack: techStack || undefined,
        repoUrl: repoUrl || undefined,
        demoUrl: demoUrl || undefined,
        published,
      })
      navigate(projectDetailPath(res.data.data.id))
    } catch {
      setError('创建失败，请确认已登录且内容有效')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p>
        <Link to={ROUTES.PROJECTS}>← 返回列表</Link>
      </p>
      <h1>新建项目</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">名称</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="description">描述</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
        </div>
        <div>
          <label htmlFor="techStack">技术栈</label>
          <input
            id="techStack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="React,Spring Boot,MySQL"
          />
        </div>
        <div>
          <label htmlFor="repoUrl">仓库地址</label>
          <input id="repoUrl" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
        </div>
        <div>
          <label htmlFor="demoUrl">演示地址</label>
          <input id="demoUrl" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
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