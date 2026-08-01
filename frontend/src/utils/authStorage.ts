const TOKEN_KEY = 'personal_hub_token'
const USERNAME_KEY = 'personal_hub_username'
const ROLE_KEY = 'personal_hub_role'
const AUTH_CHANGE_EVENT = 'personal-hub-auth-changed'

export type UserRole = 'AUTHOR' | 'ADMIN'

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, username: string, role: UserRole = 'AUTHOR'): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
  localStorage.setItem(ROLE_KEY, role)
  notifyAuthChange()
}

/** 前端演示：切换管理员身份（后端角色接通后删除） */
export function setDemoRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role)
  notifyAuthChange()
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(ROLE_KEY)
  notifyAuthChange()
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function getRole(): UserRole {
  const role = localStorage.getItem(ROLE_KEY)
  return role === 'ADMIN' ? 'ADMIN' : 'AUTHOR'
}

export function isAdmin(): boolean {
  return getRole() === 'ADMIN'
}

export function isLoggedIn(): boolean {
  return Boolean(getToken())
}

export function subscribeAuthChange(listener: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, listener)
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, listener)
}
