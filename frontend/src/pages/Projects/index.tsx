import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Segmented,
  Skeleton,
  Space,
  Tag,
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
import { fetchLikeSummary } from '../../api/social'
import type { PublicProject } from '../../mocks/publicDemo'
import { CATALOG_PAGE_SIZE } from '../../constants/catalog'
import { projectDetailPath, ROUTES } from '../../router/paths'
import { loadPublicProjects } from '../../services/publicContent'
import { isLoggedIn } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import { getLikeCount } from '../../utils/socialStorage'
import styles from '../../styles/ui.module.css'

function techTags(techStack: string | null) {
  if (!techStack) return []
  return techStack
    .split(/[,，/|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5)
}

export function ProjectsPage() {
  const { message } = App.useApp()
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({})
  const [fromDemo, setFromDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(CATALOG_PAGE_SIZE)
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadPublicProjects()
      .then(async (res) => {
        if (cancelled) return
        setProjects(res.items)
        setFromDemo(res.fromDemo)

        if (res.fromDemo) {
          const demoCounts: Record<number, number> = {}
          for (const p of res.items) {
            demoCounts[p.id] = getLikeCount('project', p.id)
          }
          setLikeCounts(demoCounts)
          return
        }

        const entries = await Promise.all(
          res.items.map(async (p) => {
            try {
              const r = await fetchLikeSummary('project', p.id)
              return [p.id, r.data.data.likeCount] as const
            } catch {
              return [p.id, 0] as const
            }
          }),
        )
        if (!cancelled) setLikeCounts(Object.fromEntries(entries))
      })
      .catch(() => {
        if (!cancelled) message.error('项目列表加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [message])

  const sorted = useMemo(() => {
    const list = [...projects]
    if (sort === 'hot') {
      list.sort((a, b) => (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0))
    } else {
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
    return list
  }, [projects, sort, likeCounts])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            项目
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            作品集式浏览：支持最新 / 最热排序；点作者进入主页。
          </Typography.Paragraph>
        </div>
        <Space wrap>
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
            <Link to={ROUTES.STUDIO_PROJECT_NEW}>
              <Button type="primary" icon={<PlusOutlined />}>
                新建项目
              </Button>
            </Link>
          ) : null}
        </Space>
      </div>

      {fromDemo ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="当前展示演示项目"
          description="点赞会影响「最热」排序；后端接入后自动切换。"
        />
      ) : null}

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : projects.length === 0 ? (
        <Empty description="暂无已发布项目" />
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
            {pageItems.map((project) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={project.id} style={{ display: 'flex' }}>
                <motion.div
                  className={styles.catalogCardMotion}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={projectDetailPath(project.id)}
                    className={`${styles.cardLink} ${styles.catalogCardLink}`}
                  >
                    <Card
                      className={`${styles.contentCard} ${styles.catalogCard}`}
                      variant="borderless"
                    >
                      <CoverStrip title={project.name} tone={coverToneFromId(project.id)} compact />
                      <Typography.Title level={5} className={styles.catalogCardTitle}>
                        {project.name}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className={styles.catalogCardExcerpt}>
                        {excerpt(project.description, 72)}
                      </Typography.Paragraph>
                      <Space size={[4, 4]} wrap className={styles.catalogCardTags}>
                        {techTags(project.techStack).map((tag) => (
                          <Tag key={tag} color="green">
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                      <div className={styles.catalogCardMeta}>
                        <AuthorChip
                          authorId={project.authorId || undefined}
                          authorName={project.authorName}
                          avatarUrl={project.avatarUrl}
                          size={22}
                        />
                        <Typography.Text type="secondary" className={styles.muted}>
                          {sort === 'hot'
                            ? `${likeCounts[project.id] ?? 0} 赞`
                            : formatDateTime(project.createdAt)}
                        </Typography.Text>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
        </CatalogListLayout>
      )}
    </motion.div>
  )
}
