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
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { getDemoCreator, type PublicArticle, type PublicProject } from '../../mocks/publicDemo'
import { fetchFollowing } from '../../api/users'
import { articleDetailPath, projectDetailPath, ROUTES, userProfilePath } from '../../router/paths'
import { loadPublicArticles, loadPublicProjects } from '../../services/publicContent'
import { getUserId, isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import styles from './Home.module.css'
import ui from '../../styles/ui.module.css'

const { Title, Paragraph } = Typography

const PAGE_SIZE = 12

type FeedRow =
  | { type: 'article'; item: PublicArticle; at: string }
  | { type: 'project'; item: PublicProject; at: string }

type AuthorChipItem = {
  id: number
  name: string
  avatarUrl?: string
}

function FeedGrid({
  rows,
  page,
  onPageChange,
}: {
  rows: FeedRow[]
  page: number
  onPageChange: (p: number) => void
}) {
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return rows.slice(start, start + PAGE_SIZE)
  }, [rows, page])

  if (rows.length === 0) {
    return <Empty description="暂无公开作品" />
  }

  return (
    <>
      <Row gutter={[14, 14]}>
        {pageItems.map((row) => {
          const isArticle = row.type === 'article'
          const id = row.item.id
          const title = isArticle ? row.item.title : row.item.name
          const body = isArticle ? row.item.content : row.item.description
          const href = isArticle ? articleDetailPath(id) : projectDetailPath(id)
          const tone = isArticle
            ? (row.item.coverTone ?? coverToneFromId(id))
            : coverToneFromId(id)

          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={`${row.type}-${id}`} style={{ display: 'flex' }}>
              <motion.div
                className={ui.catalogCardMotion}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <Link to={href} className={`${ui.cardLink} ${ui.catalogCardLink}`}>
                  <Card className={`${ui.contentCard} ${ui.catalogCard}`} variant="borderless">
                    <CoverStrip title={title} tone={tone} compact />
                    <Tag
                      color={isArticle ? undefined : 'green'}
                      style={{ marginBottom: 8, width: 'fit-content' }}
                    >
                      {isArticle ? '文章' : '项目'}
                    </Tag>
                    <Typography.Title level={5} className={ui.catalogCardTitle}>
                      {title}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" className={ui.catalogCardExcerpt}>
                      {excerpt(body, 72)}
                    </Typography.Paragraph>
                    <div className={ui.catalogCardMeta}>
                      <AuthorChip
                        authorId={row.item.authorId || undefined}
                        authorName={row.item.authorName}
                        avatarUrl={row.item.avatarUrl}
                        size={22}
                      />
                      <Typography.Text type="secondary" className={ui.muted}>
                        {formatDateTime(row.item.createdAt)}
                      </Typography.Text>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </Col>
          )
        })}
      </Row>
      <div className={styles.pager}>
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={rows.length}
          onChange={onPageChange}
          showTotal={(total) => `共 ${total} 条`}
          hideOnSinglePage={false}
        />
      </div>
    </>
  )
}

export function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [fromDemo, setFromDemo] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [followingIds, setFollowingIds] = useState<number[]>([])
  const [latestPage, setLatestPage] = useState(1)
  const [followingPage, setFollowingPage] = useState(1)
  const [activeTab, setActiveTab] = useState('latest')

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
    })
  }, [])

  useEffect(() => {
    Promise.all([loadPublicArticles(), loadPublicProjects()]).then(([a, p]) => {
      setArticles(a.items)
      setProjects(p.items)
      setFromDemo(a.fromDemo || p.fromDemo)
    })
  }, [])

  useEffect(() => {
    if (!loggedIn) {
      setFollowingIds([])
      return
    }
    const me = getUserId()
    if (me == null) {
      setFollowingIds([])
      return
    }
    let cancelled = false
    fetchFollowing(me, 0, 100)
      .then((res) => {
        if (cancelled) return
        setFollowingIds((res.data.data.items ?? []).map((u) => u.userId))
      })
      .catch(() => {
        if (!cancelled) setFollowingIds([])
      })
    return () => {
      cancelled = true
    }
  }, [loggedIn, activeTab])

  const latestMix = useMemo(() => {
    const rows: FeedRow[] = [
      ...articles.map((item) => ({ type: 'article' as const, item, at: item.updatedAt })),
      ...projects.map((item) => ({ type: 'project' as const, item, at: item.updatedAt })),
    ]
    return rows.sort((x, y) => y.at.localeCompare(x.at))
  }, [articles, projects])

  const authors = useMemo(() => {
    const map = new Map<number, AuthorChipItem>()
    for (const a of articles) {
      if (!a.authorId || map.has(a.authorId)) continue
      map.set(a.authorId, {
        id: a.authorId,
        name: a.authorName,
        avatarUrl: a.avatarUrl ?? getDemoCreator(a.authorId)?.avatarUrl,
      })
    }
    for (const p of projects) {
      if (!p.authorId || map.has(p.authorId)) continue
      map.set(p.authorId, {
        id: p.authorId,
        name: p.authorName,
        avatarUrl: p.avatarUrl ?? getDemoCreator(p.authorId)?.avatarUrl,
      })
    }
    return [...map.values()].slice(0, 8)
  }, [articles, projects])

  const followingFeed = useMemo(() => {
    const rows: FeedRow[] = [
      ...articles
        .filter((a) => followingIds.includes(a.authorId))
        .map((item) => ({ type: 'article' as const, item, at: item.updatedAt })),
      ...projects
        .filter((p) => followingIds.includes(p.authorId))
        .map((item) => ({ type: 'project' as const, item, at: item.updatedAt })),
    ]
    return rows.sort((x, y) => y.at.localeCompare(x.at))
  }, [articles, projects, followingIds])

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroContent}>
          <motion.p
            className={styles.brand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Personal Hub
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <Title level={1} className={styles.headline}>
              创作者的内容主场
            </Title>
            <Paragraph className={styles.lead}>
              写文章、晒项目，草稿打磨后再发布。关注同行，让作品被看见。
            </Paragraph>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <Space size="middle" wrap className={styles.actions}>
              <Link to={ROUTES.ARTICLES}>
                <Button size="large" className={styles.ctaEqual}>
                  阅读文章
                </Button>
              </Link>
              <Link to={ROUTES.PROJECTS}>
                <Button size="large" className={styles.ctaEqual}>
                  浏览项目
                </Button>
              </Link>
              <Link to={loggedIn ? ROUTES.STUDIO : ROUTES.REGISTER}>
                <Button size="large" className={styles.ctaEqual}>
                  {loggedIn ? '进入个人中心' : '加入创作'}
                </Button>
              </Link>
            </Space>
          </motion.div>
        </div>
      </section>

      <motion.section
        className={styles.discover}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        {fromDemo ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="演示数据模式"
            description="后端无数据或不可用时，已加载示例内容（显式降级，非静默假数据）。"
          />
        ) : null}

        <div className={ui.pageHead} style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title level={3} className={ui.pageTitle}>
              发现
            </Typography.Title>
            <Typography.Paragraph className={ui.pageDesc}>
              最新作品流；卡片样式与文章 / 项目列表一致，可上下翻页浏览。
            </Typography.Paragraph>
          </div>
          <Space wrap className={styles.creatorTags}>
            {authors.map((c) => (
              <Link key={c.id} to={userProfilePath(c.id)}>
                <Tag color="green">{c.name}</Tag>
              </Link>
            ))}
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key)
            if (key === 'latest') setLatestPage(1)
            if (key === 'following') setFollowingPage(1)
          }}
          items={[
            {
              key: 'latest',
              label: '最新',
              children: (
                <FeedGrid rows={latestMix} page={latestPage} onPageChange={setLatestPage} />
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
                    authors.length > 0 ? (
                      <span>
                        还没有关注动态。去看看{' '}
                        {authors.slice(0, 3).map((c, i) => (
                          <span key={c.id}>
                            {i > 0 ? ' / ' : null}
                            <Link to={userProfilePath(c.id)}>{c.name}</Link>
                          </span>
                        ))}
                      </span>
                    ) : (
                      '还没有关注动态'
                    )
                  }
                />
              ) : (
                <FeedGrid
                  rows={followingFeed}
                  page={followingPage}
                  onPageChange={setFollowingPage}
                />
              ),
            },
          ]}
        />
      </motion.section>
    </div>
  )
}
