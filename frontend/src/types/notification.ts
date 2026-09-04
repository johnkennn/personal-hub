export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW'

export interface NotificationItem {
  id: number
  actorId: number
  actorUsername: string
  type: NotificationType
  targetType: string | null
  targetId: number | null
  createdAt: string
  read: boolean
}
