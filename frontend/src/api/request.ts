import axios from 'axios'
import { clearAuth, getToken, isLoggedIn } from '../utils/authStorage'
import { ensureLoggedIn } from '../utils/requireLogin'
import { newRequestId, REQUEST_ID_HEADER } from '../utils/requestId'
import { ROUTES } from '../router/paths'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const request = axios.create({
  baseURL,
  timeout: 5000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers[REQUEST_ID_HEADER] = newRequestId()
  // 上传 multipart 容易超过默认 5s
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.timeout = Math.max(config.timeout ?? 0, 60_000)
  }
  return config
})

/**
 * 后端 JWT 过期 / 接口要求登录时：
 * - HTTP 401 或业务体 code=401
 * 弹窗确认是否去登录；取消则留在原页（不再强制跳转）。
 */
let handlingUnauthorized = false

request.interceptors.response.use(
  (response) => {
    const body = response.data as { code?: number; message?: string } | undefined
    if (body?.code === 401) {
      promptLoginOnUnauthorized(body.message)
      return Promise.reject(response)
    }
    return response
  },
  (error) => {
    const status = error?.response?.status
    const code = error?.response?.data?.code
    const message = error?.response?.data?.message as string | undefined
    if (status === 401 || code === 401) {
      promptLoginOnUnauthorized(message)
    }
    return Promise.reject(error)
  },
)

function promptLoginOnUnauthorized(serverMessage?: string) {
  if (handlingUnauthorized) return
  const path = window.location.pathname
  if (path === ROUTES.LOGIN || path === ROUTES.REGISTER) return

  handlingUnauthorized = true
  const hadSession = isLoggedIn()
  clearAuth()

  // 与 ensureLoggedIn 共用一套弹窗，避免「页面弹一次 + 401 再弹一次」
  void ensureLoggedIn({
    force: true,
    title: hadSession ? '登录已失效' : '需要登录',
    content:
      serverMessage?.trim() ||
      (hadSession
        ? '登录过期啦，要重新登录吗？'
        : '需要登录才能看哦，要去登录吗？'),
  }).finally(() => {
    handlingUnauthorized = false
  })
}
