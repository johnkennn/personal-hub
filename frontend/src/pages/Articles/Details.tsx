import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Result, Skeleton, Space, Typography } from 'antd'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { BackNavButton } from '../../components/BackNavButton'
import { MarkdownBody } from '../../components/MarkdownBody'
import { ReadingProgress } from '../../components/ReadingProgress'
import { ShareCard } from '../../components/ShareCard'
import { SocialPanel } from '../../components/SocialPanel'
import { coverToneFromId } from '../../components/CoverStrip'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { PublicArticle } from '../../mocks/publicDemo'
import { projectDetailPath, ROUTES } from '../../router/paths'
import { loadPublicArticle } from '../../services/publicContent'
import { excerpt, formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

const ARTICLE_TONES: Record<string, string> = {
  moss: 'linear-gradient(135deg, #1a3d30 0%, #2f6b52 45%, #7cb89a 100%)',
  ink: 'linear-gradient(135deg, #101820 0%, #1c2e38 50%, #3d6b7a 100%)',
  ember: 'linear-gradient(135deg, #2a1810 0%, #5a3420 50%, #c4845a 100%)',
  dusk: 'linear-gradient(145deg, #152018 0%, #24352c 50%, #4d6b5a 100%)',
  default: 'linear-gradient(135deg, #14201b 0%, #243830 50%, #4a7a62 100%)',
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<PublicArticle | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)

  if (id !== loadedId) {
    setLoadedId(id)
    setLoading(true)
    setArticle(null)
    setError('')
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false
    loadPublicArticle(id)
      .then((res) => {
        if (cancelled) return
        setArticle(res.item)
        setError(res.item ? '' : '文章不存在或加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  usePageMeta(
    article
      ? {
          title: article.title,
          description: excerpt(article.content, 120),
          type: 'article',
        }
      : null,
  )

  if (!id) {
    return (
      <Result
        status="404"
        title="文章不存在"
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
        title={error || '文章不存在'}
        extra={<BackNavButton fallback={ROUTES.ARTICLES} type="primary" />}
      />
    )
  }

  const tone =
    ARTICLE_TONES[coverToneFromId(article.id)] ?? ARTICLE_TONES.default

  return (
    <>
      <ReadingProgress />
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 760, margin: '0 auto' }}
      >
        <Space style={{ marginBottom: 16 }}>
          <BackNavButton fallback={ROUTES.ARTICLES} />
        </Space>

        <Typography.Title level={1} style={{ fontFamily: 'var(--ph-font-display)', marginBottom: 8 }}>
          {article.title}
        </Typography.Title>
        <Space wrap style={{ marginBottom: 8 }}>
          <AuthorChip
            authorId={article.authorId || undefined}
            authorName={article.authorName}
            avatarUrl={article.avatarUrl}
          />
          <Typography.Text type="secondary">{formatDateTime(article.createdAt)}</Typography.Text>
          {article.relatedProjectId ? (
            <Link to={projectDetailPath(article.relatedProjectId)}>
              <Typography.Link>查看关联展映</Typography.Link>
            </Link>
          ) : null}
        </Space>

        <div className={styles.articleBody} style={{ marginTop: 28 }}>
          <MarkdownBody content={article.content} />
        </div>

        <div style={{ marginTop: 32 }}>
          <ShareCard
            title={article.title}
            description={excerpt(article.content, 120)}
            mediaStyle={{ backgroundImage: tone }}
          />
        </div>

        <SocialPanel kind="article" contentId={article.id} />
      </motion.article>
    </>
  )
}
