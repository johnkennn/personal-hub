import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Empty, List, Popover, Typography } from 'antd'
import { BellOutlined } from '@ant-design/icons'

import {
  fetchMyNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import {
  articleDetailPath,
  projectDetailPath,
  userProfilePath,
} from '../router/paths'
import { isLoggedIn, subscribeAuthChange } from '../utils/authStorage'
import { formatDateTime } from '../utils/format'
import type { NotificationItem } from '../types/notification'

function notificationHref(item: NotificationItem): string {
  if (item.type === 'FOLLOW' && item.actorId) {
    return userProfilePath(item.actorId)
  }
  const targetType = (item.targetType || '').toUpperCase()
  if (item.targetId != null) {
    if (targetType === 'ARTICLE') return articleDetailPath(item.targetId)
    if (targetType === 'PROJECT') return projectDetailPath(item.targetId)
  }
  return item.actorId ? userProfilePath(item.actorId) : '/'
}

function notificationTitle(item: NotificationItem): string {
  const who = item.actorUsername || '有人'
  if (item.type === 'LIKE') return `${who} 赞了你的内容`
  if (item.type === 'COMMENT') return `${who} 评论了你的内容`
  if (item.type === 'FOLLOW') return `${who} 关注了你`
  return '新通知'
}

/**
 * 动态通知铃铛：对接 /api/me/notifications。
 * - 只展示未读（已读点过后从列表消失）
 * - 关注类通知不展示（产品：关注他人不产生铃铛提醒）
 */
export function NotificationBell() {
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [list, setList] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return subscribeAuthChange(() => setLoggedIn(isLoggedIn()))
  }, [])

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) {
      setList([])
      setUnread(0)
      return
    }
    setLoading(true)
    try {
      const [listRes, countRes] = await Promise.all([
        fetchMyNotifications(),
        fetchUnreadNotificationCount(),
      ])
      const unreadOnly = (listRes.data.data ?? []).filter(
        (n) => !n.read && n.type !== 'FOLLOW',
      )
      setList(unreadOnly)
      // 角标：未读里再排除关注类（后端停写关注通知后两者一致）
      const followUnread = (listRes.data.data ?? []).filter(
        (n) => !n.read && n.type === 'FOLLOW',
      ).length
      setUnread(Math.max(0, (countRes.data.data ?? 0) - followUnread))
    } catch {
      setList([])
      setUnread(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loggedIn) {
      setList([])
      setUnread(0)
      return
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 60_000)
    return () => window.clearInterval(timer)
  }, [loggedIn, refresh])

  useEffect(() => {
    if (open && loggedIn) void refresh()
  }, [open, loggedIn, refresh])

  if (!loggedIn) {
    return null
  }

  const content = (
    <div style={{ width: 320, maxHeight: 380, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Typography.Text strong>动态通知</Typography.Text>
        <Button
          type="link"
          size="small"
          disabled={list.length === 0}
          onClick={() => {
            void (async () => {
              try {
                await markAllNotificationsRead()
                setList([])
                setUnread(0)
              } catch {
                /* ignore */
              }
            })()
          }}
        >
          全部已读
        </Button>
      </div>
      {list.length === 0 ? (
        <Empty
          description={loading ? '加载中…' : '暂无未读通知'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          size="small"
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                background: 'rgba(124,184,154,0.08)',
                padding: '8px 6px',
                borderRadius: 8,
              }}
              onClick={() => {
                void (async () => {
                  try {
                    await markNotificationRead(item.id)
                  } catch {
                    /* 仍跳转 */
                  }
                  setList((prev) => prev.filter((n) => n.id !== item.id))
                  setUnread((c) => Math.max(0, c - 1))
                  setOpen(false)
                  navigate(notificationHref(item))
                })()
              }}
            >
              <List.Item.Meta
                title={notificationTitle(item)}
                description={
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(item.createdAt)}
                  </Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unread} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<BellOutlined />} aria-label="通知" />
      </Badge>
    </Popover>
  )
}
