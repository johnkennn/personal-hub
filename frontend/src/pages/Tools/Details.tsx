import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Empty, Segmented, Tag, Typography } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  ExportOutlined,
  FireOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { listSeedReviewsForTool } from '../../data/seedToolReviews'
import { getSeedTool } from '../../data/seedTools'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { PublicArticle } from '../../mocks/publicDemo'
import {
  articleDetailPath,
  ROUTES,
  toolDetailPath,
} from '../../router/paths'
import { loadPublicArticles } from '../../services/publicContent'
import { listArticleIdsBoundToTool } from '../../utils/articleToolBindings'
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
  title: string
  excerpt: string
  authorName: string
  updatedAt: string
  to: string
  likes: number
  comments: number
  heat: number
  relatedToolSlugs: string[]
}

function writeReviewPath(slug: string) {
  const q = new URLSearchParams({ tools: slug })
  return `${ROUTES.STUDIO_ARTICLE_NEW}?${q.toString()}`
}

export function ToolDetailPage() {
  const { slug = '' } = useParams()
  const tool = getSeedTool(slug)
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [sort, setSort] = useState<ReviewSort>('latest')

  usePageMeta({
    title: tool ? tool.name : '工具详情',
    description: tool?.summary ?? 'AI 产品详情',
  })

  useEffect(() => {
    let cancelled = false
    loadPublicArticles()
      .then((res) => {
        if (!cancelled) setArticles(res.items)
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

    const boundIds = new Set(listArticleIdsBoundToTool(tool.slug))
    const name = tool.name.toLowerCase()
    const keys = tool.keywords.map((k) => k.toLowerCase())

    const fromArticles: RelatedReviewItem[] = articles
      .filter((a) => {
        if (boundIds.has(a.id)) return true
        const t = a.title.toLowerCase()
        return t.includes(name) || keys.some((k) => t.includes(k))
      })
      .map((a) => {
        const likes = getLikeCount('article', a.id)
        const comments = getCommentCount('article', a.id)
        return {
          key: `article-${a.id}`,
          title: a.title,
          excerpt: excerpt(a.content, 90),
          authorName: a.authorName,
          updatedAt: a.updatedAt,
          to: articleDetailPath(a.id),
          likes,
          comments,
          heat: getHeatScore('article', a.id),
          relatedToolSlugs: [tool.slug],
        }
      })

    const seen = new Set<string>()
    const merged: RelatedReviewItem[] = []
    for (const item of [...fromSeed, ...fromArticles]) {
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

  if (!tool) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Empty description="没有找到这个产品" style={{ marginTop: 48 }}>
          <Link to={ROUTES.TOOLS}>
            <Button type="primary">返回 AI导航</Button>
          </Link>
        </Empty>
      </motion.div>
    )
  }

  const reviewHref = writeReviewPath(tool.slug)

  return (
    <motion.div
      className={styles.detail}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={ROUTES.TOOLS} className={styles.back}>
        <ArrowLeftOutlined /> 返回 AI导航
      </Link>

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
          <p className={styles.sectionBody}>{tool.audience}</p>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>定价参考</h3>
          <p className={styles.sectionBody}>{tool.pricing}（以官网最新为准）</p>
        </section>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>典型用法</h3>
        <ul className={styles.bulletList}>
          {tool.useCases.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
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
            <Link to={reviewHref}>
              <Button type="primary" icon={<EditOutlined />}>
                去写评测
              </Button>
            </Link>
          </div>
        </div>

        {relatedReviews.length === 0 ? (
          <Empty
            description="还没有相关评测，来写第一篇？"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to={reviewHref}>
              <Button type="primary" icon={<EditOutlined />}>
                去写评测
              </Button>
            </Link>
          </Empty>
        ) : (
          <ul className={styles.reviewList}>
            {relatedReviews.map((r) => (
              <li key={r.key}>
                <Link to={r.to} className={styles.reviewCard}>
                  <div className={styles.reviewMain}>
                    <span className={styles.reviewTitle}>{r.title}</span>
                    <span className={styles.reviewExcerpt}>{r.excerpt}</span>
                    <div className={styles.reviewMeta}>
                      <span>{r.authorName}</span>
                      <span>{formatDateTime(r.updatedAt)}</span>
                      <span>
                        {r.likes} 赞 · {r.comments} 评
                      </span>
                    </div>
                    {r.relatedToolSlugs.length > 1 ? (
                      <div className={styles.reviewTools}>
                        {r.relatedToolSlugs.map((s) => {
                          const name = getSeedTool(s)?.name ?? s
                          if (s === tool.slug) {
                            return (
                              <Tag key={s} className={styles.miniToolTag}>
                                {name}
                              </Tag>
                            )
                          }
                          return (
                            <Link
                              key={s}
                              to={toolDetailPath(s)}
                              className={styles.miniToolLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tag className={styles.miniToolTag}>{name}</Tag>
                            </Link>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  )
}
