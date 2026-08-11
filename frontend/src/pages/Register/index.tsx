import { Card, Form, Input, Button, Typography, App, Space } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'

import { register } from '../../api/auth'
import { ROUTES } from '../../router/paths'
import { setAuth } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type RegisterForm = {
  username: string
  email: string
  password: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<RegisterForm>()

  async function onFinish(values: RegisterForm) {
    try {
      const res = await register(values)
      const data = res.data.data
      setAuth(data.token, data.username, data.userId, data.role)
      message.success('注册成功，已自动登录')
      navigate(ROUTES.HOME)
    } catch {
      message.error('注册失败，用户名或邮箱可能已被占用')
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
          创建创作者账号
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          开放注册。加入后即可维护资料，并在后续里程碑发布文章与项目。
        </Typography.Paragraph>

        <Form form={form} layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 64, message: '长度 3~64' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="对外展示的登录名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="name@example.com" autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '至少 6 位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="设置密码"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册并登录
            </Button>
          </Form.Item>
        </Form>

        <Space>
          <Typography.Text type="secondary">已有账号？</Typography.Text>
          <Link to={ROUTES.LOGIN}>去登录</Link>
        </Space>
      </Card>
    </motion.div>
  )
}
