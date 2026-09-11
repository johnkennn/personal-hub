import { Card, Form, Input, Button, Typography, App, Space } from 'antd'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

import { login } from '../../api/auth'
import { ROUTES, SITE_BRAND } from '../../router/paths'
import { setAuth } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type LoginForm = {
  username: string
  password: string
}

function safeInternalPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { message } = App.useApp()
  const [form] = Form.useForm<LoginForm>()

  async function onFinish(values: LoginForm) {
    try {
      const res = await login(values)
      const data = res.data.data
      setAuth(data.token, data.username, data.userId, data.role)
      message.success('登录成功')
      navigate(safeInternalPath(searchParams.get('from')) ?? ROUTES.CHAT, { replace: true })
    } catch {
      message.error('登录失败，请检查用户名或密码')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className={styles.panel} variant="borderless">
        <p className={styles.brand}>{SITE_BRAND}</p>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          欢迎回来
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          登录后可收藏工具、使用更高额度的实用工具，并管理账号。
        </Typography.Paragraph>

        <Form form={form} layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="你的用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Typography.Text type="secondary">还没有账号？</Typography.Text>
            <Link to={ROUTES.REGISTER} replace>
              立即注册
            </Link>
          </Space>
          <Link to={ROUTES.FORGOT_PASSWORD} replace>
            忘记密码
          </Link>
        </Space>
      </Card>
    </motion.div>
  )
}
