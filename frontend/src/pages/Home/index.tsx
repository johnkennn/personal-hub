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
import { resolveMediaUrl } from '../../utils/mediaUrl'
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

/** 关注流 FeedItem → 与最新/最热同一套卡片数据 */
function followingItemToRow(item: FeedItem): FeedRow {
  const authorName = (item.authorDisplayName || item.authorUsername || '未知作者').trim()
  const avatarUrl = resolveMediaUrl(item.authorAvatarUrl) || undefined
  if (item.type === 'ARTICLE') {
    return {
      type: 'article',
      at: item.createdAt,
      item: {
        id: item.id,
        title: item.titleOrName,
        content: item.excerpt || '',
        published: true,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        authorId: item.authorId,
        authorName,
        avatarUrl,
        coverUrl: item.coverUrl,
      },
    }
  }
  return {
    type: 'project',
    at: item.createdAt,
    item: {
      id: item.id,
      name: item.titleOrName,
      description: item.excerpt || '',
      techStack: null,
      repoUrl: null,
      demoUrl: null,
      published: true,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
      authorId: item.authorId,
      authorName,
      avatarUrl,
      coverUrl: item.coverUrl,
    },
  }
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
          const coverUrl = row.item.coverUrl
          const likes = likeCounts?.[likeKey(row.type, id)] ?? 0

          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={`${row.type}-${id}`} style={{ display: 'flex' }}>
              <motion.div
                className={ui.catalogCardMotion}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`${ui.cardLink} ${ui.catalogCardShell}`}>
                  <Link to={href} className={ui.catalogCardHit} aria-label={title} />
                  <Card className={`${ui.contentCard} ${ui.catalogCard}`} variant="borderless">
                    <CoverStrip title={title} tone={tone} coverUrl={coverUrl} compact />
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
                    <div className={`${ui.catalogCardMeta} ${ui.catalogCardMetaInteractive}`}>
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
                </div>
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

  // 每次进入发现页强制拉最新公开内容（写操作后不会看到旧缓存）
  useEffect(() => {
    let cancelled = false
    loadDiscoverCatalog(true).then((data) => {
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

  const followingMix = useMemo(() => {
    if (!followingFeedItems) return []
    return followingFeedItems.map(followingItemToRow)
  }, [followingFeedItems])

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
                      <Link to={ROUTES.LOGIN}>登录</Link> 后查看关注作者的新作品
                    </span>
                  }
                />
              ) : followingFeedItems == null ? (
                <Empty description="加载关注动态…" />
              ) : followingMix.length === 0 ? (
                <Empty
                  description={
                    <span>
                      还没有关注动态。去{' '}
                      <Link to={ROUTES.ARTICLES}>文章</Link> /{' '}
                      <Link to={ROUTES.PROJECTS}>项目</Link> 页关注感兴趣的创作者吧
                    </span>
                  }
                />
              ) : (
                <FeedGrid
                  rows={followingMix}
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
