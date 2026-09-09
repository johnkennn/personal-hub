import { Link } from 'react-router-dom'
import { Typography } from 'antd'
import { motion } from 'framer-motion'

import { coverMediaStyle } from './CoverStrip'
import type { PublicProject } from '../mocks/publicDemo'
import { projectDetailPath } from '../router/paths'
import { excerpt, formatDateTime } from '../utils/format'
import styles from './WeeklyScreenings.module.css'

function weekCutoff(): Date {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function projectAt(p: PublicProject) {
  return p.updatedAt || p.createdAt
}

export function pickWeeklyScreenings(projects: PublicProject[], limit = 5) {
  const cutoff = weekCutoff().toISOString()
  const thisWeek = [...projects]
    .filter((p) => projectAt(p) >= cutoff)
    .sort((a, b) => projectAt(b).localeCompare(projectAt(a)))
    .slice(0, limit)

  if (thisWeek.length > 0) {
    return { items: thisWeek, mode: 'week' as const }
  }

  const recent = [...projects]
    .sort((a, b) => projectAt(b).localeCompare(projectAt(a)))
    .slice(0, Math.min(limit, 4))
  return { items: recent, mode: 'recent' as const }
}

type WeeklyScreeningsProps = {
  projects: PublicProject[]
}

/**
 * 发现页「本周上映」视觉流：以项目展映大卡为主。
 * 近 7 天无更新时降级为「近期上映」，避免空库冷场。
 */
export function WeeklyScreenings({ projects }: WeeklyScreeningsProps) {
  const { items, mode } = pickWeeklyScreenings(projects)
  const [feature, ...rest] = items

  return (
    <section className={styles.section} aria-labelledby="weekly-screenings-title">
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{mode === 'week' ? 'This week' : 'Recent'}</p>
          <Typography.Title level={3} id="weekly-screenings-title" className={styles.title}>
            {mode === 'week' ? '本周上映' : '近期上映'}
          </Typography.Title>
          <Typography.Paragraph className={styles.desc}>
            {mode === 'week'
              ? '近 7 天更新或发布的项目，点击进入展映页。'
              : '本周暂无新上映，先看看最近的作品。'}
          </Typography.Paragraph>
        </div>
      </div>

      {!feature ? (
        <div className={styles.empty}>还没有可展映的项目</div>
      ) : (
        <div
          className={styles.grid}
          style={rest.length === 0 ? { gridTemplateColumns: '1fr' } : undefined}
        >
          <ScreeningCard project={feature} featured />
          {rest.length > 0 ? (
            <div className={styles.sideStack}>
              {rest.slice(0, 2).map((p, i) => (
                <ScreeningCard key={p.id} project={p} delay={0.06 * (i + 1)} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function ScreeningCard({
  project,
  featured,
  delay = 0,
}: {
  project: PublicProject
  featured?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay }}
      style={{ height: featured ? '100%' : undefined, display: 'flex' }}
    >
      <Link
        to={projectDetailPath(project.id)}
        className={featured ? styles.feature : styles.sideCard}
      >
        <div className={styles.media} style={coverMediaStyle(project.coverUrl, project.id)} />
        <div className={styles.shade} aria-hidden />
        <div className={styles.body}>
          <p className={styles.kind}>作品展映</p>
          <Typography.Title level={featured ? 3 : 4} className={styles.cardTitle}>
            {project.name}
          </Typography.Title>
          {featured ? (
            <Typography.Paragraph className={styles.excerpt}>
              {excerpt(project.description, 110)}
            </Typography.Paragraph>
          ) : null}
          <div className={styles.meta}>
            <span>{project.authorName}</span>
            <span>{formatDateTime(projectAt(project))}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
