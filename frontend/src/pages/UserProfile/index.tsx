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
  Space,
  Statistic,
  Tabs,
  Typography,
} from 'antd'
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import {
  DEMO_CREATORS,
  getDemoArticlesByAuthor,
  getDemoCreator,
  getDemoProjectsByAuthor,
} from '../../mocks/publicDemo'
import { articleDetailPath, projectDetailPath, ROUTES, userProfilePath } from '../../router/paths'
import { getUsername, isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { excerpt } from '../../utils/format'
import {
  getFollowerCount,
  getFollowingCount,
  getFollowingIds,
  isFollowing,
  subscribeSocialChange,
  toggleFollow,
} from '../../utils/socialStorage'
import { pushActivity } from '../../utils/activityStorage'
import styles from '../../styles/ui.module.css'

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { message } = App.useApp()
  const creator = userId ? getDemoCreator(userId) : null
  const creatorId = creator?.id

  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [following, setFollowing] = useState(() =>
    creator ? isFollowing(creator.id) : false,
  )
  const [followerCount, setFollowerCount] = useState(() =>
    creator ? getFollowerCount(creator.id) : 0,
  )
  const [followingCount, setFollowingCount] = useState(() =>
    creator ? getFollowingCount(creator.username) : 0,
  )
  const [myFollowing, setMyFollowing] = useState(getFollowingIds)
  const [hydratedId, setHydratedId] = useState(creatorId)

  // userId / creator 变化时在渲染期同步本地关注态，避免 effect 内同步 setState
  if (creatorId !== hydratedId) {
    setHydratedId(creatorId)
    if (creator) {
      setFollowing(isFollowing(creator.id))
      setFollowerCount(getFollowerCount(creator.id))
      setFollowingCount(getFollowingCount(creator.username))
      setMyFollowing(getFollowingIds())
    } else {
      setFollowing(false)
      setFollowerCount(0)
      setFollowingCount(0)
      setMyFollowing([])
    }
  }

  useEffect(() => {
    if (!creator) return
    const id = creator.id
    const username = creator.username

    function refresh() {
      setFollowing(isFollowing(id))
      setFollowerCount(getFollowerCount(id))
      setFollowingCount(getFollowingCount(username))
      setMyFollowing(getFollowingIds())
    }

    const offS = subscribeSocialChange(refresh)
    const offA = subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      refresh()
    })
    return () => {
      offS()
      offA()
    }
  }, [creator])

  const articles = useMemo(
    () => (creator ? getDemoArticlesByAuthor(creator.id) : []),
    [creator],
  )
  const projects = useMemo(
    () => (creator ? getDemoProjectsByAuthor(creator.id) : []),
    [creator],
  )

  if (!creator) {
    return (
      <Result
        status="404"
        title="创作者不存在"
        subTitle="演示主页目前收录 alice / bob / zzx 三位创作者。"
        extra={
          <Space wrap>
            {DEMO_CREATORS.map((c) => (
              <Link key={c.id} to={userProfilePath(c.id)}>
                <Button>{c.displayName}</Button>
              </Link>
            ))}
          </Space>
        }
      />
    )
  }

  const profile = creator
  const isSelf = loggedIn && getUsername() === profile.username

  function onFollow() {
    try {
      const next = toggleFollow(profile.id)
      setFollowing(next)
      setFollowerCount(getFollowerCount(profile.id))
      setFollowingCount(getFollowingCount(profile.username))
      setMyFollowing(getFollowingIds())
      message.success(next ? `已关注 ${profile.displayName}` : '已取消关注')
      if (next) {
        pushActivity({
          title: `你关注了 ${profile.displayName}`,
          desc: '可在首页「关注动态」查看其新发布',
          href: userProfilePath(profile.id),
        })
      }
    } catch {
      message.info('登录后即可关注创作者')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={styles.contentCard} variant="borderless" style={{ marginBottom: 24 }}>
        <Space align="start" size="large" wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="start" size="large">
            <Avatar size={88} src={profile.avatarUrl}>
              {profile.displayName.slice(0, 1)}
            </Avatar>
            <div>
              <Typography.Title level={2} style={{ margin: 0, fontFamily: 'var(--ph-font-display)' }}>
                {profile.displayName}
              </Typography.Title>
              <Typography.Text type="secondary">@{profile.username}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 12, maxWidth: 480 }}>{profile.bio}</Typography.Paragraph>
              <Space size="large">
                <Statistic title="粉丝" value={followerCount} />
                <Statistic title="关注" value={followingCount} />
                <Statistic title="作品" value={articles.length + projects.length} />
              </Space>
            </div>
          </Space>
          {!isSelf ? (
            <Button
              type={following ? 'default' : 'primary'}
              icon={following ? <UserDeleteOutlined /> : <UserAddOutlined />}
              onClick={onFollow}
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

      {loggedIn && myFollowing.length > 0 ? (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          你已关注 {myFollowing.length} 位创作者
          {DEMO_CREATORS.filter((c) => myFollowing.includes(c.id)).map((c) => (
            <Link key={c.id} to={userProfilePath(c.id)} style={{ marginLeft: 8 }}>
              {c.displayName}
            </Link>
          ))}
        </Typography.Paragraph>
      ) : null}

      <Tabs
        items={[
          {
            key: 'articles',
            label: `文章 ${articles.length}`,
            children:
              articles.length === 0 ? (
                <Empty description="暂无已发布文章" />
              ) : (
                <Row gutter={[16, 16]}>
                  {articles.map((a) => (
                    <Col xs={24} md={12} key={a.id}>
                      <Link to={articleDetailPath(a.id)} className={styles.cardLink}>
                        <Card className={styles.contentCard} variant="borderless">
                          <Typography.Title level={5}>{a.title}</Typography.Title>
                          <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                            {excerpt(a.content, 90)}
                          </Typography.Paragraph>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              ),
          },
          {
            key: 'projects',
            label: `项目 ${projects.length}`,
            children:
              projects.length === 0 ? (
                <Empty description="暂无已发布项目" />
              ) : (
                <Row gutter={[16, 16]}>
                  {projects.map((p) => (
                    <Col xs={24} md={12} key={p.id}>
                      <Link to={projectDetailPath(p.id)} className={styles.cardLink}>
                        <Card className={styles.contentCard} variant="borderless">
                          <Typography.Title level={5}>{p.name}</Typography.Title>
                          <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                            {excerpt(p.description, 90)}
                          </Typography.Paragraph>
                        </Card>
                      </Link>
                    </Col>
                  ))}
                </Row>
              ),
          },
        ]}
      />
    </motion.div>
  )
}
