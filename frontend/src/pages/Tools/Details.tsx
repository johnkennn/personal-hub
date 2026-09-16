import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, Col, Empty, Row, Segmented, Skeleton, Tag, Typography } from 'antd'
import { ExportOutlined, FireOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { BackNavButton } from '../../components/BackNavButton'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { listSeedReviewsForTool } from '../../data/seedToolReviews'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { PublicArticle } from '../../mocks/publicDemo'
import {
  articleDetailPath,
  articlesListPath,
  ROUTES,
  toolDetailPath,
} from '../../router/paths'
import { loadRelatedArticlesForTool } from '../../services/publicContent'
import { loadHubToolBySlug, loadHubTools } from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import { excerpt, formatDateTime } from '../../utils/format'
import {
  getCommentCount,
  getHeatScore,
  getLikeCount,
} from '../../utils/socialStorage'
import ui from '../../styles/ui.module.css'
import styles from './Tools.module.css'

type ReviewSort = 'latest' | 'hot'

type RelatedReviewItem = {
  key: string
  id: number
  title: string
  excerpt: string
  authorId?: number
  authorName: string
  avatarUrl?: string
  coverUrl?: string | null
  updatedAt: string
  to: string
  likes: number
  comments: number
  heat: number
  relatedToolSlugs: string[]
}

export function ToolDetailPage() {
  const { slug = '' } = useParams()
  const [tool, setTool] = useState<HubTool | null>(null)
  const [toolNames, setToolNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [sort, setSort] = useState<ReviewSort>('latest')

  usePageMeta({
    title: tool ? tool.name : '工具详情',
    description: tool?.summary ?? 'AI 产品详情',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setTool(null)
    Promise.all([loadHubToolBySlug(slug), loadHubTools()])
      .then(([item, all]) => {
        if (cancelled) return
        setTool(item)
        const map: Record<string, string> = {}
        for (const t of all) map[t.slug] = t.name
        setToolNames(map)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    loadRelatedArticlesForTool(slug)
      .then(({ items }) => {
        if (!cancelled) setArticles(items)
      })
      .catch(() => {
        if (!cancelled) setArticles([])
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const relatedReviews = useMemo(() => {
    if (!tool) return [] as RelatedReviewItem[]

    const fromSeed: RelatedReviewItem[] = listSeedReviewsForTool(tool.slug).map((r) => {
      const idForHeat = r.articleId ?? r.id
      const likes = getLikeCount('article', idForHeat) + r.seedLikes
      const comments = getCommentCount('article', idForHeat) + r.seedComments
      return {
        key: `seed-${r.id}`,
        id: idForHeat,
        title: r.title,
        excerpt: r.excerpt,
        authorName: r.authorName,
        updatedAt: r.updatedAt,
        to: r.articleId ? articleDetailPath(r.articleId) : ROUTES.ARTICLES,
        likes,
        comments,
        heat: likes + comments,
        relatedToolSlugs: r.relatedToolSlugs,
      }
    })

    const fromArticles: RelatedReviewItem[] = articles.map((a) => {
      const likes = getLikeCount('article', a.id)
      const comments = getCommentCount('article', a.id)
      return {
        key: `article-${a.id}`,
        id: a.id,
        title: a.title,
        excerpt: excerpt(a.content, 72),
        authorId: a.authorId || undefined,
        authorName: a.authorName,
        avatarUrl: a.avatarUrl,
        coverUrl: a.coverUrl,
        updatedAt: a.updatedAt,
        to: articleDetailPath(a.id),
        likes,
        comments,
        heat: getHeatScore('article', a.id),
        relatedToolSlugs: a.relatedToolSlugs?.length
          ? a.relatedToolSlugs
          : [tool.slug],
      }
    })

    const seen = new Set<string>()
    const merged: RelatedReviewItem[] = []
    const source = fromArticles.length > 0 ? fromArticles : fromSeed
    for (const item of source) {
      const dedupe = item.title.trim().toLowerCase()
      if (seen.has(dedupe)) continue
      seen.add(dedupe)
      merged.push(item)
    }

    if (sort === 'hot') {
      merged.sort((a, b) => b.heat - a.heat || b.updatedAt.localeCompare(a.updatedAt))
    } else {
      merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
    return merged
  }, [tool, articles, sort])

  const previewReviews = useMemo(() => relatedReviews.slice(0, 4), [relatedReviews])
  const moreReviewsHref = articlesListPath({ tools: slug ? [slug] : [] })

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </motion.div>
    )
  }

  if (!tool) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Empty description="没有找到这个产品" style={{ marginTop: 48 }}>
          <BackNavButton fallback={ROUTES.TOOLS} type="primary" label="返回上一页" />
        </Empty>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={styles.detail}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <BackNavButton fallback={ROUTES.TOOLS} className={styles.back} />

      <header className={styles.detailHead}>
        <div>
          <Typography.Title level={2} className={ui.pageTitle}>
            {tool.name}
          </Typography.Title>
          <Typography.Paragraph className={ui.pageDesc}>
            {tool.summary}
          </Typography.Paragraph>
          <div className={styles.tagRow}>
            <Tag className={styles.catTag}>{tool.category}</Tag>
            {tool.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
        <div className={styles.ctaBlock}>
          <p className={styles.pricingLarge}>{tool.pricing}</p>
          <Button
            type="primary"
            size="large"
            icon={<ExportOutlined />}
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            去官网
          </Button>
        </div>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>产品介绍</h3>
        <p className={styles.sectionBody}>{tool.intro}</p>
      </section>

      <div className={styles.split}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>适合谁</h3>
          <p className={styles.sectionBody}>{tool.audience || '通用用户'}</p>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>定价参考</h3>
          <p className={styles.sectionBody}>{tool.pricing}（以官网最新为准）</p>
        </section>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>典型用法</h3>
        {tool.useCases.length > 0 ? (
          <ul className={styles.bulletList}>
            {tool.useCases.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.sectionBody}>暂无补充用法说明。</p>
        )}
      </section>

      <div className={styles.split}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>优点</h3>
          <ul className={styles.bulletList}>
            {tool.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>注意</h3>
          <ul className={styles.bulletList}>
            {tool.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.reviewsSection}>
        <div className={styles.reviewsHead}>
          <div>
            <h3 className={styles.reviewsTitle}>相关评测</h3>
            <p className={styles.reviewsDesc}>
              绑定了本工具的体验帖与对比文（一篇评测可关联多个 AI 工具）。
            </p>
          </div>
          <div className={styles.reviewsActions}>
            <Segmented
              value={sort}
              onChange={(v) => setSort(v as ReviewSort)}
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
            <Link to={moreReviewsHref}>
              <Button>更多测评</Button>
            </Link>
          </div>
        </div>

        {previewReviews.length === 0 ? (
          <Empty description="还没有相关评测" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Link to={moreReviewsHref}>
              <Button>更多测评</Button>
            </Link>
          </Empty>
        ) : (
          <Row gutter={[14, 14]}>
            {previewReviews.map((r) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={r.key} style={{ display: 'flex' }}>
                <motion.div
                  className={ui.catalogCardMotion}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${ui.cardLink} ${ui.catalogCardShell}`}>
                    <Link to={r.to} className={ui.catalogCardHit} aria-label={r.title} />
                    <Card className={`${ui.contentCard} ${ui.catalogCard}`} variant="borderless">
                      <CoverStrip
                        title={r.title}
                        tone={coverToneFromId(Math.abs(r.id))}
                        coverUrl={r.coverUrl}
                        compact
                      />
                      <Typography.Title level={5} className={ui.catalogCardTitle}>
                        {r.title}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className={ui.catalogCardExcerpt}>
                        {r.excerpt}
                      </Typography.Paragraph>
                      <div className={`${ui.catalogCardMeta} ${ui.catalogCardMetaInteractive}`}>
                        <AuthorChip
                          authorId={r.authorId}
                          authorName={r.authorName}
                          avatarUrl={r.avatarUrl}
                          size={22}
                        />
                        <Typography.Text type="secondary" className={ui.muted}>
                          {sort === 'hot' ? `${r.likes} 赞` : formatDateTime(r.updatedAt)}
                        </Typography.Text>
                      </div>
                      {r.relatedToolSlugs.length > 1 ? (
                        <div className={styles.reviewTools}>
                          {r.relatedToolSlugs.map((s) => {
                            const label = toolNames[s] ?? s
                            if (s === tool.slug) {
                              return (
                                <Tag key={s} className={styles.miniToolTag}>
                                  {label}
                                </Tag>
                              )
                            }
                            return (
                              <Link
                                key={s}
                                to={toolDetailPath(s)}
                                className={styles.miniToolLink}
                              >
                                <Tag className={styles.miniToolTag}>{label}</Tag>
                              </Link>
                            )
                          })}
                        </div>
                      ) : null}
                    </Card>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </section>
    </motion.div>
  )
}
