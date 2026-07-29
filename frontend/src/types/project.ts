export interface Project {
    id: number
    name: string
    description: string
    techStack: string | null
    repoUrl: string | null
    demoUrl: string | null
    published: boolean
    createdAt: string
    updatedAt: string
  }

  export interface ProjectCreateRequest {
    name: string
    description: string
    techStack?: string
    repoUrl?: string
    demoUrl?: string
    published?: boolean
  }