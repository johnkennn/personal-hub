import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { App, Button, Card, Checkbox, Form, Input, Space, Tabs } from 'antd'
import { motion } from 'framer-motion'

import { MarkdownBody } from '../../components/MarkdownBody'
import { createArticle } from '../../api/blog'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import { pushActivity } from '../../utils/activityStorage'
import styles from '../../styles/ui.module.css'

type FormValues = { title: string; content: string; published: boolean }

export function ArticleNewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [preview, setPreview] = useState({ title: '', content: '' })
  const fromStudio = location.pathname.startsWith('/studio')

  useEffect(() => {
    if (!isLoggedIn()) navigate(ROUTES.LOGIN, { replace: true })
  }, [navigate])

  async function onFinish(values: FormValues) {
    try {
      const res = await createArticle(values)
      message.success(values.published ? '已发布' : '已保存')
      pushActivity({
        title: values.published ? '你发布了一篇文章' : '你保存了一篇草稿',
        desc: values.title,
        href: values.published ? articleDetailPath(res.data.data.id) : ROUTES.STUDIO_ARTICLE_DRAFTS,
      })
      if (values.published) {
        navigate(articleDetailPath(res.data.data.id))
      } else {
        navigate(fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES)
      }
    } catch {
      message.error('提交失败，请确认已登录（演示环境也可先用创作台假数据流程）')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <Link to={fromStudio ? ROUTES.STUDIO : ROUTES.ARTICLES}>
          <Button type="text">← 返回</Button>
        </Link>
      </Space>
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="写文章">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ published: false }}
          onValuesChange={(_, all) => setPreview({ title: all.title ?? '', content: all.content ?? '' })}
        >
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input size="large" placeholder="文章标题" />
          </Form.Item>
          <Tabs
            items={[
              {
                key: 'edit',
                label: '编辑',
                children: (
                  <Form.Item
                    name="content"
                    label="正文（支持 Markdown）"
                    rules={[{ required: true, message: '请输入正文' }]}
                  >
                    <Input.TextArea
                      rows={14}
                      placeholder={'支持标题、列表、引用、代码块等，例如：\n\n## 小节\n\n- 要点一\n- 要点二'}
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'preview',
                label: '预览',
                children: (
                  <div style={{ minHeight: 280, padding: '8px 0' }}>
                    <TypographyTitle title={preview.title || '未命名'} />
                    <MarkdownBody content={preview.content || '*还没有正文*'} />
                  </div>
                ),
              },
            ]}
          />
          <Form.Item name="published" valuePropName="checked">
            <Checkbox>直接发布</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            提交
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}

function TypographyTitle({ title }: { title: string }) {
  return (
    <h2 style={{ fontFamily: 'var(--ph-font-display)', marginTop: 0, marginBottom: 16 }}>{title}</h2>
  )
}
