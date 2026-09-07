import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Result,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tabs,
  Typography,
} from 'antd'
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { BackNavButton } from '../../components/BackNavButton'
import {
  CatalogListLayout,
  CatalogPager,
} from '../../components/CatalogPager'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
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
import type { Profile } from '../../types/profile'
import type { Article } from '../../types/article'
import type { Project } from '../../types/project'
import styles from '../../styles/ui.module.css'

/**
 * 公开作者主页：资料与已发布作品来自 /api/users/{id}；关注走服务端 API。
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
  const [articlesPage, setArticlesPage] = useState(1)
  const [projectsPage, setProjectsPage] = useState(1)
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
    setArticlesPage(1)
    setProjectsPage(1)

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

  const pagedArticles = useMemo(() => {
    const start = (articlesPage - 1) * pageSize
    return articles.slice(start, start + pageSize)
  }, [articles, articlesPage, pageSize])

  const pagedProjects = useMemo(() => {
    const start = (projectsPage - 1) * pageSize
    return projects.slice(start, start + pageSize)
  }, [projects, projectsPage, pageSize])

  if (!userId) {
    return <Result status="404" title="创作者不存在" />
  }

  if (loading) {
    return <Skeleton active avatar paragraph={{ rows: 6 }} />
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

  async function onFollow() {
    if (!loggedIn) {
      message.info('登录后即可关注创作者')
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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <BackNavButton fallback={ROUTES.HOME} className={styles.pageBack} style={{ marginBottom: 12 }} />
      <Card className={styles.contentCard} variant="borderless" style={{ marginBottom: 24 }}>
        <Space align="start" size="large" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="start" size="large">
            <Avatar size={88} src={avatarUrl}>
              {displayName.slice(0, 1)}
            </Avatar>
            <div>
              <Typography.Title level={2} style={{ margin: 0, fontFamily: 'var(--ph-font-display)' }}>
                {displayName}
              </Typography.Title>
              <Typography.Text type="secondary">@{profile.username}</Typography.Text>
              {profile.email ? (
                <div style={{ marginTop: 4 }}>
                  <Typography.Text type="secondary">{profile.email}</Typography.Text>
                </div>
              ) : null}
              <Typography.Paragraph style={{ marginTop: 12, maxWidth: 480 }}>
                {profile.bio || '这个人很懒，还没有简介。'}
              </Typography.Paragraph>
              <Space size="large">
                <Link to={userFollowersPath(profile.userId)}>
                  <Statistic title="粉丝" value={followerCount} />
                </Link>
                <Link to={userFollowingPath(profile.userId)}>
                  <Statistic title="关注" value={followingCount} />
                </Link>
                <Statistic title="作品" value={articles.length + projects.length} />
              </Space>
            </div>
          </Space>
          {!isSelf ? (
            <Button
              type={following ? 'default' : 'primary'}
              icon={following ? <UserDeleteOutlined /> : <UserAddOutlined />}
              loading={followBusy}
              onClick={() => void onFollow()}
            >
              {following ? '已关注' : '关注'}
            </Button>
          ) : (
            <Link to={ROUTES.STUDIO_PROFILE}>
              <Button>编辑我的资料</Button>
            </Link>
          )}
        </Space>
      </Card>

      <Tabs
        items={[
          {
            key: 'articles',
            label: `文章 ${articles.length}`,
            children:
              articles.length === 0 ? (
                <Empty description="暂无已发布文章" />
              ) : (
                <CatalogListLayout
                  pageSize={pageSize}
                  pager={
                    <CatalogPager
                      current={articlesPage}
                      pageSize={pageSize}
                      total={articles.length}
                      onChange={(p, ps) => {
                        if (ps !== pageSize) {
                          setPageSize(ps)
                          setArticlesPage(1)
                          setProjectsPage(1)
                        } else {
                          setArticlesPage(p)
                        }
                      }}
                    />
                  }
                >
                  <Row gutter={[14, 14]}>
                    {pagedArticles.map((a) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={a.id} style={{ display: 'flex' }}>
                        <motion.div
                          className={styles.catalogCardMotion}
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            to={articleDetailPath(a.id)}
                            className={`${styles.cardLink} ${styles.catalogCardLink}`}
                          >
                            <Card
                              className={`${styles.contentCard} ${styles.catalogCard}`}
                              variant="borderless"
                            >
                              <CoverStrip
                                title={a.title}
                                tone={coverToneFromId(a.id)}
                                compact
                              />
                              <Typography.Title level={5} className={styles.catalogCardTitle}>
                                {a.title}
                              </Typography.Title>
                              <Typography.Paragraph
                                type="secondary"
                                className={styles.catalogCardExcerpt}
                              >
                                {excerpt(a.content, 72)}
                              </Typography.Paragraph>
                              <div className={styles.catalogCardMeta}>
                                <Typography.Text type="secondary" className={styles.muted}>
                                  {formatDateTime(a.createdAt)}
                                </Typography.Text>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </CatalogListLayout>
              ),
          },
          {
            key: 'projects',
            label: `项目 ${projects.length}`,
            children:
              projects.length === 0 ? (
                <Empty description="暂无已发布项目" />
              ) : (
                <CatalogListLayout
                  pageSize={pageSize}
                  pager={
                    <CatalogPager
                      current={projectsPage}
                      pageSize={pageSize}
                      total={projects.length}
                      onChange={(p, ps) => {
                        if (ps !== pageSize) {
                          setPageSize(ps)
                          setArticlesPage(1)
                          setProjectsPage(1)
                        } else {
                          setProjectsPage(p)
                        }
                      }}
                    />
                  }
                >
                  <Row gutter={[14, 14]}>
                    {pagedProjects.map((p) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={p.id} style={{ display: 'flex' }}>
                        <motion.div
                          className={styles.catalogCardMotion}
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            to={projectDetailPath(p.id)}
                            className={`${styles.cardLink} ${styles.catalogCardLink}`}
                          >
                            <Card
                              className={`${styles.contentCard} ${styles.catalogCard}`}
                              variant="borderless"
                            >
                              <CoverStrip
                                title={p.name}
                                tone={coverToneFromId(p.id)}
                                compact
                              />
                              <Typography.Title level={5} className={styles.catalogCardTitle}>
                                {p.name}
                              </Typography.Title>
                              <Typography.Paragraph
                                type="secondary"
                                className={styles.catalogCardExcerpt}
                              >
                                {excerpt(p.description, 72)}
                              </Typography.Paragraph>
                              <div className={styles.catalogCardMeta}>
                                <Typography.Text type="secondary" className={styles.muted}>
                                  {formatDateTime(p.createdAt)}
                                </Typography.Text>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </CatalogListLayout>
              ),
          },
        ]}
      />
    </motion.div>
  )
}
