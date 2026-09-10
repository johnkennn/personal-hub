import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Segmented, Tag, Typography } from 'antd'
import { motion } from 'framer-motion'

import {
  listSeedTools,
  TOOL_CATEGORIES,
  type ToolCategoryFilter,
} from '../../data/seedTools'
import { usePageMeta } from '../../hooks/usePageMeta'
import { toolDetailPath } from '../../router/paths'
import ui from '../../styles/ui.module.css'
import styles from './Tools.module.css'

export function ToolsPage() {
  const [category, setCategory] = useState<ToolCategoryFilter>('全部')

  usePageMeta({
    title: 'AI导航',
    description: '按写作、绘画、视频、编程等分类浏览成熟的 AI 产品。',
  })

  const tools = useMemo(() => listSeedTools(category), [category])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={ui.pageHead}>
        <div>
          <Typography.Title level={2} className={ui.pageTitle}>
            AI导航
          </Typography.Title>
          <Typography.Paragraph className={ui.pageDesc}>
            汇集市面成熟 AI 产品，按场景分类整理。点进详情可看简介并前往官网。
          </Typography.Paragraph>
        </div>
      </div>

      <div className={styles.filters}>
        <Segmented
          value={category}
          onChange={(v) => setCategory(v as ToolCategoryFilter)}
          options={[...TOOL_CATEGORIES]}
        />
      </div>

      {tools.length === 0 ? (
        <Empty description="该分类暂无产品" />
      ) : (
        <div className={styles.grid}>
          {tools.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 10 }}
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
    </motion.div>
  )
}
