import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { fetchProjectById } from '../../api/project'
import { ROUTES } from '../../router/paths'
import type { Project } from '../../types/project'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    fetchProjectById(id)
      .then((res) => {
        if (!cancelled) {
          setProject(res.data.data)
          setError('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProject(null)
          setError('项目不存在或加载失败')
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (!id || error) {
    return (
      <div>
        <p>{error || '项目不存在'}</p>
        <Link to={ROUTES.PROJECTS}>返回列表</Link>
      </div>
    )
  }

  if (!project) {
    return <p>加载中...</p>
  }

  return (
    <article>
      <p>
        <Link to={ROUTES.PROJECTS}>← 返回列表</Link>
      </p>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      {project.techStack ? <p>技术栈：{project.techStack}</p> : null}
      {project.repoUrl ? (
        <p>
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            Repository
          </a>
        </p>
      ) : null}
      {project.demoUrl ? (
        <p>
          <a href={project.demoUrl} target="_blank" rel="noreferrer">
            Demo
          </a>
        </p>
      ) : null}
    </article>
  )
}