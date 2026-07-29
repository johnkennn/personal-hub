import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectDetailPath } from '../../router/paths'

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