/** 粉丝 / 关注列表里的轻量用户卡片 */
export interface UserSummary {
  userId: number
  username: string
  nickname: string | null
  avatarUrl: string | null
}
