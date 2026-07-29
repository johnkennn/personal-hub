import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { fetchProjectForManage, updateProject } from '../../api/project'
import { ROUTES, projectDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
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
      return
    }
    if (!id) return

    fetchProjectForManage(id)
      .then((res) => {
        const project = res.data.data
        setName(project.name)
        setDescription(project.description)
        setTechStack(project.techStack)
        setRepoUrl(project.repoUrl)
        setDemoUrl(project.demoUrl)
        setPublished(project.published)
      })
      .catch(() => setError('加载项目失败'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return
    setError('')
    setSubmitting(true)

    try {
      const res = await updateProject(id, { name, description, techStack, repoUrl, demoUrl, published })
      if (res.data.data.published) {
        navigate(projectDetailPath(res.data.data.id))
      } else {
        navigate(ROUTES.PROJECTS)
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
        <Link to={ROUTES.PROJECTS}>← 返回列表</Link>
      </p>
      <h1>编辑项目</h1>
      <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="name">项目名称</label>
            <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
        </div>
        <div>
            <label htmlFor="description">项目描述</label>
            <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            required
            />
        </div>
        <div>
            <label htmlFor="techStack">技术栈</label>
            <input
            id="techStack"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            required
            />
        </div>
        <div>
            <label htmlFor="repoUrl">仓库地址</label>
            <input
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
            />
        </div>
        <div>
            <label htmlFor="demoUrl">演示地址</label>
            <input
            id="demoUrl"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
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