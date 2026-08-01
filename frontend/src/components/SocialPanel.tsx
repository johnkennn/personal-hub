import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { App, Button, Form, Input, List, Space, Typography } from 'antd'
import { HeartFilled, HeartOutlined, MessageOutlined } from '@ant-design/icons'

import { ROUTES, articleDetailPath, projectDetailPath } from '../router/paths'
import { isLoggedIn, getUsername, subscribeAuthChange } from '../utils/authStorage'
import { formatDateTime } from '../utils/format'
import {
  addComment,
  getLikeCount,
  isLikedByMe,
  listComments,
  removeComment,
  subscribeSocialChange,
  toggleLike,
  type ContentKind,
  type DemoComment,
} from '../utils/socialStorage'
import { pushActivity } from '../utils/activityStorage'

type SocialPanelProps = {
  kind: ContentKind
  contentId: number
}

export function SocialPanel({ kind, contentId }: SocialPanelProps) {
  const { message } = App.useApp()
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<DemoComment[]>([])
  const [form] = Form.useForm<{ content: string }>()

  const [me, setMe] = useState(getUsername)

  function refresh() {
    setLiked(isLikedByMe(kind, contentId))
    setLikeCount(getLikeCount(kind, contentId))
    setComments(listComments(kind, contentId))
  }

  useEffect(() => {
    refresh()
    const offSocial = subscribeSocialChange(refresh)
    const offAuth = subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setMe(getUsername())
      refresh()
    })
    return () => {
      offSocial()
      offAuth()
    }
  }, [kind, contentId])

  function onLike() {
    try {
      const res = toggleLike(kind, contentId)
      setLiked(res.liked)
      setLikeCount(res.count)
      if (res.liked) {
        pushActivity({
          title: '你点赞了一篇内容',
          desc: `${kind === 'article' ? '文章' : '项目'} #${contentId}`,
          href: kind === 'article' ? articleDetailPath(contentId) : projectDetailPath(contentId),
        })
      }
    } catch {
      message.info('登录后即可点赞')
    }
  }

  function onComment(values: { content: string }) {
    try {
      addComment(kind, contentId, values.content)
      form.resetFields()
      refresh()
      message.success('评论已发布（演示本地保存）')
      pushActivity({
        title: '你发表了一条评论',
        desc: values.content.slice(0, 40),
        href: kind === 'article' ? articleDetailPath(contentId) : projectDetailPath(contentId),
      })
    } catch {
      message.info('登录后即可评论')
    }
  }

  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--ph-border)' }}>
      <Space size="middle" style={{ marginBottom: 20 }}>
        <Button
          type={liked ? 'primary' : 'default'}
          icon={liked ? <HeartFilled /> : <HeartOutlined />}
          onClick={onLike}
        >
          {likeCount > 0 ? likeCount : '点赞'}
        </Button>
        <Typography.Text type="secondary">
          <MessageOutlined /> {comments.length} 条评论
        </Typography.Text>
      </Space>

      {!loggedIn ? (
        <Typography.Paragraph type="secondary">
          <Link to={ROUTES.LOGIN}>登录</Link> 后可点赞与评论，让互动被看见。
        </Typography.Paragraph>
      ) : (
        <Form form={form} onFinish={onComment} style={{ marginBottom: 20 }}>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: '写点什么吧' },
              { max: 500, message: '最多 500 字' },
            ]}
          >
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="友善讨论，留下你的想法…" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            发表评论
          </Button>
        </Form>
      )}

      <List
        locale={{ emptyText: '还没有评论，来抢沙发' }}
        dataSource={comments}
        renderItem={(item) => (
          <List.Item
            actions={
              loggedIn && item.author === me
                ? [
                    <Button
                      key="del"
                      type="link"
                      danger
                      size="small"
                      onClick={() => {
                        removeComment(item.id)
                        refresh()
                      }}
                    >
                      删除
                    </Button>,
                  ]
                : undefined
            }
          >
            <List.Item.Meta
              title={
                <Space>
                  <Typography.Text strong>{item.author}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(item.createdAt)}
                  </Typography.Text>
                </Space>
              }
              description={
                <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {item.content}
                </Typography.Paragraph>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}
