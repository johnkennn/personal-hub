import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import {
  CatalogListLayout,
  CatalogPager,
} from '../../components/CatalogPager'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { WeeklyScreenings } from '../../components/WeeklyScreenings'
import { fetchFeedHot, fetchFollowingFeed, type FeedItem } from '../../api/feed'
import { getDemoCreator, type PublicArticle, type PublicProject } from '../../mocks/publicDemo'
import { CATALOG_PAGE_SIZE } from '../../constants/catalog'
import { articleDetailPath, projectDetailPath, ROUTES, userProfilePath } from '../../router/paths'
import { loadDiscoverCatalog } from '../../services/publicContent'
import { isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import styles from './Home.module.css'
import ui from '../../styles/ui.module.css'

const { Title, Paragraph } = Typography

type FeedRow =
  | { type: 'article'; item: PublicArticle; at: string }
  | { type: 'project'; item: PublicProject; at: string }

type AuthorChipItem = {
  id: number
  name: string
  avatarUrl?: string
}

function likeKey(type: 'article' | 'project', id: number) {
  return `${type}:${id}`
}

function mapFeedToRows(
  items: FeedItem[],
  articleMap: Map<number, PublicArticle>,
  projectMap: Map<number, PublicProject>,
): FeedRow[] {
  const rows: FeedRow[] = []
  for (const f of items) {
    if (f.type === 'ARTICLE') {
      const item =
        articleMap.get(f.id) ??
        ({
          id: f.id,
          title: f.titleOrName,
          content: '',
          published: true,
          authorId: f.authorId,
          authorName: f.authorUsername,
          createdAt: f.createdAt,
          updatedAt: f.createdAt,
        } satisfies PublicArticle)
      rows.push({ type: 'article', item, at: item.updatedAt || f.createdAt })
    } else {
      const item =
        projectMap.get(f.id) ??
        ({
          id: f.id,
          name: f.titleOrName,
          description: '',
          techStack: null,
          repoUrl: null,
          demoUrl: null,
          published: true,
          authorId: f.authorId,
          authorName: f.authorUsername,
          createdAt: f.createdAt,
          updatedAt: f.createdAt,
        } satisfies PublicProject)
      rows.push({ type: 'project', item, at: item.updatedAt || f.createdAt })
    }
  }
  return rows.sort((x, y) => y.at.localeCompare(x.at))
}

function FeedGrid({
  rows,
  page,
  pageSize,
  onPageChange,
  metaMode = 'date',
  likeCounts,
}: {
  rows: FeedRow[]
  page: number
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
  metaMode?: 'date' | 'likes'
  likeCounts?: Record<string, number>
}) {
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  if (rows.length === 0) {
    return <Empty description="暂无公开作品" />
  }

  return (
    <CatalogListLayout
      pageSize={pageSize}
      pager={
        <CatalogPager
          current={page}
          pageSize={pageSize}
          total={rows.length}
          onChange={onPageChange}
        />
      }
    >
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
          const likes = likeCounts?.[likeKey(row.type, id)] ?? 0

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
                        {metaMode === 'likes' ? `${likes} 赞` : formatDateTime(row.item.createdAt)}
                      </Typography.Text>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </Col>
          )
        })}
      </Row>
    </CatalogListLayout>
  )
}

export function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [projects, setProjects] = useState<PublicProject[]>([])
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [followingFeedItems, setFollowingFeedItems] = useState<FeedItem[] | null>(null)
  const [hotReady, setHotReady] = useState(false)
  const [latestPage, setLatestPage] = useState(1)
  const [hotPage, setHotPage] = useState(1)
  const [followingPage, setFollowingPage] = useState(1)
  const [pageSize, setPageSize] = useState(CATALOG_PAGE_SIZE)
  const [activeTab, setActiveTab] = useState('latest')

  function onCatalogPageChange(
    setTabPage: (p: number) => void,
    nextPage: number,
    nextPageSize: number,
  ) {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize)
      setLatestPage(1)
      setHotPage(1)
      setFollowingPage(1)
    } else {
      setTabPage(nextPage)
    }
  }

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setFollowingFeedItems(null)
    })
  }, [])

  // 首屏：只要文章 + 项目列表（本周上映 / 最新），不再逐条拉点赞
  useEffect(() => {
    let cancelled = false
    loadDiscoverCatalog().then((data) => {
      if (cancelled) return
      setArticles(data.articles)
      setProjects(data.projects)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 「最热」：一次 /api/feed/hot，服务端已批量算赞
  useEffect(() => {
    if (activeTab !== 'hot' || hotReady) return
    let cancelled = false
    fetchFeedHot(100)
      .then((res) => {
        if (cancelled) return
        const counts: Record<string, number> = {}
        for (const item of res.data.data ?? []) {
          const kind = item.type === 'ARTICLE' ? 'article' : 'project'
          counts[likeKey(kind, item.id)] = item.likeCount ?? 0
        }
        setLikeCounts(counts)
        setHotReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setLikeCounts({})
          setHotReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, hotReady])

  // 「我的关注」：切到该 Tab 再请求，一次 following feed
  useEffect(() => {
    if (activeTab !== 'following' || !loggedIn || followingFeedItems != null) return
    let cancelled = false
    fetchFollowingFeed()
      .then((res) => {
        if (!cancelled) setFollowingFeedItems(res.data.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setFollowingFeedItems([])
      })
    return () => {
      cancelled = true
    }
  }, [activeTab, loggedIn, followingFeedItems])

  const latestMix = useMemo(() => {
    const rows: FeedRow[] = [
      ...articles.map((item) => ({ type: 'article' as const, item, at: item.updatedAt })),
      ...projects.map((item) => ({ type: 'project' as const, item, at: item.updatedAt })),
    ]
    return rows.sort((x, y) => y.at.localeCompare(x.at))
  }, [articles, projects])

  const hotMix = useMemo(() => {
    const rows: FeedRow[] = [
      ...articles.map((item) => ({ type: 'article' as const, item, at: item.updatedAt })),
      ...projects.map((item) => ({ type: 'project' as const, item, at: item.updatedAt })),
    ]
    return rows.sort(
      (x, y) =>
        (likeCounts[likeKey(y.type, y.item.id)] ?? 0) -
        (likeCounts[likeKey(x.type, x.item.id)] ?? 0),
    )
  }, [articles, projects, likeCounts])

  const followingRows = useMemo(() => {
    if (followingFeedItems == null) return null
    const articleMap = new Map(articles.map((a) => [a.id, a]))
    const projectMap = new Map(projects.map((p) => [p.id, p]))
    return mapFeedToRows(followingFeedItems, articleMap, projectMap)
  }, [followingFeedItems, articles, projects])

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
        <WeeklyScreenings projects={projects} />

        <div className={ui.pageHead} style={{ marginBottom: 12 }}>
          <div>
            <Typography.Title level={3} className={ui.pageTitle}>
              发现
            </Typography.Title>
            <Typography.Paragraph className={ui.pageDesc}>
              全部公开内容：最新 / 最热 / 我的关注；默认每页 8 条，可改条数并翻页。
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
            if (key === 'hot') setHotPage(1)
            if (key === 'following') setFollowingPage(1)
          }}
          items={[
            {
              key: 'latest',
              label: '最新',
              children: (
                <FeedGrid
                  rows={latestMix}
                  page={latestPage}
                  pageSize={pageSize}
                  onPageChange={(p, ps) => onCatalogPageChange(setLatestPage, p, ps)}
                />
              ),
            },
            {
              key: 'hot',
              label: '最热',
              children: !hotReady ? (
                <Empty description="加载最热内容…" />
              ) : (
                <FeedGrid
                  rows={hotMix}
                  page={hotPage}
                  pageSize={pageSize}
                  onPageChange={(p, ps) => onCatalogPageChange(setHotPage, p, ps)}
                  metaMode="likes"
                  likeCounts={likeCounts}
                />
              ),
            },
            {
              key: 'following',
              label: '我的关注',
              children: !loggedIn ? (
                <Empty
                  description={
                    <span>
                      <Link to={ROUTES.LOGIN}>登录</Link> 并关注创作者后，这里会汇聚他们的新发布
                    </span>
                  }
                />
              ) : followingRows == null ? (
                <Empty description="加载关注动态…" />
              ) : followingRows.length === 0 ? (
                <Empty
                  description={
                    authors.length > 0 ? (
                      <span>
                        还没有关注内容。去看看{' '}
                        {authors.slice(0, 3).map((c, i) => (
                          <span key={c.id}>
                            {i > 0 ? ' / ' : null}
                            <Link to={userProfilePath(c.id)}>{c.name}</Link>
                          </span>
                        ))}
                      </span>
                    ) : (
                      '还没有关注内容'
                    )
                  }
                />
              ) : (
                <FeedGrid
                  rows={followingRows}
                  page={followingPage}
                  pageSize={pageSize}
                  onPageChange={(p, ps) => onCatalogPageChange(setFollowingPage, p, ps)}
                />
              ),
            },
          ]}
        />
      </motion.section>
    </div>
  )
}
