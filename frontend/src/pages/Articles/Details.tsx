import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Result, Skeleton, Space, Typography } from 'antd'
import { motion } from 'framer-motion'

import { AdminDeletedActions } from '../../components/AdminDeletedActions'
import { AuthorChip } from '../../components/AuthorChip'
import { BackNavButton } from '../../components/BackNavButton'
import { MarkdownBody } from '../../components/MarkdownBody'
import { OwnerContentActions } from '../../components/OwnerContentActions'
import { ReadingProgress } from '../../components/ReadingProgress'
import { RelatedToolsBlock } from '../../components/RelatedToolsBlock'
import { ShareCard } from '../../components/ShareCard'
import { SocialPanel } from '../../components/SocialPanel'
import { coverMediaStyle } from '../../components/CoverStrip'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { PublicArticle } from '../../mocks/publicDemo'
import {
  articleEditPath,
  projectDetailPath,
  ROUTES,
} from '../../router/paths'
import { loadArticleForViewer } from '../../services/publicContent'
import { loadHubTools } from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import { getArticleToolBindings } from '../../utils/articleToolBindings'
import { getUserId } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<PublicArticle | null>(null)
  const [relatedTools, setRelatedTools] = useState<HubTool[]>([])
  const [adminDeletedPreview, setAdminDeletedPreview] = useState(false)
  const [deletedAt, setDeletedAt] = useState<string | null>(null)
  const [purgeAt, setPurgeAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)
  const [meId, setMeId] = useState(getUserId)

  if (id !== loadedId) {
    setLoadedId(id)
    setLoading(true)
    setArticle(null)
    setRelatedTools([])
    setAdminDeletedPreview(false)
    setDeletedAt(null)
    setPurgeAt(null)
    setError('')
  }

  useEffect(() => {
    setMeId(getUserId())
  }, [id])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    loadArticleForViewer(id)
      .then(async (res) => {
        if (cancelled) return
        setArticle(res.item)
        setAdminDeletedPreview(res.adminDeletedPreview)
        setDeletedAt(res.deletedAt ?? null)
        setPurgeAt(res.purgeAt ?? null)
        setError(res.item ? '' : '评测不存在或加载失败')

        if (res.item) {
          const fromApi = res.item.relatedToolSlugs ?? []
          const fromLocal = getArticleToolBindings(res.item.id)
          const slugs = fromApi.length > 0 ? fromApi : fromLocal
          if (slugs.length === 0) {
            setRelatedTools([])
            return
          }
          const all = await loadHubTools()
          if (cancelled) return
          const bySlug = new Map(all.map((t) => [t.slug, t]))
          setRelatedTools(slugs.map((s) => bySlug.get(s)).filter(Boolean) as HubTool[])
        } else {
          setRelatedTools([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  usePageMeta(
    article?.published && !adminDeletedPreview
      ? {
          title: article.title,
          description: excerpt(article.content, 120),
          image: relatedTools[0]?.logoUrl ?? undefined,
          type: 'article',
        }
      : null,
  )

  if (!id) {
    return (
      <Result
        status="404"
        title="评测不存在"
        extra={<BackNavButton fallback={ROUTES.ARTICLES} type="primary" />}
      />
    )
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  if (error || !article) {
    return (
      <Result
        status="404"
        title={error || '评测不存在'}
        extra={<BackNavButton fallback={ROUTES.ARTICLES} type="primary" />}
      />
    )
  }

  const isOwner = meId != null && article.authorId === meId
  const backFallback = adminDeletedPreview
    ? ROUTES.ADMIN_ARTICLES_DELETED
    : isOwner
      ? article.published
        ? ROUTES.STUDIO_ARTICLE_PUBLISHED
        : ROUTES.STUDIO_ARTICLE_DRAFTS
      : ROUTES.ARTICLES

  return (
    <>
      {article.published && !adminDeletedPreview ? <ReadingProgress /> : null}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 760, margin: '0 auto' }}
      >
        <Space style={{ marginBottom: 16 }}>
          <BackNavButton fallback={backFallback} />
        </Space>

        {adminDeletedPreview ? (
          <AdminDeletedActions
            kind="article"
            contentId={article.id}
            published={article.published}
            deletedAt={deletedAt}
            purgeAt={purgeAt}
          />
        ) : isOwner ? (
          <OwnerContentActions
            kind="article"
            contentId={article.id}
            published={article.published}
            editPath={articleEditPath(article.id)}
            draftsPath={ROUTES.STUDIO_ARTICLE_DRAFTS}
            publishedPath={ROUTES.STUDIO_ARTICLE_PUBLISHED}
          />
        ) : null}

        <Typography.Title level={1} style={{ fontFamily: 'var(--ph-font-display)', marginBottom: 8 }}>
          {article.title}
        </Typography.Title>
        <Space wrap style={{ marginBottom: 12 }}>
          <AuthorChip
            authorId={article.authorId || undefined}
            authorName={article.authorName}
            avatarUrl={article.avatarUrl}
          />
          <Typography.Text type="secondary">{formatDateTime(article.createdAt)}</Typography.Text>
          {article.relatedProjectId ? (
            <Link to={projectDetailPath(article.relatedProjectId)}>
              <Typography.Link style={{ fontSize: 13, color: 'rgba(140, 165, 195, 0.85)' }}>
                相关笔记
              </Typography.Link>
            </Link>
          ) : null}
        </Space>

        <RelatedToolsBlock tools={relatedTools} />

        <div className={styles.articleBody} style={{ marginTop: 28 }}>
          <MarkdownBody content={article.content} />
        </div>

        {!adminDeletedPreview ? (
          <>
            <div style={{ marginTop: 32 }}>
              <ShareCard
                title={article.title}
                description={excerpt(article.content, 120)}
                mediaStyle={coverMediaStyle(
                  relatedTools[0]?.logoUrl,
                  article.id,
                  article.coverTone,
                )}
              />
            </div>
            {article.published ? <SocialPanel kind="article" contentId={article.id} /> : null}
          </>
        ) : null}
      </motion.article>
    </>
  )
}
