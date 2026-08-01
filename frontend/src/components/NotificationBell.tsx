import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Empty, List, Popover, Typography } from 'antd'
import { BellOutlined } from '@ant-design/icons'

import { formatDateTime } from '../utils/format'
import {
  loadActivities,
  markActivityRead,
  markAllActivitiesRead,
  subscribeActivityChange,
  unreadActivityCount,
  type DemoActivity,
} from '../utils/activityStorage'

export function NotificationBell() {
  const navigate = useNavigate()
  const [list, setList] = useState<DemoActivity[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  function refresh() {
    setList(loadActivities())
    setUnread(unreadActivityCount())
  }

  useEffect(() => {
    refresh()
    return subscribeActivityChange(refresh)
  }, [])

  const content = (
    <div style={{ width: 320, maxHeight: 380, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Typography.Text strong>动态通知</Typography.Text>
        <Button
          type="link"
          size="small"
          onClick={() => {
            markAllActivitiesRead()
            refresh()
          }}
        >
          全部已读
        </Button>
      </div>
      {list.length === 0 ? (
        <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={list}
          renderItem={(item) => (
            <List.Item
              style={{
                cursor: 'pointer',
                opacity: item.read ? 0.65 : 1,
                background: item.read ? 'transparent' : 'rgba(124,184,154,0.08)',
                padding: '8px 6px',
                borderRadius: 8,
              }}
              onClick={() => {
                markActivityRead(item.id)
                setOpen(false)
                navigate(item.href)
              }}
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <>
                    <div>{item.desc}</div>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(item.createdAt)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
      <Typography.Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 12 }}>
        演示数据保存在本地；后端通知中心后续接入。
      </Typography.Paragraph>
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
