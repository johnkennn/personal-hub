import axios from 'axios'

/** 从 axios / 业务错误里取出可读文案 */
export function apiErrorMessage(err: unknown, fallback = '请求失败'): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED' || /timeout/i.test(err.message)) {
      return '上传超时，请压缩图片后重试或检查网络'
    }
    if (!err.response) {
      return '网络异常，请稍后重试'
    }
    const data = err.response.data as { message?: string } | undefined
    if (data?.message?.trim()) return data.message.trim()
    if (err.response.status === 413) return '图片过大，请压缩到 5MB 以内'
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  return fallback
}
