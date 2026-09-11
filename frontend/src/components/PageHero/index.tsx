import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

import styles from './PageHero.module.css'

type PageHeroProps = {
  title: string
  tagline?: string
  /** 右侧操作区（筛选、按钮等） */
  extra?: ReactNode
  children?: ReactNode
  className?: string
  /** 关于页等收窄版 */
  narrow?: boolean
}

const ease = [0.22, 1, 0.36, 1] as const

/**
 * 前台列表页统一页头：光晕 + 网格 + 渐变大标题 + 短 slogan。
 */
export function PageHero({
  title,
  tagline,
  extra,
  children,
  className,
  narrow,
}: PageHeroProps) {
  return (
    <div
      className={[styles.shell, narrow ? styles.narrow : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.aura} aria-hidden />
      <div className={styles.gridBg} aria-hidden />

      <header className={styles.hero}>
        <div className={styles.heroRow}>
          <div>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease }}
            >
              {title}
            </motion.h1>
            {tagline ? (
              <motion.p
                className={styles.tagline}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease }}
              >
                {tagline}
              </motion.p>
            ) : null}
          </div>
          {extra ? <div className={styles.extra}>{extra}</div> : null}
        </div>
      </header>

      {children ? <div className={styles.body}>{children}</div> : null}
    </div>
  )
}

/** 分区标题行：短标签 + 可选右侧链接 */
export function SectionHead({
  label,
  action,
  className,
}: {
  label: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={[styles.sectionHead, className].filter(Boolean).join(' ')}>
      <p className={styles.sectionLabel}>{label}</p>
      {action}
    </div>
  )
}

export { styles as pageHeroStyles }
