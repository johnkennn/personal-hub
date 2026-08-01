import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { App, Alert, Button, Card, Checkbox, Form, Input, Space, Spin, Tabs } from 'antd'
import { motion } from 'framer-motion'

import { MarkdownBody } from '../../components/MarkdownBody'
import { fetchArticleForManage, updateArticle } from '../../api/blog'
import { MOCK_ARTICLE_DRAFTS, MOCK_ARTICLE_PUBLISHED } from '../../mocks/studioMock'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import { getStudioArticles } from '../../utils/studioStorage'
import styles from '../../styles/ui.module.css'

type FormValues = { title: string; content: string; published: boolean }

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [preview, setPreview] = useState({ title: '', content: '' })
  const fromStudio = location.pathname.startsWith('/studio')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    if (!id) return

    const numId = Number(id)
    const persisted = getStudioArticles('articleDrafts').find((a) => a.id === numId)
    const mock =
      persisted ||
      MOCK_ARTICLE_DRAFTS.find((a) => a.id === numId) ||
      MOCK_ARTICLE_PUBLISHED.find((a) => a.id === numId)

    if (mock) {
      setIsMock(true)
      form.setFieldsValue({
        title: mock.title,
        content: mock.content,
        published: mock.published,
      })
      setPreview({ title: mock.title, content: mock.content })
      setLoading(false)
      return
    }

    fetchArticleForManage(id)
      .then((res) => {
        const article = res.data.data
        form.setFieldsValue({
          title: article.title,
          content: article.content,
          published: article.published,
        })
        setPreview({ title: article.title, content: article.content })
      })
      .catch(() => message.error('加载文章失败'))
      .finally(() => setLoading(false))
  }, [id, navigate, form, message])

  async function onFinish(values: FormValues) {
    if (!id) return
    if (isMock) {
      message.success('演示数据已「保存」（本地创作台列表）。')
      navigate(ROUTES.STUDIO_ARTICLE_DRAFTS)
      return
    }
    try {
      const res = await updateArticle(id, values)
      message.success('已保存')
      if (res.data.data.published) {
        navigate(articleDetailPath(res.data.data.id))
      } else {
        navigate(fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES)
      }
    } catch {
      message.error('保存失败')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <Link to={fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES}>
          <Button type="text">← 返回</Button>
        </Link>
      </Space>
      {isMock ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="正在编辑演示假数据"
          description="保存不会写入数据库。"
        />
      ) : null}
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="编辑文章">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={(_, all) => setPreview({ title: all.title ?? '', content: all.content ?? '' })}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Tabs
            items={[
              {
                key: 'edit',
                label: '编辑',
                children: (
                  <Form.Item name="content" label="正文（Markdown）" rules={[{ required: true }]}>
                    <Input.TextArea rows={14} />
                  </Form.Item>
                ),
              },
              {
                key: 'preview',
                label: '预览',
                children: (
                  <div style={{ minHeight: 280 }}>
                    <h2 style={{ fontFamily: 'var(--ph-font-display)' }}>{preview.title || '未命名'}</h2>
                    <MarkdownBody content={preview.content || '*还没有正文*'} />
                  </div>
                ),
              },
            ]}
          />
          <Form.Item name="published" valuePropName="checked">
            <Checkbox>发布</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}
