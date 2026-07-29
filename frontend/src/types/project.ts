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