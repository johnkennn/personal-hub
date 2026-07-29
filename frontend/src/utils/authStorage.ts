const TOKEN_KEY = 'personal_hub_token'
const USERNAME_KEY = 'personal_hub_username'
const AUTH_CHANGE_EVENT = 'personal-hub-auth-changed'

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, username: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
  notifyAuthChange()
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  notifyAuthChange()
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function isLoggedIn(): boolean {
  return Boolean(getToken())
}

/** Subscribe to login/logout changes in the same tab. */
export function subscribeAuthChange(listener: () => void): () => void {
  window.addEventListener(AUTH_CHANGE_EVENT, listener)
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, listener)
}
