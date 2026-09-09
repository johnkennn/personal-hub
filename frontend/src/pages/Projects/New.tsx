import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { App, Button, Card, Checkbox, Form, Input, Space, Typography } from 'antd'
import { motion } from 'framer-motion'

import { BackNavButton } from '../../components/BackNavButton'
import { ProjectCoverEditor } from '../../components/ProjectCoverEditor'
import { createProject, updateProject, uploadProjectCover } from '../../api/project'
import { projectDetailPath, ROUTES } from '../../router/paths'
import { invalidateDiscoverCatalog } from '../../services/publicContent'
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
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) navigate(ROUTES.LOGIN, { replace: true })
  }, [navigate])

  async function onFinish(values: FormValues) {
    setSubmitting(true)
    try {
      // 封面接口要求草稿态：先创建草稿，上传后再按需发布
      const res = await createProject({
        name: values.name,
        description: values.description,
        techStack: values.techStack || undefined,
        repoUrl: values.repoUrl || undefined,
        demoUrl: values.demoUrl || undefined,
        published: false,
      })
      const project = res.data.data

      if (coverFile) {
        try {
          await uploadProjectCover(project.id, coverFile)
        } catch {
          message.warning('项目已创建，封面上传失败，可在详情页点「编辑」重试')
        }
      }

      if (values.published) {
        await updateProject(project.id, {
          name: values.name,
          description: values.description,
          techStack: values.techStack,
          repoUrl: values.repoUrl,
          demoUrl: values.demoUrl,
          published: true,
        })
        message.success('项目已发布')
      } else {
        message.success('已创建草稿')
      }
      invalidateDiscoverCatalog()
      navigate(projectDetailPath(project.id), { replace: true })
    } catch {
      message.error('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Space style={{ marginBottom: 16 }}>
        <BackNavButton fallback={fromStudio ? ROUTES.STUDIO : ROUTES.PROJECTS} />
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
          <ProjectCoverEditor
            pendingFile={coverFile}
            onPendingFileChange={setCoverFile}
          />
          <Form.Item name="published" valuePropName="checked">
            <Space align="center" wrap size={8}>
              <Checkbox>直接发布</Checkbox>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                若不勾选，则只会保存到草稿中，对其他用户不可见
              </Typography.Text>
            </Space>
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={submitting}>
            创建
          </Button>
        </Form>
      </Card>
    </motion.div>
  )
}
