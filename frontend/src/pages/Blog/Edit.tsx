import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { App, Alert, Button, Card, Checkbox, Form, Input, Space, Spin, Tabs } from 'antd'
import { motion } from 'framer-motion'

import { MarkdownBody } from '../../components/MarkdownBody'
import { fetchArticleForManage, updateArticle } from '../../api/blog'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type FormValues = { title: string; content: string; published: boolean }

export function ArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const fromStudio = location.pathname.startsWith('/studio')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [publishedLocked, setPublishedLocked] = useState(false)
  const [preview, setPreview] = useState({ title: '', content: '' })

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setLoadError(false)
    fetchArticleForManage(id)
      .then((res) => {
        if (cancelled) return
        const article = res.data.data
        if (article.published) {
          setPublishedLocked(true)
          return
        }
        form.setFieldsValue({
          title: article.title,
          content: article.content,
          published: article.published,
        })
        setPreview({ title: article.title, content: article.content })
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          message.error('加载文章失败')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, form, message])

  async function onFinish(values: FormValues) {
    if (!id) return
    try {
      const res = await updateArticle(id, values)
      message.success('已保存')
      if (res.data.data.published) {
        navigate(articleDetailPath(res.data.data.id))
      } else {
        navigate(fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES)
      }
    } catch {
      message.error('保存失败（已发布内容需先下架）')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert
        type="warning"
        showIcon
        message="无法加载文章"
        description="请确认已登录且该文章属于你；不会使用假数据顶替。"
        action={
          <Link to={ROUTES.STUDIO_ARTICLE_DRAFTS}>
            <Button size="small">返回草稿</Button>
          </Link>
        }
      />
    )
  }

  if (publishedLocked) {
    return (
      <Alert
        type="info"
        showIcon
        message="已发布内容不可直接编辑"
        description="请先在创作台「我的发布」中下架，再回到草稿编辑。"
        action={
          <Link to={ROUTES.STUDIO_ARTICLE_PUBLISHED}>
            <Button size="small" type="primary">
              去下架
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <Link to={fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES}>
          <Button type="text">← 返回</Button>
        </Link>
      </Space>
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="编辑文章">
        <Form
          key={id}
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
            <Checkbox>保存时直接发布</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}
