import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Col, Empty, Row, Space, Tabs, Tag, Typography } from 'antd'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import {
  DEMO_ARTICLES,
  DEMO_CREATORS,
  DEMO_PROJECTS,
  getDemoCreator,
  type PublicArticle,
  type PublicProject,
} from '../../mocks/publicDemo'
import { articleDetailPath, projectDetailPath, ROUTES, userProfilePath } from '../../router/paths'
import { loadPublicArticles, loadPublicProjects } from '../../services/publicContent'
import { isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { excerpt } from '../../utils/format'
import { getFollowingIds, subscribeSocialChange } from '../../utils/socialStorage'
import styles from './Home.module.css'
import ui from '../../styles/ui.module.css'

const { Title, Paragraph } = Typography

export function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [fromDemo, setFromDemo] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [followingIds, setFollowingIds] = useState(getFollowingIds)

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setFollowingIds(getFollowingIds())
    })
  }, [])

  useEffect(() => {
    return subscribeSocialChange(() => setFollowingIds(getFollowingIds()))
  }, [])

  useEffect(() => {
    Promise.all([loadPublicArticles(), loadPublicProjects()]).then(([a, p]) => {
      setArticles(a.items)
      setProjects(p.items)
      setFromDemo(a.fromDemo || p.fromDemo)
    })
  }, [])

  const latestMix = useMemo(() => {
    const rows: Array<
      | { type: 'article'; item: PublicArticle; at: string }
      | { type: 'project'; item: PublicProject; at: string }
    > = [
      ...articles.map((item) => ({ type: 'article' as const, item, at: item.updatedAt })),
      ...projects.map((item) => ({ type: 'project' as const, item, at: item.updatedAt })),
    ]
    return rows.sort((x, y) => y.at.localeCompare(x.at)).slice(0, 6)
  }, [articles, projects])

  const followingFeed = useMemo(() => {
    const sourceArticles = fromDemo ? DEMO_ARTICLES : articles
    const sourceProjects = fromDemo ? DEMO_PROJECTS : projects
    const rows = [
      ...sourceArticles
        .filter((a) => followingIds.includes(a.authorId))
        .map((item) => ({ type: 'article' as const, item, at: item.updatedAt })),
      ...sourceProjects
        .filter((p) => followingIds.includes(p.authorId))
        .map((item) => ({ type: 'project' as const, item, at: item.updatedAt })),
    ]
    return rows.sort((x, y) => y.at.localeCompare(x.at))
  }, [articles, projects, followingIds, fromDemo])

  return (
    <div>
      <section className={styles.hero}>
        <motion.p
          className={styles.brand}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          Personal Hub
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <Title level={1} className={styles.headline}>
            创作者的内容主场
          </Title>
          <Paragraph className={styles.lead}>
            写文章、晒项目，草稿打磨后再发布。关注同行，让作品被看见。
          </Paragraph>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <Space size="middle" wrap className={styles.actions}>
            <Link to={ROUTES.ARTICLES}>
              <Button type="primary" size="large" className={styles.cta}>
                阅读文章
              </Button>
            </Link>
            <Link to={ROUTES.PROJECTS}>
              <Button size="large" className={styles.ctaGhost}>
                浏览项目
              </Button>
            </Link>
            <Link to={loggedIn ? ROUTES.STUDIO : ROUTES.REGISTER}>
              <Button type="link" size="large">
                {loggedIn ? '进入创作台' : '加入创作'}
              </Button>
            </Link>
          </Space>
        </motion.div>
      </section>

      <motion.section
        className={ui.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {fromDemo ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="演示数据模式"
            description="后端无数据或不可用时，已加载多创作者示例内容，可完整走通关注与互动流程。"
          />
        ) : null}

        <div className={ui.pageHead} style={{ marginBottom: 8 }}>
          <Typography.Title level={3} className={ui.pageTitle}>
            发现
          </Typography.Title>
          <Space wrap>
            {DEMO_CREATORS.map((c) => (
              <Link key={c.id} to={userProfilePath(c.id)}>
                <Tag color="green">{c.displayName}</Tag>
              </Link>
            ))}
          </Space>
        </div>

        <Tabs
          items={[
            {
              key: 'latest',
              label: '最新',
              children: (
                <Row gutter={[16, 16]}>
                  {latestMix.map((row) =>
                    row.type === 'article' ? (
                      <Col xs={24} md={12} lg={8} key={`a-${row.item.id}`}>
                        <Link to={articleDetailPath(row.item.id)} className={ui.cardLink}>
                          <Card className={ui.contentCard} variant="borderless">
                            <Tag style={{ marginBottom: 8 }}>文章</Tag>
                            <Typography.Title level={5}>{row.item.title}</Typography.Title>
                            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                              {excerpt(row.item.content, 80)}
                            </Typography.Paragraph>
                            <AuthorChip
                              authorId={row.item.authorId || undefined}
                              authorName={row.item.authorName}
                              avatarUrl={getDemoCreator(row.item.authorId)?.avatarUrl}
                            />
                          </Card>
                        </Link>
                      </Col>
                    ) : (
                      <Col xs={24} md={12} lg={8} key={`p-${row.item.id}`}>
                        <Link to={projectDetailPath(row.item.id)} className={ui.cardLink}>
                          <Card className={ui.contentCard} variant="borderless">
                            <Tag color="purple" style={{ marginBottom: 8 }}>
                              项目
                            </Tag>
                            <Typography.Title level={5}>{row.item.name}</Typography.Title>
                            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                              {excerpt(row.item.description, 80)}
                            </Typography.Paragraph>
                            <AuthorChip
                              authorId={row.item.authorId || undefined}
                              authorName={row.item.authorName}
                              avatarUrl={getDemoCreator(row.item.authorId)?.avatarUrl}
                            />
                          </Card>
                        </Link>
                      </Col>
                    ),
                  )}
                </Row>
              ),
            },
            {
              key: 'following',
              label: '关注动态',
              children: !loggedIn ? (
                <Empty
                  description={
                    <span>
                      <Link to={ROUTES.LOGIN}>登录</Link> 并关注创作者后，这里会汇聚他们的新发布
                    </span>
                  }
                />
              ) : followingFeed.length === 0 ? (
                <Empty
                  description={
                    <span>
                      还没有关注动态。去看看{' '}
                      <Link to={userProfilePath(1)}>Alice</Link> /{' '}
                      <Link to={userProfilePath(2)}>Bob</Link> /{' '}
                      <Link to={userProfilePath(3)}>ZZX</Link>
                    </span>
                  }
                />
              ) : (
                <Row gutter={[16, 16]}>
                  {followingFeed.map((row) =>
                    row.type === 'article' ? (
                      <Col xs={24} md={12} key={`fa-${row.item.id}`}>
                        <Link to={articleDetailPath(row.item.id)} className={ui.cardLink}>
                          <Card className={ui.contentCard} variant="borderless">
                            <Typography.Title level={5}>{row.item.title}</Typography.Title>
                            <AuthorChip
                              authorId={row.item.authorId}
                              authorName={row.item.authorName}
                              avatarUrl={getDemoCreator(row.item.authorId)?.avatarUrl}
                            />
                          </Card>
                        </Link>
                      </Col>
                    ) : (
                      <Col xs={24} md={12} key={`fp-${row.item.id}`}>
                        <Link to={projectDetailPath(row.item.id)} className={ui.cardLink}>
                          <Card className={ui.contentCard} variant="borderless">
                            <Typography.Title level={5}>{row.item.name}</Typography.Title>
                            <AuthorChip
                              authorId={row.item.authorId}
                              authorName={row.item.authorName}
                              avatarUrl={getDemoCreator(row.item.authorId)?.avatarUrl}
                            />
                          </Card>
                        </Link>
                      </Col>
                    ),
                  )}
                </Row>
              ),
            },
          ]}
        />
      </motion.section>
    </div>
  )
}
