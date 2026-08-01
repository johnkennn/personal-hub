import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { App, Button, Card, Checkbox, Form, Input, Space } from 'antd'
import { motion } from 'framer-motion'

import { createProject } from '../../api/project'
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

export function ProjectNewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const fromStudio = location.pathname.startsWith('/studio')

  useEffect(() => {
    if (!isLoggedIn()) navigate(ROUTES.LOGIN, { replace: true })
  }, [navigate])

  async function onFinish(values: FormValues) {
    try {
      const res = await createProject({
        ...values,
        techStack: values.techStack || undefined,
        repoUrl: values.repoUrl || undefined,
        demoUrl: values.demoUrl || undefined,
      })
      message.success(values.published ? '项目已发布' : '已创建')
      if (values.published) {
        navigate(projectDetailPath(res.data.data.id))
      } else {
        navigate(fromStudio ? ROUTES.STUDIO_PROJECT_DRAFTS : ROUTES.PROJECTS)
      }
    } catch {
      message.error('创建失败')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <Link to={fromStudio ? ROUTES.STUDIO : ROUTES.PROJECTS}>
          <Button type="text">← 返回</Button>
        </Link>
      </Space>
      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless" title="建项目">
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ published: false }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item name="techStack" label="技术栈">
            <Input placeholder="React, Spring Boot, MySQL" />
          </Form.Item>
          <Form.Item name="repoUrl" label="仓库地址">
            <Input />
          </Form.Item>
          <Form.Item name="demoUrl" label="Demo 地址">
            <Input />
          </Form.Item>
          <Form.Item name="published" valuePropName="checked">
            <Checkbox>直接发布</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            创建
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}
