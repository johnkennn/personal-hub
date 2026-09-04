export interface Profile {
  userId: number
  username: string
  nickname: string | null
  bio: string | null
  avatarUrl: string | null
  linksJson: string | null
  /** 对外展示 */
  email: string | null
  /**
   * 仅 /api/me/profile 返回；公开资料接口应为 null / 不返回
   */
  phone?: string | null
  followerCount: number
  followingCount: number
  following: boolean
}

export interface ProfileUpdateRequest {
  nickname?: string
  bio?: string
  avatarUrl?: string
  linksJson?: string
  email?: string
  phone?: string
}
