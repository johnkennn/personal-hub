import { useEffect, useState } from 'react'
import styles from './ReadingProgress.module.css'

/** 文章阅读进度条：跟随滚动，演示时很有「产品感」 */
export function ReadingProgress() {
  const [ratio, setRatio] = useState(0)

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setRatio(max <= 0 ? 0 : Math.min(1, el.scrollTop / max))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={styles.track} aria-hidden>
      <div className={styles.bar} style={{ transform: `scaleX(${ratio})` }} />
    </div>
  )
}
