import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  App,
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd'
import { motion } from 'framer-motion'

import { ArticleCoverEditor } from '../../components/ArticleCoverEditor'
import { MarkdownBody } from '../../components/MarkdownBody'
import { BackNavButton } from '../../components/BackNavButton'
import { RelatedProjectField } from '../../components/RelatedProjectField'
import { fetchArticleForManage, updateArticle } from '../../api/article'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { invalidateDiscoverCatalog } from '../../services/publicContent'
import { loadHubTools } from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type FormValues = {
  title: string
  content: string
  published: boolean
  relatedProjectId?: number | null
  relatedToolSlugs?: string[]
}

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
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState({ title: '', content: '' })
  const [hubTools, setHubTools] = useState<HubTool[]>([])

  const toolOptions = useMemo(
    () =>
      hubTools.map((t) => ({
        value: t.slug,
        label: `${t.name}（${t.category}）`,
      })),
    [hubTools],
  )

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
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
        setCoverUrl(article.coverUrl ?? null)
        form.setFieldsValue({
          title: article.title,
          content: article.content,
          published: article.published,
          relatedProjectId: article.relatedProjectId ?? undefined,
          relatedToolSlugs: article.relatedToolSlugs ?? [],
        })
        setPreview({ title: article.title, content: article.content })
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          message.error('加载评测失败')
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
      const res = await updateArticle(id, {
        title: values.title,
        content: values.content,
        published: values.published,
        relatedProjectId: values.relatedProjectId,
        relatedToolSlugs: values.relatedToolSlugs ?? [],
      })
      invalidateDiscoverCatalog()
      message.success('已保存')
      if (res.data.data.published) {
        navigate(articleDetailPath(res.data.data.id), { replace: true })
      } else {
        navigate(fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES, {
          replace: true,
        })
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
        message="无法加载评测"
        description="请确认已登录且该评测属于你；不会使用假数据顶替。"
        action={<BackNavButton fallback={ROUTES.STUDIO_ARTICLE_DRAFTS} type="default" size="small" />}
      />
    )
  }

  if (publishedLocked) {
    return (
      <Alert
        type="info"
        showIcon
        message="已发布内容不可直接编辑"
        description="请先在个人中心「评测已发布」中下架，再回到草稿编辑。"
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
        <BackNavButton
          fallback={fromStudio ? ROUTES.STUDIO_ARTICLE_DRAFTS : ROUTES.ARTICLES}
        />
      </Space>
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="编辑评测">
        <Form
          key={id}
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={(_, all) => setPreview({ title: all.title ?? '', content: all.content ?? '' })}
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
          {id ? <ArticleCoverEditor articleId={id} initialCoverUrl={coverUrl} /> : null}
          <RelatedProjectField />
          <Form.Item name="published" valuePropName="checked">
            <Space align="center" wrap size={8}>
              <Checkbox>保存时直接发布</Checkbox>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                若不勾选，则只会保存到草稿中，对其他用户不可见
              </Typography.Text>
            </Space>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}
