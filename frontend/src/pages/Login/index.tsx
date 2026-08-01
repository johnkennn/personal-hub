import { Card, Form, Input, Button, Typography, App, Space } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LockOutlined, UserOutlined } from '@ant-design/icons'

import { login } from '../../api/auth'
import { ROUTES } from '../../router/paths'
import { setAuth } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type LoginForm = {
  username: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<LoginForm>()

  async function onFinish(values: LoginForm) {
    try {
      const res = await login(values)
      const data = res.data.data
      setAuth(data.token, data.username)
      message.success('登录成功')
      navigate(ROUTES.HOME)
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
        <p className={styles.brand}>Personal Hub</p>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          欢迎回来
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          登录后管理草稿、发布作品，并完善个人资料。
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

        <Space>
          <Typography.Text type="secondary">还没有账号？</Typography.Text>
          <Link to={ROUTES.REGISTER}>立即注册</Link>
        </Space>
      </Card>
    </motion.div>
  )
}
