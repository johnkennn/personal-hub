import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Result, Skeleton, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { MarkdownBody } from '../../components/MarkdownBody'
import { ReadingProgress } from '../../components/ReadingProgress'
import { SocialPanel } from '../../components/SocialPanel'
import { getDemoCreator, type PublicArticle } from '../../mocks/publicDemo'
import { ROUTES } from '../../router/paths'
import { loadPublicArticle } from '../../services/publicContent'
import { formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<PublicArticle | null>(null)
  const [fromDemo, setFromDemo] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)

  if (id !== loadedId) {
    setLoadedId(id)
    setLoading(true)
    setArticle(null)
    setFromDemo(false)
    setError('')
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false
    loadPublicArticle(id)
      .then((res) => {
        if (cancelled) return
        setArticle(res.item)
        setFromDemo(res.fromDemo)
        setError(res.item ? '' : '文章不存在或加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) {
    return (
      <Result
        status="404"
        title="文章不存在"
        extra={
          <Link to={ROUTES.ARTICLES}>
            <Button type="primary">返回列表</Button>
          </Link>
        }
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
        extra={
          <Link to={ROUTES.ARTICLES}>
            <Button type="primary">返回列表</Button>
          </Link>
        }
      />
    )
  }

  const creator = getDemoCreator(article.authorId)

  return (
    <>
      <ReadingProgress />
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: 760, margin: '0 auto' }}
      >
        <Space style={{ marginBottom: 16 }}>
          <Link to={ROUTES.ARTICLES}>
            <Button type="text" icon={<ArrowLeftOutlined />}>
              返回列表
            </Button>
          </Link>
        </Space>

        {fromDemo ? (
          <Alert type="info" showIcon style={{ marginBottom: 16 }} message="演示内容（支持 Markdown 渲染）" />
        ) : null}

        <Typography.Title level={1} style={{ fontFamily: 'var(--ph-font-display)', marginBottom: 8 }}>
          {article.title}
        </Typography.Title>
        <Space wrap style={{ marginBottom: 8 }}>
          <AuthorChip
            authorId={article.authorId || undefined}
            authorName={article.authorName}
            avatarUrl={creator?.avatarUrl}
          />
          <Typography.Text type="secondary">{formatDateTime(article.createdAt)}</Typography.Text>
        </Space>

        <div className={styles.articleBody} style={{ marginTop: 28 }}>
          <MarkdownBody content={article.content} />
        </div>

        <SocialPanel kind="article" contentId={article.id} />
      </motion.article>
    </>
  )
}
