import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  App,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { getDemoCreator, type PublicProject } from '../../mocks/publicDemo'
import { projectDetailPath, ROUTES } from '../../router/paths'
import { loadPublicProjects } from '../../services/publicContent'
import { isLoggedIn } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

const PAGE_SIZE = 6

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
  const [fromDemo, setFromDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadPublicProjects()
      .then((res) => {
        setProjects(res.items)
        setFromDemo(res.fromDemo)
      })
      .catch(() => message.error('项目列表加载失败'))
      .finally(() => setLoading(false))
  }, [message])

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return projects.slice(start, start + PAGE_SIZE)
  }, [projects, page])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            项目
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            作品集式浏览：一句话介绍、技术栈与作者主页。
          </Typography.Paragraph>
        </div>
        {isLoggedIn() ? (
          <Link to={ROUTES.STUDIO_PROJECT_NEW}>
            <Button type="primary" icon={<PlusOutlined />}>
              新建项目
            </Button>
          </Link>
        ) : null}
      </div>

      {fromDemo ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="当前展示演示项目"
          description="后端接入真实列表后将自动切换。"
        />
      ) : null}

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : projects.length === 0 ? (
        <Empty description="暂无已发布项目" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {pageItems.map((project) => (
              <Col xs={24} md={12} lg={8} key={project.id}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Link to={projectDetailPath(project.id)} className={styles.cardLink}>
                    <Card className={styles.contentCard} variant="borderless" styles={{ body: { paddingTop: 16 } }}>
                      <CoverStrip title={project.name} tone={coverToneFromId(project.id)} />
                      <Typography.Title level={4} style={{ marginTop: 0 }}>
                        {project.name}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary">
                        {excerpt(project.description)}
                      </Typography.Paragraph>
                      <Space size={[4, 8]} wrap style={{ marginBottom: 12 }}>
                        {techTags(project.techStack).map((tag) => (
                          <Tag key={tag} color="green">
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <AuthorChip
                          authorId={project.authorId || undefined}
                          authorName={project.authorName}
                          avatarUrl={getDemoCreator(project.authorId)?.avatarUrl}
                        />
                        <Typography.Text type="secondary">{formatDateTime(project.createdAt)}</Typography.Text>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={projects.length}
              onChange={setPage}
              showTotal={(total) => `共 ${total} 条`}
              hideOnSinglePage={false}
            />
          </div>
        </>
      )}
    </motion.div>
  )
}
