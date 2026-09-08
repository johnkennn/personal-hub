import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Result, Skeleton, Tag, Typography } from 'antd'
import { LinkOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { BackNavButton } from '../../components/BackNavButton'
import { coverToneFromId } from '../../components/CoverStrip'
import { ShareCard } from '../../components/ShareCard'
import { SocialPanel } from '../../components/SocialPanel'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { PublicArticle, PublicProject } from '../../mocks/publicDemo'
import { articleDetailPath, ROUTES } from '../../router/paths'
import {
  loadPublicProject,
  loadRelatedArticlesForProject,
} from '../../services/publicContent'
import { excerpt, formatDateTime } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import styles from './Showcase.module.css'

const TONES: Record<string, string> = {
  moss: 'linear-gradient(135deg, #1a3d30 0%, #2f6b52 45%, #7cb89a 100%)',
  ink: 'linear-gradient(135deg, #101820 0%, #1c2e38 50%, #3d6b7a 100%)',
  ember: 'linear-gradient(135deg, #2a1810 0%, #5a3420 50%, #c4845a 100%)',
  dusk: 'linear-gradient(145deg, #152018 0%, #24352c 50%, #4d6b5a 100%)',
  default: 'linear-gradient(135deg, #14201b 0%, #243830 50%, #4a7a62 100%)',
}

/**
 * 项目展映页：故事 / 技术 / 演示 / 制作特辑 / 分享
 */
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<PublicProject | null>(null)
  const [related, setRelated] = useState<PublicArticle[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)

  if (id !== loadedId) {
    setLoadedId(id)
    setLoading(true)
    setProject(null)
    setRelated([])
    setError('')
  }

  useEffect(() => {
    if (!id) return
    let cancelled = false
    Promise.all([loadPublicProject(id), loadRelatedArticlesForProject(id)])
      .then(([projectRes, relatedRes]) => {
        if (cancelled) return
        setProject(projectRes.item)
        setRelated(relatedRes.items)
        setError(projectRes.item ? '' : '项目不存在或加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const cover = project ? resolveMediaUrl(project.coverUrl) || undefined : undefined
  const tone = project
    ? TONES[coverToneFromId(project.id)] ?? TONES.default
    : TONES.default
  const lead = project ? excerpt(project.description, 96) : ''

  usePageMeta(
    project
      ? {
          title: project.name,
          description: lead,
          image: cover,
          type: 'article',
        }
      : null,
  )

  if (!id) {
    return (
      <Result
        status="404"
        title="项目不存在"
        extra={<BackNavButton fallback={ROUTES.PROJECTS} type="primary" />}
      />
    )
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />
  }

  if (error || !project) {
    return (
      <Result
        status="404"
        title={error || '项目不存在'}
        extra={<BackNavButton fallback={ROUTES.PROJECTS} type="primary" />}
      />
    )
  }

  const tags = (project.techStack ?? '')
    .split(/[,，/|]/)
    .map((t) => t.trim())
    .filter(Boolean)
  const mediaStyle = cover
    ? { backgroundImage: `url(${cover})` }
    : { backgroundImage: tone }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <motion.div
          className={styles.heroMedia}
          style={mediaStyle}
          initial={{ scale: 1.06, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className={styles.heroShade} aria-hidden />
        <div className={styles.heroInner}>
          <BackNavButton fallback={ROUTES.PROJECTS} className={styles.back} />
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            作品展映
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
          >
            <Typography.Title level={1} className={styles.title}>
              {project.name}
            </Typography.Title>
            <Typography.Paragraph className={styles.lead}>{lead}</Typography.Paragraph>
          </motion.div>
          <motion.div
            className={styles.meta}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <AuthorChip
              authorId={project.authorId || undefined}
              authorName={project.authorName}
              avatarUrl={project.avatarUrl}
            />
            <Typography.Text type="secondary">{formatDateTime(project.createdAt)}</Typography.Text>
          </motion.div>
          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            {project.demoUrl ? (
              <Button
                className={styles.ctaPrimary}
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                icon={<PlayCircleOutlined />}
              >
                观看演示
              </Button>
            ) : null}
            {project.repoUrl ? (
              <Button
                className={styles.ctaGhost}
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                icon={<LinkOutlined />}
              >
                打开仓库
              </Button>
            ) : null}
          </motion.div>
        </div>
      </section>

      <div className={styles.body}>
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
        >
          <Typography.Title level={2} className={styles.sectionTitle}>
            故事
          </Typography.Title>
          <Typography.Paragraph className={styles.sectionDesc}>
            这个作品要解决什么问题、为什么值得做成产品。
          </Typography.Paragraph>
          <p className={styles.story}>{project.description}</p>
        </motion.section>

        {tags.length > 0 ? (
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
          >
            <Typography.Title level={2} className={styles.sectionTitle}>
              技术
            </Typography.Title>
            <Typography.Paragraph className={styles.sectionDesc}>
              支撑作品落地的关键技术栈。
            </Typography.Paragraph>
            <div className={styles.techList}>
              {tags.map((tag) => (
                <Tag key={tag} className={styles.techChip}>
                  {tag}
                </Tag>
              ))}
            </div>
          </motion.section>
        ) : null}

        {(project.demoUrl || project.repoUrl) && (
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
          >
            <Typography.Title level={2} className={styles.sectionTitle}>
              演示
            </Typography.Title>
            <Typography.Paragraph className={styles.sectionDesc}>
              亲自体验，或从仓库继续探索。
            </Typography.Paragraph>
            <div className={styles.linkCard}>
              {project.demoUrl ? (
                <Button type="primary" href={project.demoUrl} target="_blank" rel="noreferrer">
                  打开 Demo
                </Button>
              ) : null}
              {project.repoUrl ? (
                <Button href={project.repoUrl} target="_blank" rel="noreferrer">
                  查看 Repository
                </Button>
              ) : null}
            </div>
          </motion.section>
        )}

        {related.length > 0 ? (
          <motion.section
            className={styles.section}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
          >
            <Typography.Title level={2} className={styles.sectionTitle}>
              制作特辑
            </Typography.Title>
            <Typography.Paragraph className={styles.sectionDesc}>
              与本作品相关的构建日志与文章。
            </Typography.Paragraph>
            <ul className={styles.featureList}>
              {related.map((a) => (
                <li key={a.id}>
                  <Link to={articleDetailPath(a.id)} className={styles.featureLink}>
                    <span className={styles.featureTitle}>{a.title}</span>
                    <span className={styles.featureMeta}>{formatDateTime(a.updatedAt)}</span>
                    <Typography.Paragraph className={styles.featureExcerpt}>
                      {excerpt(a.content, 88)}
                    </Typography.Paragraph>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        ) : null}

        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
        >
          <ShareCard
            title={project.name}
            description={project.description}
            mediaStyle={mediaStyle}
          />
        </motion.section>

        <div className={styles.socialWrap}>
          <SocialPanel kind="project" contentId={project.id} />
        </div>
      </div>
    </div>
  )
}
