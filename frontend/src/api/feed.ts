import { request } from './request'
import type { ApiResponse } from '../types/api'

export type FeedItemType = 'ARTICLE' | 'PROJECT'

export type FeedItem = {
  type: FeedItemType
  id: number
  titleOrName: string
  authorId: number
  authorUsername: string
  createdAt: string
  likeCount: number
}

export function fetchFeedLatest(limit = 50) {
  return request.get<ApiResponse<FeedItem[]>>('/api/feed/latest', { params: { limit } })
}

export function fetchFeedHot(limit = 50) {
  return request.get<ApiResponse<FeedItem[]>>('/api/feed/hot', { params: { limit } })
}

export function fetchFollowingFeed() {
  return request.get<ApiResponse<FeedItem[]>>('/api/me/feed/following')
}
