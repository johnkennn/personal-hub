import axios from 'axios'
import { clearAuth, getToken } from '../utils/authStorage'
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
  return config
})

/**
 * 后端 JWT 过期 / 无效时：
 * - Security 返回 HTTP 401 +「未登录或登录已失效」
 * - 或业务体 code=401
 * 前端仍可能显示旧 username（localStorage），因此需统一清会话并回登录页。
 */
let handlingUnauthorized = false

request.interceptors.response.use(
  (response) => {
    const body = response.data as { code?: number } | undefined
    if (body?.code === 401) {
      redirectToLoginOnUnauthorized()
      return Promise.reject(response)
    }
    return response
  },
  (error) => {
    const status = error?.response?.status
    const code = error?.response?.data?.code
    if (status === 401 || code === 401) {
      redirectToLoginOnUnauthorized()
    }
    return Promise.reject(error)
  },
)

function redirectToLoginOnUnauthorized() {
  if (handlingUnauthorized) return
  handlingUnauthorized = true
  clearAuth()
  const path = window.location.pathname
  if (path !== ROUTES.LOGIN && path !== ROUTES.REGISTER) {
    window.location.assign(ROUTES.LOGIN)
  } else {
    handlingUnauthorized = false
  }
}
