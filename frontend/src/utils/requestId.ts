/** 与后端 RequestIdFilter / axios 拦截器共用的请求追踪头 */
export const REQUEST_ID_HEADER = 'X-Request-Id'

/**
 * 生成请求 ID。
 * `crypto.randomUUID` 仅在安全上下文可用（HTTPS / localhost）；
 * 生产用 http://公网IP 时会 undefined，必须降级，否则拦截器抛错导致「Network 无请求」。
 */
export function newRequestId(): string {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (c && typeof c.randomUUID === 'function') {
    try {
      return c.randomUUID()
    } catch {
      /* insecure context 等 */
    }
  }
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 给 fetch 用的单头对象 */
export function requestIdHeader(): Record<string, string> {
  return { [REQUEST_ID_HEADER]: newRequestId() }
}
