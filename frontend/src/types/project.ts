export interface Project {
  id: number
  name: string
  description: string
  techStack: string | null
  repoUrl: string | null
  demoUrl: string | null
  published: boolean
  authorId?: number
  coverUrl?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

  export interface ProjectCreateRequest {
    name: string
    description: string
    techStack?: string
    repoUrl?: string
    demoUrl?: string
    published?: boolean
  }

  export interface ProjectUpdateRequest {
    name: string
    description: string
    techStack?: string
    repoUrl?: string
    demoUrl?: string
    published: boolean
  }