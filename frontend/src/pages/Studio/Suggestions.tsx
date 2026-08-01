import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Card, Empty, Form, Input, List, Popconfirm, Space, Typography } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import {
  addSuggestion,
  loadSuggestions,
  removeSuggestion,
  type Suggestion,
} from '../../utils/suggestionStorage'
import { formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

export function SuggestionsPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [list, setList] = useState<Suggestion[]>([])
  const [form] = Form.useForm<{ content: string }>()

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    setList(loadSuggestions())
  }, [navigate])

  function onFinish(values: { content: string }) {
    const content = values.content?.trim()
    if (!content) return
    addSuggestion(content)
    setList(loadSuggestions())
    form.resetFields()
    message.success('建议已提交，感谢反馈')
  }

  function onDelete(id: string) {
    removeSuggestion(id)
    setList(loadSuggestions())
    message.success('已删除该条建议')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.STUDIO)}
            style={{ marginLeft: -8, marginBottom: 4 }}
          >
            创作台
          </Button>
          <Typography.Title level={2} className={styles.pageTitle}>
            我的建议
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            写下你对 Personal Hub 的想法与改进建议，可提交多条。当前保存在本地，后端接口后续接入。
          </Typography.Paragraph>
        </div>
      </div>

      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="content"
            label="建议内容"
            rules={[
              { required: true, message: '请填写建议' },
              { max: 1000, message: '最多 1000 字' },
            ]}
          >
            <Input.TextArea
              rows={4}
              showCount
              maxLength={1000}
              placeholder="例如：希望增加 Markdown 预览、希望创作台支持封面图…"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
            提交建议
          </Button>
        </Form>
      </Card>

      <Typography.Title level={4}>我提交过的建议</Typography.Title>
      {list.length === 0 ? (
        <Empty description="还没有建议，写一条吧" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={list}
          pagination={{ pageSize: 5, showTotal: (t) => `共 ${t} 条` }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Popconfirm
                  key="del"
                  title="删除这条建议？"
                  onConfirm={() => onDelete(item.id)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={<Typography.Text type="secondary">{formatDateTime(item.createdAt)}</Typography.Text>}
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

      <Space style={{ marginTop: 16 }}>
        <Link to={ROUTES.STUDIO}>
          <Button type="text">返回创作台</Button>
        </Link>
      </Space>
    </motion.div>
  )
}
