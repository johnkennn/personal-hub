import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Card, Empty, List, Pagination, Result, Skeleton, Typography } from 'antd'
import { motion } from 'framer-motion'

import { BackNavButton } from '../../components/BackNavButton'
import { fetchFollowers, fetchFollowing, fetchPublicProfile } from '../../api/users'
import { ROUTES, userProfilePath } from '../../router/paths'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import type { UserSummary } from '../../types/userSummary'
import styles from '../../styles/ui.module.css'

type Mode = 'followers' | 'following'

type Props = {
  mode: Mode
}

/**
 * 某用户的粉丝或关注列表（公开）。
 */
export function UserFollowListPage({ mode }: Props) {
  const { userId } = useParams<{ userId: string }>()
  const [displayName, setDisplayName] = useState('')
  const [items, setItems] = useState<UserSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const pageSize = 20

  const loadList = useCallback(
    (p: number) => {
      if (!userId) return
      setLoading(true)
      const fetcher = mode === 'followers' ? fetchFollowers : fetchFollowing
      fetcher(userId, p - 1, pageSize)
        .then((res) => {
          const data = res.data.data
          setItems(data.items ?? [])
          setTotal(data.total ?? 0)
          setPage(p)
        })
        .catch(() => {
          setItems([])
          setTotal(0)
        })
        .finally(() => setLoading(false))
    },
    [userId, mode],
  )

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setNotFound(false)
    fetchPublicProfile(userId)
      .then((res) => {
        if (cancelled) return
        const p = res.data.data
        setDisplayName(p.nickname?.trim() || p.username)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId || notFound) return
    loadList(1)
  }, [userId, notFound, loadList])

  if (!userId) {
    return <Result status="404" title="用户不存在" />
  }

  if (notFound) {
    return (
      <Result
        status="404"
        title="用户不存在"
        extra={<BackNavButton fallback={ROUTES.HOME} type="primary" />}
      />
    )
  }

  const title = mode === 'followers' ? '粉丝' : '关注'
  const emptyText = mode === 'followers' ? '还没有粉丝' : '还没有关注任何人'

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton
            fallback={userProfilePath(userId)}
            className={styles.pageBack}
          />
          <Typography.Title level={2} className={styles.pageTitle}>
            {displayName ? `${displayName} 的${title}` : title}
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            {mode === 'followers' ? '关注了该用户的人' : '该用户关注的人'}
          </Typography.Paragraph>
        </div>
      </div>

      <Card className={styles.contentCard} variant="borderless">
        {loading && items.length === 0 ? (
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        ) : items.length === 0 ? (
          <Empty description={emptyText} />
        ) : (
          <>
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(u) => {
                const name = u.nickname?.trim() || u.username
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Link to={userProfilePath(u.userId)}>
                          <Avatar src={resolveMediaUrl(u.avatarUrl) || undefined}>
                            {name.slice(0, 1).toUpperCase()}
                          </Avatar>
                        </Link>
                      }
                      title={<Link to={userProfilePath(u.userId)}>{name}</Link>}
                      description={`@${u.username}`}
                    />
                  </List.Item>
                )
              }}
            />
            {total > pageSize ? (
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p) => loadList(p)}
                  showTotal={(t) => `共 ${t} 人`}
                />
              </div>
            ) : null}
          </>
        )}
      </Card>
    </motion.div>
  )
}

export function UserFollowersPage() {
  return <UserFollowListPage mode="followers" />
}

export function UserFollowingPage() {
  return <UserFollowListPage mode="following" />
}
