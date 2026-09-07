import { request } from './request'
import type { ApiResponse } from '../types/api'

export type SearchFeedItem = {
  type: 'ARTICLE' | 'PROJECT'
  id: number
  titleOrName: string
  authorId: number
  authorUsername: string
  createdAt: string
  likeCount: number
}

/** GET /api/search?q= — 模糊搜已发布文章标题 / 项目名称 */
export function fetchSearch(q: string) {
  return request.get<ApiResponse<SearchFeedItem[]>>('/api/search', {
    params: { q },
  })
}
