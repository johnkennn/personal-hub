import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Result, Skeleton, Space, Tag, Typography } from 'antd'
import { ArrowLeftOutlined, LinkOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { SocialPanel } from '../../components/SocialPanel'
import { getDemoCreator, type PublicProject } from '../../mocks/publicDemo'
import { ROUTES } from '../../router/paths'
import { loadPublicProject } from '../../services/publicContent'
import { formatDateTime } from '../../utils/format'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<PublicProject | null>(null)
  const [fromDemo, setFromDemo] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)

  // id 变化时在渲染期重置，避免在 effect 里同步 setState
  if (id !== loadedId) {
    setLoadedId(id)
    setLoading(true)
    setProject(null)
    setFromDemo(false)
    setError('')
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false
    loadPublicProject(id)
      .then((res) => {
        if (cancelled) return
        setProject(res.item)
        setFromDemo(res.fromDemo)
        setError(res.item ? '' : '项目不存在或加载失败')
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
        title="项目不存在"
        extra={
          <Link to={ROUTES.PROJECTS}>
            <Button type="primary">返回列表</Button>
          </Link>
        }
      />
    )
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />
  }

  if (error || !project) {
    return (
      <Result
        status="404"
        title={error || '项目不存在'}
        extra={
          <Link to={ROUTES.PROJECTS}>
            <Button type="primary">返回列表</Button>
          </Link>
        }
      />
    )
  }

  const tags = (project.techStack ?? '')
    .split(/[,，/|]/)
    .map((t) => t.trim())
    .filter(Boolean)
  const creator = getDemoCreator(project.authorId)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 760, margin: '0 auto' }}
    >
      <Link to={ROUTES.PROJECTS}>
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }}>
          返回列表
        </Button>
      </Link>

      {fromDemo ? (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message="演示内容" />
      ) : null}

      <Typography.Title level={1} style={{ fontFamily: 'var(--ph-font-display)', marginBottom: 8 }}>
        {project.name}
      </Typography.Title>
      <Space wrap style={{ marginBottom: 8 }}>
        <AuthorChip
          authorId={project.authorId || undefined}
          authorName={project.authorName}
          avatarUrl={creator?.avatarUrl}
        />
        <Typography.Text type="secondary">{formatDateTime(project.createdAt)}</Typography.Text>
      </Space>

      <Typography.Paragraph style={{ marginTop: 24, fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
        {project.description}
      </Typography.Paragraph>

      {tags.length > 0 ? (
        <Space wrap style={{ marginBottom: 16 }}>
          {tags.map((tag) => (
            <Tag key={tag} color="green">
              {tag}
            </Tag>
          ))}
        </Space>
      ) : null}

      <Space wrap>
        {project.repoUrl ? (
          <Button href={project.repoUrl} target="_blank" icon={<LinkOutlined />}>
            Repository
          </Button>
        ) : null}
        {project.demoUrl ? (
          <Button type="primary" href={project.demoUrl} target="_blank" icon={<LinkOutlined />}>
            Demo
          </Button>
        ) : null}
      </Space>

      <SocialPanel kind="project" contentId={project.id} />
    </motion.article>
  )
}
