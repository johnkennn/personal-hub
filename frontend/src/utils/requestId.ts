/** 与后端 RequestIdFilter / axios 拦截器共用的请求追踪头 */
export const REQUEST_ID_HEADER = 'X-Request-Id'

export function newRequestId(): string {
  return crypto.randomUUID()
}

/** 给 fetch 用的单头对象 */
export function requestIdHeader(): Record<string, string> {
  return { [REQUEST_ID_HEADER]: newRequestId() }
}
