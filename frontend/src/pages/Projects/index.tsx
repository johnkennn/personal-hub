import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES,projectDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'

import { fetchProjects } from '../../api/project'
import type { Project } from '../../types/project'

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjects()
      .then((res) => setProjects(res.data.data))
      .catch(() => setError('接口请求失败'))
  }, [])

  if (error) {
    return <h1>{error}</h1>
  }

  return (
    <div>
      <h1>Projects</h1>
      {isLoggedIn() ? (
        <p>
          <Link to={ROUTES.PROJECT_NEW}>新建项目</Link>
        </p>
      ) : null}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link to={projectDetailPath(project.id)}>
              <strong>{project.name}</strong>
            </Link>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}