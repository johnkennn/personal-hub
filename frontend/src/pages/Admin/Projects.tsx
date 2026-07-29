import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { deleteProject, fetchAllProjects } from '../../api/project'
import { ROUTES, projectEditPath, projectDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import type { Project } from '../../types/project'

export function AdminProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    fetchAllProjects()
      .then((res) => setProjects(res.data.data))
      .catch(() => setError('加载失败'))
  }, [navigate])

  async function handleDelete(id: number) {
    if (!window.confirm('确认删除？不可恢复')) return
    await deleteProject(id)
    setProjects((prev) => prev.filter((item) => item.id !== id))
  }

  if (error) return <h1>{error}</h1>

  return (
    <div>
      <h1>项目管理</h1>
      <p>
        <Link to={ROUTES.PROJECT_NEW}>新建项目</Link>
      </p>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <strong>{project.name}</strong>
            {' — '}
            {project.published ? '已发布' : '草稿'}
            {' · '}
            {project.published ? (
              <Link to={projectDetailPath(project.id)}>查看</Link>
            ) : null}
            {' · '}
            <Link to={projectEditPath(project.id)}>编辑</Link>
            {' · '}
            <button type="button" onClick={() => handleDelete(project.id)}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}