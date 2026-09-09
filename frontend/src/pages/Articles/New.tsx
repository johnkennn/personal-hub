import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { App, Button, Card, Checkbox, Form, Input, Space, Tabs, Typography } from 'antd'
import { motion } from 'framer-motion'

import { ArticleCoverEditor } from '../../components/ArticleCoverEditor'
import { BackNavButton } from '../../components/BackNavButton'
import { MarkdownBody } from '../../components/MarkdownBody'
import { RelatedProjectField } from '../../components/RelatedProjectField'
import { createArticle, updateArticle, uploadArticleCover } from '../../api/article'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { invalidateDiscoverCatalog } from '../../services/publicContent'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type FormValues = {
  title: string
  content: string
  published: boolean
  relatedProjectId?: number | null
}

export function ArticleNewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [preview, setPreview] = useState({ title: '', content: '' })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fromStudio = location.pathname.startsWith('/studio')

  useEffect(() => {
    if (!isLoggedIn()) navigate(ROUTES.LOGIN, { replace: true })
  }, [navigate])

  async function onFinish(values: FormValues) {
    setSubmitting(true)
    try {
      // 封面接口要求草稿态：先创建草稿，上传后再按需发布
      const res = await createArticle({
        title: values.title,
        content: values.content,
        relatedProjectId: values.relatedProjectId,
        published: false,
      })
      const article = res.data.data

      if (coverFile) {
        try {
          await uploadArticleCover(article.id, coverFile)
        } catch {
          message.warning('文章已创建，封面上传失败，可在详情页点「编辑」重试')
        }
      }

      if (values.published) {
        await updateArticle(article.id, {
          title: values.title,
          content: values.content,
          relatedProjectId: values.relatedProjectId,
          published: true,
        })
        message.success('已发布')
      } else {
        message.success('已保存草稿')
      }
      invalidateDiscoverCatalog()
      navigate(articleDetailPath(article.id), { replace: true })
    } catch {
      message.error('提交失败，请确认已登录')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <BackNavButton fallback={fromStudio ? ROUTES.STUDIO : ROUTES.ARTICLES} />
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
                    <h2 style={{ fontFamily: 'var(--ph-font-display)', marginTop: 0, marginBottom: 16 }}>
                      {preview.title || '未命名'}
                    </h2>
                    <MarkdownBody content={preview.content || '*还没有正文*'} />
                  </div>
                ),
              },
            ]}
          />
          <ArticleCoverEditor pendingFile={coverFile} onPendingFileChange={setCoverFile} />
          <RelatedProjectField />
          <Form.Item name="published" valuePropName="checked">
            <Space align="center" wrap size={8}>
              <Checkbox>直接发布</Checkbox>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                若不勾选，则只会保存到草稿中，对其他用户不可见
              </Typography.Text>
            </Space>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={submitting}>
            提交
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}
