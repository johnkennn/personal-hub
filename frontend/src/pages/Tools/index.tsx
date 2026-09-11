import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Segmented, Skeleton, Tag } from 'antd'
import { motion } from 'framer-motion'

import { PageHero } from '../../components/PageHero'
import { usePageMeta } from '../../hooks/usePageMeta'
import { toolDetailPath } from '../../router/paths'
import {
  filterHubToolsByCategoryName,
  loadHubToolCategories,
  loadHubTools,
} from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import styles from './Tools.module.css'

export function ToolsPage() {
  const [category, setCategory] = useState('全部')
  const [tools, setTools] = useState<HubTool[]>([])
  const [categoryNames, setCategoryNames] = useState<string[]>(['全部'])
  const [loading, setLoading] = useState(true)

  usePageMeta({
    title: 'AI导览',
    description: '成熟 AI 产品按场景分类浏览。',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([loadHubTools(), loadHubToolCategories()])
      .then(([list, cats]) => {
        if (cancelled) return
        setTools(list)
        setCategoryNames(['全部', ...cats.map((c) => c.name)])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () => filterHubToolsByCategoryName(tools, category),
    [tools, category],
  )

  return (
    <PageHero
      title="AI导览"
      tagline="成熟产品，按场景分类"
      extra={
        <div className={styles.filters}>
          <Segmented
            value={category}
            onChange={(v) => setCategory(String(v))}
            options={categoryNames}
          />
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : filtered.length === 0 ? (
        <Empty description="该分类暂无产品" />
      ) : (
        <div className={styles.grid}>
          {filtered.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.28) }}
            >
              <Link to={toolDetailPath(t.slug)} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.cardName}>{t.name}</span>
                  {t.featured ? <span className={styles.badge}>精选</span> : null}
                </div>
                <p className={styles.cardSummary}>{t.summary}</p>
                <div className={styles.cardMeta}>
                  <Tag className={styles.catTag}>{t.category}</Tag>
                  <span className={styles.pricing}>{t.pricing}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </PageHero>
  )
}
