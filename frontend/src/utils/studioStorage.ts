import type { Article } from '../types/article'
import type { Project } from '../types/project'
import {
  MOCK_ARTICLE_DRAFTS,
  MOCK_ARTICLE_PUBLISHED,
  MOCK_PROJECT_DRAFTS,
  MOCK_PROJECT_PUBLISHED,
} from '../mocks/studioMock'

type StudioBucket = 'articleDrafts' | 'articlePublished' | 'projectDrafts' | 'projectPublished'

const KEY = 'personal_hub_studio_lists'

type StudioStore = {
  articleDrafts: Article[]
  articlePublished: Article[]
  projectDrafts: Project[]
  projectPublished: Project[]
}

function defaults(): StudioStore {
  return {
    articleDrafts: [...MOCK_ARTICLE_DRAFTS],
    articlePublished: [...MOCK_ARTICLE_PUBLISHED],
    projectDrafts: [...MOCK_PROJECT_DRAFTS],
    projectPublished: [...MOCK_PROJECT_PUBLISHED],
  }
}

export function loadStudioStore(): StudioStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaults()
    const parsed = JSON.parse(raw) as Partial<StudioStore>
    return {
      articleDrafts: parsed.articleDrafts ?? defaults().articleDrafts,
      articlePublished: parsed.articlePublished ?? defaults().articlePublished,
      projectDrafts: parsed.projectDrafts ?? defaults().projectDrafts,
      projectPublished: parsed.projectPublished ?? defaults().projectPublished,
    }
  } catch {
    return defaults()
  }
}

export function saveStudioBucket(bucket: StudioBucket, items: Article[] | Project[]) {
  const store = loadStudioStore()
  ;(store as Record<StudioBucket, Article[] | Project[]>)[bucket] = items
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function getStudioBucket(bucket: StudioBucket): Article[] | Project[] {
  return loadStudioStore()[bucket]
}

export function getStudioArticles(bucket: 'articleDrafts' | 'articlePublished'): Article[] {
  return loadStudioStore()[bucket]
}

export function getStudioProjects(bucket: 'projectDrafts' | 'projectPublished'): Project[] {
  return loadStudioStore()[bucket]
}
