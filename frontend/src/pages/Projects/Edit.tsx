import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { App, Alert, Button, Card, Checkbox, Form, Input, Space, Spin } from 'antd'
import { motion } from 'framer-motion'

import { fetchProjectForManage, updateProject } from '../../api/project'
import { projectDetailPath, ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type FormValues = {
  name: string
  description: string
  techStack?: string
  repoUrl?: string
  demoUrl?: string
  published: boolean
}

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const fromStudio = location.pathname.startsWith('/studio')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [publishedLocked, setPublishedLocked] = useState(false)

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
    fetchProjectForManage(id)
      .then((res) => {
        if (cancelled) return
        const project = res.data.data
        if (project.published) {
          setPublishedLocked(true)
          return
        }
        form.setFieldsValue({
          name: project.name,
          description: project.description,
          techStack: project.techStack ?? '',
          repoUrl: project.repoUrl ?? '',
          demoUrl: project.demoUrl ?? '',
          published: project.published,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          message.error('加载项目失败')
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
      const res = await updateProject(id, {
        name: values.name,
        description: values.description,
        techStack: values.techStack,
        repoUrl: values.repoUrl,
        demoUrl: values.demoUrl,
        published: values.published,
      })
      message.success('已保存')
      if (res.data.data.published) {
        navigate(projectDetailPath(res.data.data.id))
      } else {
        navigate(fromStudio ? ROUTES.STUDIO_PROJECT_DRAFTS : ROUTES.PROJECTS)
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
        message="无法加载项目"
        description="请确认已登录且该项目属于你；不会使用假数据顶替。"
        action={
          <Link to={ROUTES.STUDIO_PROJECT_DRAFTS}>
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
        message="已发布项目不可直接编辑"
        description="请先在创作台「我的发布」中下架，再回到草稿编辑。"
        action={
          <Link to={ROUTES.STUDIO_PROJECT_PUBLISHED}>
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
        <Link to={fromStudio ? ROUTES.STUDIO_PROJECT_DRAFTS : ROUTES.PROJECTS}>
          <Button type="text">← 返回</Button>
        </Link>
      </Space>
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="编辑项目">
        <Form key={id} form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item name="techStack" label="技术栈">
            <Input />
          </Form.Item>
          <Form.Item name="repoUrl" label="仓库地址">
            <Input />
          </Form.Item>
          <Form.Item name="demoUrl" label="Demo 地址">
            <Input />
          </Form.Item>
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
