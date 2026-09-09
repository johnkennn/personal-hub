import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Image, Result, Skeleton, Tag, Typography } from 'antd'
import { LinkOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AdminDeletedActions } from '../../components/AdminDeletedActions'
import { AuthorChip } from '../../components/AuthorChip'
import { BackNavButton } from '../../components/BackNavButton'
import { coverMediaStyle } from '../../components/CoverStrip'
import { OwnerContentActions } from '../../components/OwnerContentActions'
import { ShareCard } from '../../components/ShareCard'
import { SocialPanel } from '../../components/SocialPanel'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { PublicArticle, PublicProject } from '../../mocks/publicDemo'
import { articleDetailPath, projectEditPath, ROUTES } from '../../router/paths'
import { fetchAdminDeletedProjectMedia } from '../../api/adminDeleted'
import { fetchMyProjectMedia, fetchProjectMedia } from '../../api/project'
import type { ProjectMedia } from '../../types/projectMedia'
import {
  loadProjectForViewer,
  loadRelatedArticlesForProject,
} from '../../services/publicContent'
import { getUserId } from '../../utils/authStorage'
import { excerpt, formatDateTime, splitTechStack } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import styles from './Showcase.module.css'

function ShowcaseSection({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: ReactNode
}) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
    >
      <Typography.Title level={2} className={styles.sectionTitle}>
        {title}
      </Typography.Title>
      <Typography.Paragraph className={styles.sectionDesc}>{desc}</Typography.Paragraph>
      {children}
    </motion.section>
  )
}

/** 项目展映页：故事 / 技术 / 画廊 / 制作特辑 / 分享 */
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<PublicProject | null>(null)
  const [related, setRelated] = useState<PublicArticle[]>([])
  const [gallery, setGallery] = useState<ProjectMedia[]>([])
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
    setProject(null)
    setRelated([])
    setGallery([])
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
    loadProjectForViewer(id)
      .then(async (projectRes) => {
        if (cancelled) return
        setProject(projectRes.item)
        setAdminDeletedPreview(projectRes.adminDeletedPreview)
        setDeletedAt(projectRes.deletedAt ?? null)
        setPurgeAt(projectRes.purgeAt ?? null)
        if (!projectRes.item) {
          setRelated([])
          setGallery([])
          setError('项目不存在或加载失败')
          return
        }
        setError('')
        const isDeletedAdmin = projectRes.adminDeletedPreview
        const isDraft = !projectRes.item.published
        const mediaFetcher = isDeletedAdmin
          ? fetchAdminDeletedProjectMedia
          : isDraft
            ? fetchMyProjectMedia
            : fetchProjectMedia
        const [relatedRes, mediaItems] = await Promise.all([
          isDraft || isDeletedAdmin
            ? Promise.resolve({ items: [] as PublicArticle[] })
            : loadRelatedArticlesForProject(id),
          mediaFetcher(id)
            .then((r) => r.data.data ?? [])
            .catch(() => [] as ProjectMedia[]),
        ])
        if (cancelled) return
        setRelated(relatedRes.items)
        setGallery(mediaItems)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const coverSource = project?.coverUrl || gallery[0]?.url
  const cover = resolveMediaUrl(coverSource)
  const lead = project ? excerpt(project.description, 96) : ''
  const mediaStyle = project ? coverMediaStyle(coverSource, project.id) : undefined

  usePageMeta(
    project?.published && !adminDeletedPreview
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

  if (error || !project || !mediaStyle) {
    return (
      <Result
        status="404"
        title={error || '项目不存在'}
        extra={<BackNavButton fallback={ROUTES.PROJECTS} type="primary" />}
      />
    )
  }

  const tags = splitTechStack(project.techStack)
  const isOwner = meId != null && project.authorId === meId
  const backFallback = adminDeletedPreview
    ? ROUTES.ADMIN_PROJECTS_DELETED
    : isOwner
      ? project.published
        ? ROUTES.STUDIO_PROJECT_PUBLISHED
        : ROUTES.STUDIO_PROJECT_DRAFTS
      : ROUTES.PROJECTS

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
          <BackNavButton fallback={backFallback} className={styles.back} />
          {adminDeletedPreview ? (
            <AdminDeletedActions
              kind="project"
              contentId={project.id}
              published={project.published}
              deletedAt={deletedAt}
              purgeAt={purgeAt}
            />
          ) : isOwner ? (
            <OwnerContentActions
              kind="project"
              contentId={project.id}
              published={project.published}
              editPath={projectEditPath(project.id)}
              draftsPath={ROUTES.STUDIO_PROJECT_DRAFTS}
              publishedPath={ROUTES.STUDIO_PROJECT_PUBLISHED}
            />
          ) : null}
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
        <ShowcaseSection title="故事" desc="这个作品要解决什么问题、为什么值得做成产品。">
          <p className={styles.story}>{project.description}</p>
        </ShowcaseSection>

        {tags.length > 0 ? (
          <ShowcaseSection title="技术" desc="支撑作品落地的关键技术栈。">
            <div className={styles.techList}>
              {tags.map((tag) => (
                <Tag key={tag} className={styles.techChip}>
                  {tag}
                </Tag>
              ))}
            </div>
          </ShowcaseSection>
        ) : null}

        {gallery.length > 0 ? (
          <ShowcaseSection title="画廊" desc="作品界面与现场截图，点击可放大预览。">
            <Image.PreviewGroup>
              <div className={styles.galleryGrid}>
                {gallery.map((m) => {
                  const src = resolveMediaUrl(m.url)
                  if (!src) return null
                  return (
                    <motion.div
                      key={m.id}
                      className={styles.galleryItem}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image src={src} alt="" className={styles.galleryImg} />
                    </motion.div>
                  )
                })}
              </div>
            </Image.PreviewGroup>
          </ShowcaseSection>
        ) : null}

        {related.length > 0 ? (
          <ShowcaseSection title="制作特辑" desc="与本作品相关的构建日志与文章。">
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
          </ShowcaseSection>
        ) : null}

        {!adminDeletedPreview ? (
          <>
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

            {project.published ? (
              <div className={styles.socialWrap}>
                <SocialPanel kind="project" contentId={project.id} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
