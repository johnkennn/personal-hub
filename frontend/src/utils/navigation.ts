import type { NavigateFunction } from 'react-router-dom'

/** 有站内历史则返回上一页，否则落到 fallback（如直达详情、新标签打开） */
export function goBackOr(navigate: NavigateFunction, fallback: string) {
  const idx = (window.history.state as { idx?: number } | null)?.idx
  const canGoBack = typeof idx === 'number' ? idx > 0 : window.history.length > 1
  if (canGoBack) {
    navigate(-1)
    return
  }
  navigate(fallback)
}
