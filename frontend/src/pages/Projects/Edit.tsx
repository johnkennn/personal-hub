import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { App, Alert, Button, Card, Checkbox, Form, Input, Space, Spin } from 'antd'
import { motion } from 'framer-motion'

import { fetchProjectForManage, updateProject } from '../../api/project'
import { MOCK_PROJECT_DRAFTS, MOCK_PROJECT_PUBLISHED } from '../../mocks/studioMock'
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

function findMockProject(id: string | undefined) {
  if (!id) return null
  const numId = Number(id)
  return (
    MOCK_PROJECT_DRAFTS.find((p) => p.id === numId) ||
    MOCK_PROJECT_PUBLISHED.find((p) => p.id === numId) ||
    null
  )
}

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const fromStudio = location.pathname.startsWith('/studio')

  const mock = useMemo(() => findMockProject(id), [id])
  const isMock = Boolean(mock)

  const [loading, setLoading] = useState(() => !findMockProject(id))
  const [hydratedId, setHydratedId] = useState(id)

  if (id !== hydratedId) {
    setHydratedId(id)
    setLoading(!findMockProject(id))
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!id || mock) return
    let cancelled = false
    fetchProjectForManage(id)
      .then((res) => {
        if (cancelled) return
        const project = res.data.data
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
        if (!cancelled) message.error('加载项目失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, mock, form, message])

  async function onFinish(values: FormValues) {
    if (!id) return
    if (isMock) {
      message.success('演示数据已「保存」（未写库）')
      navigate(ROUTES.STUDIO_PROJECT_DRAFTS)
      return
    }
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

  const initialValues: FormValues | undefined = mock
    ? {
        name: mock.name,
        description: mock.description,
        techStack: mock.techStack ?? '',
        repoUrl: mock.repoUrl ?? '',
        demoUrl: mock.demoUrl ?? '',
        published: mock.published,
      }
    : undefined

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <Link to={fromStudio ? ROUTES.STUDIO_PROJECT_DRAFTS : ROUTES.PROJECTS}>
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
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="编辑项目">
        <Form key={id} form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
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
