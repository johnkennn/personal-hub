import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Button, Card, Empty, Form, Input, List, Popconfirm, Typography } from 'antd'
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import {
  createSuggestion,
  deleteMySuggestion,
  fetchMySuggestions,
  type SuggestionItem,
} from '../../api/suggestions'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

/** 创作台 · 我的建议：对接 /api/me/suggestions */
export function SuggestionsPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [list, setList] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<{ content: string }>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchMySuggestions()
      setList(res.data.data ?? [])
    } catch {
      message.error('加载建议失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    void load()
  }, [navigate, load])

  async function onFinish(values: { content: string }) {
    const content = values.content?.trim()
    if (!content) return
    setSubmitting(true)
    try {
      const res = await createSuggestion(content)
      setList((prev) => [res.data.data, ...prev])
      form.resetFields()
      message.success('建议已提交，感谢反馈')
    } catch {
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteMySuggestion(id)
      setList((prev) => prev.filter((item) => item.id !== id))
      message.success('已删除该条建议')
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.STUDIO} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            我的建议
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            账号 · 向平台提交想法与改进建议
          </Typography.Paragraph>
        </div>
      </div>

      <Card
        className={`${styles.panel} ${styles.widePanel}`}
        variant="borderless"
        style={{ marginBottom: 24 }}
      >
        <Form form={form} layout="vertical" onFinish={(v) => void onFinish(v)}>
          <Form.Item
            name="content"
            label="建议内容"
            rules={[
              { required: true, message: '请填写建议' },
              { max: 2000, message: '最多 2000 字' },
            ]}
          >
            <Input.TextArea
              rows={4}
              showCount
              maxLength={2000}
              placeholder="例如：希望增加 Markdown 预览、希望创作台支持封面图…"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<MessageOutlined />} loading={submitting}>
            提交建议
          </Button>
        </Form>
      </Card>

      <Typography.Title level={4}>我提交过的建议</Typography.Title>
      {list.length === 0 && !loading ? (
        <Empty description="还没有建议，写一条吧" />
      ) : (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={list}
          pagination={{ pageSize: 5, showTotal: (t) => `共 ${t} 条` }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Popconfirm key="del" title="删除这条建议？" onConfirm={() => void onDelete(item.id)}>
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Typography.Text type="secondary">{formatDateTime(item.createdAt)}</Typography.Text>
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
      )}
    </motion.div>
  )
}
