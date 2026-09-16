import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  App,
  Avatar,
  Button,
  Empty,
  Result,
  Skeleton,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { BackNavButton } from '../../components/BackNavButton'
import { CatalogListLayout, CatalogPager } from '../../components/CatalogPager'
import { coverMediaStyle } from '../../components/CoverStrip'
import {
  fetchPublicProfile,
  fetchUserArticles,
  fetchUserProjects,
  followUser,
  unfollowUser,
} from '../../api/users'
import { CATALOG_PAGE_SIZE } from '../../constants/catalog'
import {
  articleDetailPath,
  projectDetailPath,
  ROUTES,
  userFollowersPath,
  userFollowingPath,
} from '../../router/paths'
import { getUserId, isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { ensureLoggedIn } from '../../utils/requireLogin'
import { usePageMeta } from '../../hooks/usePageMeta'
import type { Profile } from '../../types/profile'
import type { Article } from '../../types/article'
import type { Project } from '../../types/project'
import gallery from './Gallery.module.css'
import styles from '../../styles/ui.module.css'

type TimelineItem =
  | { kind: 'article'; at: string; data: Article }
  | { kind: 'project'; at: string; data: Project }

/**
 * 公开作者主页 → 个人展厅：头图身份区 + 近期作品 + 时间轴。
 * 精选置顶待后端字段；本期用「最近更新的项目」作为展映焦点。
 */
export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { message } = App.useApp()

  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [meId, setMeId] = useState(getUserId)
  const [loading, setLoading] = useState(true)
  const [followBusy, setFollowBusy] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [timelinePage, setTimelinePage] = useState(1)
  const [pageSize, setPageSize] = useState(CATALOG_PAGE_SIZE)

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setMeId(getUserId())
    })
  }, [])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setTimelinePage(1)

    Promise.all([
      fetchPublicProfile(userId),
      fetchUserArticles(userId),
      fetchUserProjects(userId),
    ])
      .then(([profileRes, articlesRes, projectsRes]) => {
        if (cancelled) return
        const p = profileRes.data.data
        setProfile(p)
        setArticles(articlesRes.data.data ?? [])
        setProjects(projectsRes.data.data ?? [])
        setFollowerCount(p.followerCount ?? 0)
        setFollowingCount(p.followingCount ?? 0)
        setFollowing(Boolean(p.following))
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true)
          setProfile(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const timeline = useMemo(() => {
    const rows: TimelineItem[] = [
      ...articles.map((data) => ({
        kind: 'article' as const,
        at: data.updatedAt || data.createdAt,
        data,
      })),
      ...projects.map((data) => ({
        kind: 'project' as const,
        at: data.updatedAt || data.createdAt,
        data,
      })),
    ]
    return rows.sort((a, b) => b.at.localeCompare(a.at))
  }, [articles, projects])

  const spotlight = useMemo(() => {
    if (projects.length === 0) return null
    return [...projects].sort((a, b) =>
      (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt),
    )[0]
  }, [projects])

  const pagedTimeline = useMemo(() => {
    const start = (timelinePage - 1) * pageSize
    return timeline.slice(start, start + pageSize)
  }, [timeline, timelinePage, pageSize])

  const displayNamePreview =
    profile?.nickname?.trim() || profile?.username || '创作者'
  usePageMeta(
    profile
      ? {
          title: `${displayNamePreview} 的展厅`,
          description: profile.bio || `${displayNamePreview} 在 Personal Hub 的作品展厅`,
          image: resolveMediaUrl(profile.avatarUrl),
        }
      : null,
  )

  if (!userId) {
    return <Result status="404" title="创作者不存在" />
  }

  if (loading) {
    return <Skeleton active avatar paragraph={{ rows: 8 }} />
  }

  if (notFound || !profile) {
    return (
      <Result
        status="404"
        title="创作者不存在"
        extra={<BackNavButton fallback={ROUTES.HOME} type="primary" />}
      />
    )
  }

  const displayName = profile.nickname?.trim() || profile.username
  const isSelf = loggedIn && meId != null && meId === profile.userId
  const avatarUrl = resolveMediaUrl(profile.avatarUrl) || undefined
  const workCount = articles.length + projects.length

  async function onFollow() {
    if (!(await ensureLoggedIn({ content: '关注需要登录哦，要去登录吗？' }))) {
      return
    }
    if (followBusy || !profile) return
    setFollowBusy(true)
    const next = !following
    try {
      if (next) {
        await followUser(profile.userId)
        setFollowing(true)
        setFollowerCount((c) => c + 1)
        message.success(`已关注 ${displayName}`)
      } else {
        await unfollowUser(profile.userId)
        setFollowing(false)
        setFollowerCount((c) => Math.max(0, c - 1))
        message.success('已取消关注')
      }
    } catch {
      message.error(next ? '关注失败' : '取消关注失败')
    } finally {
      setFollowBusy(false)
    }
  }

  const spotlightStyle = spotlight
    ? coverMediaStyle(spotlight.coverUrl, spotlight.id)
    : undefined

  return (
    <div className={gallery.page}>
      <section className={gallery.hero}>
        <div className={gallery.heroInner}>
          <div>
            <BackNavButton fallback={ROUTES.HOME} className={styles.pageBack} />
            <div className={gallery.identity}>
              <Avatar size={96} src={avatarUrl} className={gallery.avatar}>
                {displayName.slice(0, 1)}
              </Avatar>
              <div>
                <motion.p
                  className={gallery.eyebrow}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  个人展厅
                </motion.p>
                <Typography.Title level={1} className={gallery.displayName}>
                  {displayName}
                </Typography.Title>
                <Typography.Text className={gallery.handle}>@{profile.username}</Typography.Text>
                <Typography.Paragraph className={gallery.bio}>
                  {profile.bio || '这位创作者还没有填写简介。'}
                </Typography.Paragraph>
                <div className={gallery.stats}>
                  <Link to={userFollowersPath(profile.userId)} className={gallery.statLink}>
                    <span className={gallery.statLabel}>粉丝</span>
                    <span className={gallery.statValue}>{followerCount}</span>
                  </Link>
                  <Link to={userFollowingPath(profile.userId)} className={gallery.statLink}>
                    <span className={gallery.statLabel}>关注</span>
                    <span className={gallery.statValue}>{followingCount}</span>
                  </Link>
                  <div>
                    <span className={gallery.statLabel}>作品</span>
                    <span className={gallery.statValue}>{workCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={gallery.actions}>
            {!isSelf ? (
              <Button
                type={following ? 'default' : 'primary'}
                size="large"
                icon={following ? <UserDeleteOutlined /> : <UserAddOutlined />}
                loading={followBusy}
                onClick={() => void onFollow()}
              >
                {following ? '已关注' : '关注'}
              </Button>
            ) : (
              <Link to={ROUTES.STUDIO_PROFILE}>
                <Button size="large">编辑我的资料</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className={gallery.body}>
        <Tabs
          className={gallery.tabsWrap}
          defaultActiveKey="timeline"
          items={[
            {
              key: 'timeline',
              label: `展映时间轴 ${workCount}`,
              children:
                workCount === 0 ? (
                  <Empty description="展厅还没有作品" />
                ) : (
                  <>
                    {spotlight ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <Link to={projectDetailPath(spotlight.id)} className={gallery.spotlight}>
                          <div
                            className={gallery.spotlightMedia}
                            style={spotlightStyle}
                          />
                          <div className={gallery.spotlightBody}>
                            <span className={gallery.spotlightLabel}>近期展映</span>
                            <Typography.Title level={3} className={gallery.spotlightTitle}>
                              {spotlight.name}
                            </Typography.Title>
                            <Typography.Paragraph className={gallery.spotlightExcerpt}>
                              {excerpt(spotlight.description, 110)}
                            </Typography.Paragraph>
                          </div>
                        </Link>
                      </motion.div>
                    ) : null}

                    <div className={gallery.sectionHead}>
                      <Typography.Title level={3} className={gallery.sectionTitle}>
                        时间轴
                      </Typography.Title>
                      <Typography.Paragraph className={gallery.sectionDesc}>
                        按更新时间浏览全部文章与项目。
                      </Typography.Paragraph>
                    </div>

                    <CatalogListLayout
                      pageSize={pageSize}
                      pager={
                        <CatalogPager
                          current={timelinePage}
                          pageSize={pageSize}
                          total={timeline.length}
                          onChange={(p, ps) => {
                            if (ps !== pageSize) {
                              setPageSize(ps)
                              setTimelinePage(1)
                            } else {
                              setTimelinePage(p)
                            }
                          }}
                        />
                      }
                    >
                      <ul className={gallery.timeline}>
                        {pagedTimeline.map((row) => {
                          const isArticle = row.kind === 'article'
                          const title = isArticle ? row.data.title : row.data.name
                          const body = isArticle ? row.data.content : row.data.description
                          const href = isArticle
                            ? articleDetailPath(row.data.id)
                            : projectDetailPath(row.data.id)
                          return (
                            <li
                              key={`${row.kind}-${row.data.id}`}
                              className={gallery.timelineItem}
                            >
                              <motion.div
                                initial={{ opacity: 0, x: 6 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-20px' }}
                                transition={{ duration: 0.3 }}
                              >
                                <Link to={href} className={gallery.workLink}>
                                  <div className={gallery.workTop}>
                                    <Tag
                                      className={gallery.workKind}
                                      color={isArticle ? undefined : 'green'}
                                    >
                                      {isArticle ? '文章' : '项目'}
                                    </Tag>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                      {formatDateTime(row.at)}
                                    </Typography.Text>
                                  </div>
                                  <Typography.Title level={5} className={gallery.workTitle}>
                                    {title}
                                  </Typography.Title>
                                  <Typography.Paragraph className={gallery.workExcerpt}>
                                    {excerpt(body, 90)}
                                  </Typography.Paragraph>
                                </Link>
                              </motion.div>
                            </li>
                          )
                        })}
                      </ul>
                    </CatalogListLayout>
                  </>
                ),
            },
            {
              key: 'projects',
              label: `项目 ${projects.length}`,
              children:
                projects.length === 0 ? (
                  <Empty description="暂无已发布项目" />
                ) : (
                  <ul className={gallery.timeline}>
                    {[...projects]
                      .sort((a, b) =>
                        (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt),
                      )
                      .map((p) => (
                        <li key={p.id} className={gallery.timelineItem}>
                          <Link to={projectDetailPath(p.id)} className={gallery.workLink}>
                            <div className={gallery.workTop}>
                              <Tag className={gallery.workKind} color="green">
                                项目
                              </Tag>
                              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {formatDateTime(p.updatedAt || p.createdAt)}
                              </Typography.Text>
                            </div>
                            <Typography.Title level={5} className={gallery.workTitle}>
                              {p.name}
                            </Typography.Title>
                            <Typography.Paragraph className={gallery.workExcerpt}>
                              {excerpt(p.description, 90)}
                            </Typography.Paragraph>
                          </Link>
                        </li>
                      ))}
                  </ul>
                ),
            },
            {
              key: 'articles',
              label: `文章 ${articles.length}`,
              children:
                articles.length === 0 ? (
                  <Empty description="暂无已发布文章" />
                ) : (
                  <ul className={gallery.timeline}>
                    {[...articles]
                      .sort((a, b) =>
                        (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt),
                      )
                      .map((a) => (
                        <li key={a.id} className={gallery.timelineItem}>
                          <Link to={articleDetailPath(a.id)} className={gallery.workLink}>
                            <div className={gallery.workTop}>
                              <Tag className={gallery.workKind}>文章</Tag>
                              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                {formatDateTime(a.updatedAt || a.createdAt)}
                              </Typography.Text>
                            </div>
                            <Typography.Title level={5} className={gallery.workTitle}>
                              {a.title}
                            </Typography.Title>
                            <Typography.Paragraph className={gallery.workExcerpt}>
                              {excerpt(a.content, 90)}
                            </Typography.Paragraph>
                          </Link>
                        </li>
                      ))}
                  </ul>
                ),
            },
          ]}
        />
      </div>
    </div>
  )
}
