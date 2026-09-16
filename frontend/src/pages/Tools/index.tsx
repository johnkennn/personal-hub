import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Input, Segmented, Skeleton, Tag } from 'antd'
import { motion } from 'framer-motion'

import {
  applyCatalogPageChange,
  CatalogListLayout,
  CatalogPager,
} from '../../components/CatalogPager'
import { PageHero } from '../../components/PageHero'
import { CATALOG_PAGE_SIZE } from '../../constants/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { toolDetailPath } from '../../router/paths'
import {
  filterHubToolsByCategoryName,
  loadHubToolCategories,
  loadHubTools,
} from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import ui from '../../styles/ui.module.css'
import styles from './Tools.module.css'

function matchToolQuery(tool: HubTool, raw: string) {
  const q = raw.trim().toLowerCase()
  if (!q) return true
  const hay = [
    tool.name,
    tool.summary,
    tool.category,
    tool.pricing,
    ...tool.tags,
    ...tool.keywords,
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

export function ToolsPage() {
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [tools, setTools] = useState<HubTool[]>([])
  const [categoryNames, setCategoryNames] = useState<string[]>(['全部'])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(CATALOG_PAGE_SIZE)

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

  const filtered = useMemo(() => {
    return filterHubToolsByCategoryName(tools, category).filter((t) =>
      matchToolQuery(t, query),
    )
  }, [tools, category, query])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  return (
    <PageHero title="AI导览" tagline="成熟产品，按场景分类">
      <div className={ui.catalogToolbar}>
        <div className={`${ui.catalogToolbarField} ${ui.catalogToolbarSearch}`}>
          <Input.Search
            allowClear
            placeholder="搜索名称 / 标签"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            onSearch={(v) => {
              setQuery(v)
              setPage(1)
            }}
            style={{ width: '100%' }}
          />
        </div>
        <div className={`${ui.catalogToolbarScroll} ${styles.filters}`}>
          <Segmented
            value={category}
            onChange={(v) => {
              setCategory(String(v))
              setPage(1)
            }}
            options={categoryNames}
          />
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : filtered.length === 0 ? (
        <Empty description={tools.length === 0 ? '暂无产品' : '没有符合筛选条件的产品'} />
      ) : (
        <CatalogListLayout
          pageSize={pageSize}
          pager={
            <CatalogPager
              current={page}
              pageSize={pageSize}
              total={filtered.length}
              onChange={(p, ps) => applyCatalogPageChange(setPage, setPageSize, pageSize, p, ps)}
            />
          }
        >
          <div className={styles.grid}>
            {pageItems.map((t, i) => (
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
        </CatalogListLayout>
      )}
    </PageHero>
  )
}
