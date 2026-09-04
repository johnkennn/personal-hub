import { request } from './request'
import type { ApiResponse } from '../types/api'
import type { NotificationItem } from '../types/notification'

export function fetchMyNotifications() {
  return request.get<ApiResponse<NotificationItem[]>>('/api/me/notifications')
}

export function fetchUnreadNotificationCount() {
  return request.get<ApiResponse<number>>('/api/me/notifications/unread-count')
}

export function markNotificationRead(id: number) {
  return request.post<ApiResponse<null>>(`/api/me/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return request.post<ApiResponse<null>>('/api/me/notifications/read-all')
}
