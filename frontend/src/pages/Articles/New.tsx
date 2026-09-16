import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Tabs,
  Typography,
} from 'antd'
import { motion } from 'framer-motion'

import { ArticleCoverEditor } from '../../components/ArticleCoverEditor'
import { BackNavButton } from '../../components/BackNavButton'
import { MarkdownBody } from '../../components/MarkdownBody'
import { RelatedProjectField } from '../../components/RelatedProjectField'
import { createArticle, updateArticle, uploadArticleCover } from '../../api/article'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { invalidateDiscoverCatalog } from '../../services/publicContent'
import { loadHubTools } from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import { saveArticleToolBindings } from '../../utils/articleToolBindings'
import { isLoggedIn } from '../../utils/authStorage'
import { ensureLoggedIn } from '../../utils/requireLogin'
import styles from '../../styles/ui.module.css'

type FormValues = {
  title: string
  content: string
  published: boolean
  relatedProjectId?: number | null
  relatedToolSlugs?: string[]
}

export function ArticleNewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [preview, setPreview] = useState({ title: '', content: '' })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hubTools, setHubTools] = useState<HubTool[]>([])
  const fromStudio = location.pathname.startsWith('/studio')

  const toolsQuery = searchParams.get('tools') ?? ''

  const presetTools = useMemo(() => {
    const allowed = new Set(hubTools.map((t) => t.slug))
    return toolsQuery
      .split(',')
      .map((s) => s.trim())
      .filter((s) => allowed.has(s))
  }, [toolsQuery, hubTools])

  useEffect(() => {
    if (isLoggedIn()) return
    void (async () => {
      const ok = await ensureLoggedIn({
        title: '需要登录',
        content: '写评测需要登录哦，要去登录吗？取消将返回上一页。',
      })
      if (!ok) {
        navigate(-1)
      }
    })()
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    loadHubTools().then((list) => {
      if (!cancelled) setHubTools(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (presetTools.length > 0) {
      form.setFieldsValue({ relatedToolSlugs: presetTools })
    }
  }, [form, presetTools])

  const toolOptions = useMemo(
    () =>
      hubTools.map((t) => ({
        value: t.slug,
        label: `${t.name}（${t.category}）`,
      })),
    [hubTools],
  )

  async function onFinish(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await createArticle({
        title: values.title,
        content: values.content,
        relatedProjectId: values.relatedProjectId,
        published: false,
      })
      const article = res.data.data

      saveArticleToolBindings(article.id, values.relatedToolSlugs ?? [])

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
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="写评测">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ published: false, relatedToolSlugs: presetTools }}
          onValuesChange={(_, all) =>
            setPreview({ title: all.title ?? '', content: all.content ?? '' })
          }
        >
          <Form.Item
            name="relatedToolSlugs"
            label="关联 AI 工具"
            rules={[{ required: true, type: 'array', min: 1, message: '请至少绑定一个 AI 工具' }]}
            extra="一篇评测可绑定多个工具；绑定后会出现在对应产品详情的「相关评测」里。"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="选择评测涉及的 AI 产品"
              options={toolOptions}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input size="large" placeholder="例如：豆包一周体验：日常问答够用吗？" />
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
                      placeholder={
                        '支持标题、列表、引用、代码块等，例如：\n\n## 使用场景\n\n- 优点\n- 不足'
                      }
                    />
                  </Form.Item>
                ),
              },
              {
                key: 'preview',
                label: '预览',
                children: (
                  <div style={{ minHeight: 280, padding: '8px 0' }}>
                    <h2
                      style={{
                        fontFamily: 'var(--ph-font-display)',
                        marginTop: 0,
                        marginBottom: 16,
                      }}
                    >
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
