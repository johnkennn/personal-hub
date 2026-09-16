import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { App, Button, Form, Input, List, Space, Typography } from 'antd'
import { HeartFilled, HeartOutlined, MessageOutlined } from '@ant-design/icons'

import {
  createComment,
  deleteCommentAsAdmin,
  deleteMyComment,
  fetchComments,
  fetchLikeSummary,
  likeContent,
  unlikeContent,
  type CommentItem,
} from '../api/social'
import { articleDetailPath, projectDetailPath } from '../router/paths'
import {
  getUserId,
  getUsername,
  isAdmin,
  isLoggedIn,
  subscribeAuthChange,
} from '../utils/authStorage'
import { formatDateTime } from '../utils/format'
import { pushActivity } from '../utils/activityStorage'
import { ensureLoggedIn, loginPathWithReturn } from '../utils/requireLogin'

type SocialPanelProps = {
  kind: 'article' | 'project'
  contentId: number
}

/**
 * 互动区：赞 / 评接后端 API。
 * 删除：本人走 /api/comments/{id}；管理员走 /api/admin/comments/{id}（详情页即可治理，无需单独后台页）。
 */
export function SocialPanel({ kind, contentId }: SocialPanelProps) {
  const { message } = App.useApp()
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [admin, setAdmin] = useState(isAdmin)
  const [meId, setMeId] = useState(getUserId)
  const [meName, setMeName] = useState(getUsername)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm<{ content: string }>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [likeRes, commentRes] = await Promise.all([
        fetchLikeSummary(kind, contentId),
        fetchComments(kind, contentId),
      ])
      setLiked(Boolean(likeRes.data.data?.liked))
      setLikeCount(likeRes.data.data?.likeCount ?? 0)
      setComments(commentRes.data.data ?? [])
    } catch {
      message.error('互动数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [kind, contentId, message])

  useEffect(() => {
    void refresh()
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setAdmin(isAdmin())
      setMeId(getUserId())
      setMeName(getUsername())
    })
  }, [refresh])

  async function onLike() {
    if (!(await ensureLoggedIn({ content: '点赞需要登录哦，要去登录吗？' }))) {
      return
    }
    try {
      const res = liked
        ? await unlikeContent(kind, contentId)
        : await likeContent(kind, contentId)
      setLiked(Boolean(res.data.data?.liked))
      setLikeCount(res.data.data?.likeCount ?? 0)
      if (!liked) {
        pushActivity({
          title: '你点赞了一篇内容',
          desc: `${kind === 'article' ? '文章' : '项目'} #${contentId}`,
          href: kind === 'article' ? articleDetailPath(contentId) : projectDetailPath(contentId),
        })
      }
    } catch {
      message.error('点赞失败')
    }
  }

  async function onComment(values: { content: string }) {
    if (!(await ensureLoggedIn({ content: '发表评论需要登录哦，要去登录吗？' }))) {
      return
    }
    try {
      const res = await createComment(kind, contentId, values.content.trim())
      form.resetFields()
      setComments((prev) => [res.data.data, ...prev])
      message.success('评论已发布')
      pushActivity({
        title: '你发表了一条评论',
        desc: values.content.slice(0, 40),
        href: kind === 'article' ? articleDetailPath(contentId) : projectDetailPath(contentId),
      })
    } catch {
      message.error('评论失败')
    }
  }

  function canDelete(item: CommentItem) {
    if (!loggedIn) return false
    if (admin) return true
    return meId != null && item.userId === meId
  }

  async function onDelete(item: CommentItem) {
    try {
      if (admin && item.userId !== meId) {
        await deleteCommentAsAdmin(item.id)
      } else {
        await deleteMyComment(item.id)
      }
      setComments((prev) => prev.filter((c) => c.id !== item.id))
      message.success('已删除')
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--ph-border)' }}>
      <Space size="middle" style={{ marginBottom: 20 }}>
        <Button
          type={liked ? 'primary' : 'default'}
          icon={liked ? <HeartFilled /> : <HeartOutlined />}
          onClick={() => void onLike()}
          loading={loading}
        >
          {likeCount > 0 ? likeCount : '点赞'}
        </Button>
        <Typography.Text type="secondary">
          <MessageOutlined /> {comments.length} 条评论
        </Typography.Text>
      </Space>

      {!loggedIn ? (
        <Typography.Paragraph type="secondary">
          <Link to={loginPathWithReturn()}>登录</Link> 后可点赞与评论，让互动被看见。
        </Typography.Paragraph>
      ) : (
        <Form form={form} onFinish={(v) => void onComment(v)} style={{ marginBottom: 20 }}>
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
        loading={loading}
        locale={{ emptyText: '还没有评论，来抢沙发' }}
        dataSource={comments}
        renderItem={(item) => (
          <List.Item
            actions={
              canDelete(item)
                ? [
                    <Button
                      key="del"
                      type="link"
                      danger
                      size="small"
                      onClick={() => void onDelete(item)}
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
                  <Typography.Text strong>{item.username || meName || '用户'}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDateTime(item.createdAt)}
                  </Typography.Text>
                </Space>
              }
              description={
                <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {item.body}
                </Typography.Paragraph>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}
