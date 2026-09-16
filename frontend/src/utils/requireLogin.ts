import { Modal } from 'antd'

import { ROUTES } from '../router/paths'
import { isLoggedIn } from './authStorage'

/** 登录页 + 回跳当前页（Login 已支持 ?from=） */
export function loginPathWithReturn(from?: string): string {
  const path =
    from ??
    `${window.location.pathname}${window.location.search}${window.location.hash}`
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : ROUTES.HOME
  return `${ROUTES.LOGIN}?from=${encodeURIComponent(safe)}`
}

type EnsureLoginOptions = {
  title?: string
  content?: string
  /** 为 true 时即使已登录也视为需重新登录（token 失效后） */
  force?: boolean
}

/** 避免 StrictMode / 并发触发弹出多个确认框 */
let loginModalOpen = false
const loginModalWaiters: Array<(ok: boolean) => void> = []

function settleLoginModal(ok: boolean) {
  loginModalOpen = false
  const waiters = loginModalWaiters.splice(0, loginModalWaiters.length)
  waiters.forEach((w) => w(ok))
}

/**
 * 未登录时弹窗：确认 → 去登录；取消 → 留在当前页。
 * @returns true 仅表示「当前已登录，可继续业务」；去登录或取消均为 false（勿继续写操作）
 */
export function ensureLoggedIn(options?: EnsureLoginOptions): Promise<boolean> {
  if (!options?.force && isLoggedIn()) {
    return Promise.resolve(true)
  }

  if (loginModalOpen) {
    return new Promise((resolve) => {
      loginModalWaiters.push(resolve)
    })
  }

  loginModalOpen = true
  return new Promise((resolve) => {
    loginModalWaiters.push(resolve)
    Modal.confirm({
      title: options?.title ?? '需要登录',
      content:
        options?.content ?? '这个功能需要登录哦，要去登录吗？',
      okText: '去登录',
      cancelText: '取消',
      centered: true,
      onOk: () => {
        window.location.assign(loginPathWithReturn())
        // 跳转中尚未登录：必须 false，避免点赞/关注等继续请求再弹第二次
        settleLoginModal(false)
      },
      onCancel: () => {
        settleLoginModal(false)
      },
    })
  })
}
