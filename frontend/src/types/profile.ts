export interface Profile {
  userId: number
  username: string
  nickname: string | null
  bio: string | null
  avatarUrl: string | null
  linksJson: string | null
  followerCount: number
  followingCount: number
  following: boolean
}

export interface ProfileUpdateRequest {
  nickname?: string
  bio?: string
  avatarUrl?: string
  linksJson?: string
}
