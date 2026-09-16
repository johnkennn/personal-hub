import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Typography,
  App,
} from 'antd'
import { FireOutlined, PlusOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import {
  applyCatalogPageChange,
  CatalogListLayout,
  CatalogPager,
} from '../../components/CatalogPager'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { PageHero } from '../../components/PageHero'
import type { PublicArticle } from '../../mocks/publicDemo'
import { CATALOG_PAGE_SIZE } from '../../constants/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { loadPublicArticles } from '../../services/publicContent'
import { loadHubTools } from '../../services/toolCatalog'
import { isLoggedIn } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import { getLikeCount } from '../../utils/socialStorage'
import styles from '../../styles/ui.module.css'

function parseToolsParam(raw: string | null): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ArticlesPage() {
  const { message } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [toolOptions, setToolOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(CATALOG_PAGE_SIZE)
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')

  const selectedTools = useMemo(
    () => parseToolsParam(searchParams.get('tools')),
    [searchParams],
  )
  const query = searchParams.get('q') ?? ''

  usePageMeta({
    title: 'AI评测',
    description: '体验与对比，帮你判断适不适合。',
  })

  useEffect(() => {
    loadPublicArticles()
      .then((res) => {
        setArticles(res.items)
      })
      .catch(() => message.error('文章列表加载失败'))
      .finally(() => setLoading(false))
  }, [message])

  useEffect(() => {
    loadHubTools().then((list) => {
      setToolOptions(list.map((t) => ({ value: t.slug, label: t.name })))
    })
  }, [])

  function patchSearchParams(next: { tools?: string[]; q?: string }) {
    const params = new URLSearchParams(searchParams)
    if (next.tools !== undefined) {
      if (next.tools.length) params.set('tools', next.tools.join(','))
      else params.delete('tools')
    }
    if (next.q !== undefined) {
      const q = next.q.trim()
      if (q) params.set('q', q)
      else params.delete('q')
    }
    setSearchParams(params, { replace: true })
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((a) => {
      if (selectedTools.length > 0) {
        const slugs = a.relatedToolSlugs ?? []
        if (!selectedTools.some((s) => slugs.includes(s))) return false
      }
      if (!q) return true
      const title = a.title.toLowerCase()
      const author = a.authorName.toLowerCase()
      return title.includes(q) || author.includes(q)
    })
  }, [articles, selectedTools, query])

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sort === 'hot') {
      list.sort((a, b) => getLikeCount('article', b.id) - getLikeCount('article', a.id))
    } else {
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
    return list
  }, [filtered, sort])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  return (
    <PageHero
      title="AI评测"
      tagline="真实体验，帮你判断值不值得用"
      fill
      extra={
        <Space wrap align="center" size="middle">
          <Select
            mode="multiple"
            allowClear
            placeholder="关联工具"
            value={selectedTools}
            onChange={(v) => patchSearchParams({ tools: v })}
            options={toolOptions}
            optionFilterProp="label"
            maxTagCount="responsive"
            style={{ minWidth: 180, maxWidth: 300 }}
          />
          <Input.Search
            allowClear
            placeholder="搜索作者 / 标题"
            value={query}
            onChange={(e) => patchSearchParams({ q: e.target.value })}
            onSearch={(v) => patchSearchParams({ q: v })}
            style={{ width: 200 }}
          />
          <Segmented
            value={sort}
            onChange={(v) => {
              setSort(v as 'latest' | 'hot')
              setPage(1)
            }}
            options={[
              { label: '最新', value: 'latest' },
              {
                label: (
                  <span>
                    <FireOutlined /> 最热
                  </span>
                ),
                value: 'hot',
              },
            ]}
          />
          {isLoggedIn() ? (
            <Link to={ROUTES.STUDIO_ARTICLE_NEW}>
              <Button type="primary" icon={<PlusOutlined />}>
                写测评
              </Button>
            </Link>
          ) : null}
        </Space>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : articles.length === 0 ? (
        <Empty description="暂无已发布评测" />
      ) : sorted.length === 0 ? (
        <Empty description="没有符合筛选条件的评测" />
      ) : (
        <CatalogListLayout
          pageSize={pageSize}
          pager={
            <CatalogPager
              current={page}
              pageSize={pageSize}
              total={sorted.length}
              onChange={(p, ps) => applyCatalogPageChange(setPage, setPageSize, pageSize, p, ps)}
            />
          }
        >
          <Row gutter={[14, 14]}>
            {pageItems.map((article) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={article.id} style={{ display: 'flex' }}>
                <motion.div
                  className={styles.catalogCardMotion}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${styles.cardLink} ${styles.catalogCardShell}`}>
                    <Link
                      to={articleDetailPath(article.id)}
                      className={styles.catalogCardHit}
                      aria-label={article.title}
                    />
                    <Card
                      className={`${styles.contentCard} ${styles.catalogCard}`}
                      variant="borderless"
                    >
                      <CoverStrip
                        title={article.title}
                        tone={article.coverTone ?? coverToneFromId(article.id)}
                        coverUrl={article.coverUrl}
                        compact
                      />
                      <Typography.Title level={5} className={styles.catalogCardTitle}>
                        {article.title}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className={styles.catalogCardExcerpt}>
                        {excerpt(article.content, 72)}
                      </Typography.Paragraph>
                      <div className={`${styles.catalogCardMeta} ${styles.catalogCardMetaInteractive}`}>
                        <AuthorChip
                          authorId={article.authorId || undefined}
                          authorName={article.authorName}
                          avatarUrl={article.avatarUrl}
                          size={22}
                        />
                        <Typography.Text type="secondary" className={styles.muted}>
                          {sort === 'hot'
                            ? `${getLikeCount('article', article.id)} 赞`
                            : formatDateTime(article.createdAt)}
                        </Typography.Text>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </CatalogListLayout>
      )}
    </PageHero>
  )
}
