/** 顶栏展示用的轻量资料缓存（头像 / 昵称），与 JWT 登录态分开 */
const AVATAR_KEY = 'personal_hub_avatar_url'
const NICKNAME_KEY = 'personal_hub_nickname'
const PROFILE_CHANGE_EVENT = 'personal-hub-profile-changed'

export type ProfileDisplay = {
  avatarUrl: string | null
  nickname: string | null
}

function notify() {
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT))
}

export function getCachedProfileDisplay(): ProfileDisplay {
  return {
    avatarUrl: localStorage.getItem(AVATAR_KEY),
    nickname: localStorage.getItem(NICKNAME_KEY),
  }
}

export function setCachedProfileDisplay( partial: {
  avatarUrl?: string | null
  nickname?: string | null
}): void {
  if (partial.avatarUrl !== undefined) {
    if (partial.avatarUrl) localStorage.setItem(AVATAR_KEY, partial.avatarUrl)
    else localStorage.removeItem(AVATAR_KEY)
  }
  if (partial.nickname !== undefined) {
    if (partial.nickname) localStorage.setItem(NICKNAME_KEY, partial.nickname)
    else localStorage.removeItem(NICKNAME_KEY)
  }
  notify()
}

export function clearCachedProfileDisplay(): void {
  localStorage.removeItem(AVATAR_KEY)
  localStorage.removeItem(NICKNAME_KEY)
  notify()
}

export function subscribeProfileDisplayChange(listener: () => void): () => void {
  window.addEventListener(PROFILE_CHANGE_EVENT, listener)
  return () => window.removeEventListener(PROFILE_CHANGE_EVENT, listener)
}
