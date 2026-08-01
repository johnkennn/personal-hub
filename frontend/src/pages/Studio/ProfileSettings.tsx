import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Space,
  Spin,
  Typography,
} from 'antd'
import { motion } from 'framer-motion'

import { fetchMyProfile, updateMyProfile } from '../../api/profile'
import { ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type ProfileForm = {
  nickname: string
  bio: string
  avatarUrl: string
  linksJson: string
}

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<ProfileForm>()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const avatarWatch = Form.useWatch('avatarUrl', form)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    let cancelled = false
    fetchMyProfile()
      .then((res) => {
        if (cancelled) return
        const p = res.data.data
        setUsername(p.username)
        form.setFieldsValue({
          nickname: p.nickname ?? '',
          bio: p.bio ?? '',
          avatarUrl: p.avatarUrl ?? '',
          linksJson: p.linksJson ?? '{}',
        })
      })
      .catch(() => {
        if (!cancelled) message.error('加载资料失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [navigate, form, message])

  async function onFinish(values: ProfileForm) {
    try {
      await updateMyProfile(values)
      message.success('资料已保存')
    } catch {
      message.error('保存失败，请稍后重试')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spin size="large" tip="加载资料..." />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            我的资料
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            完善昵称与简介，让访客更快认识你。头像上传将在下一步接入。
          </Typography.Paragraph>
        </div>
        <Link to={ROUTES.STUDIO}>
          <Button type="text">返回创作台</Button>
        </Link>
      </div>

      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless">
        <Space align="start" size="large" style={{ marginBottom: 24 }} wrap>
          <Avatar size={72} src={avatarWatch || undefined}>
            {(form.getFieldValue('nickname') || username || '?').slice(0, 1).toUpperCase()}
          </Avatar>
          <div>
            <Typography.Text type="secondary">登录名（不可修改）</Typography.Text>
            <Typography.Title level={4} style={{ margin: '4px 0 0' }}>
              {username}
            </Typography.Title>
          </div>
        </Space>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ max: 64, message: '最多 64 字' }]}
          >
            <Input placeholder="展示给访客的名字" />
          </Form.Item>
          <Form.Item name="bio" label="简介" rules={[{ max: 512, message: '最多 512 字' }]}>
            <Input.TextArea rows={4} placeholder="一句话介绍你自己" showCount maxLength={512} />
          </Form.Item>
          <Form.Item name="avatarUrl" label="头像 URL">
            <Input placeholder="暂时填写图片链接，稍后支持本地上传" />
          </Form.Item>
          <Form.Item
            name="linksJson"
            label="外链 JSON"
            extra='例如 {"github":"https://github.com/you"}'
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  )
}
