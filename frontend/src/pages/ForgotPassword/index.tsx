import { App, Button, Card, Form, Input, Space, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { LockOutlined, MailOutlined, MobileOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { forgotPassword } from '../../api/auth'
import { ROUTES, SITE_BRAND } from '../../router/paths'
import styles from '../../styles/ui.module.css'

type FormValues = {
  email: string
  phone: string
  newPassword: string
  confirmPassword: string
}

/**
 * 忘记密码：临时方案用「手机号 + 邮箱」校验身份后重置密码；后续可换验证码。
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()

  async function onFinish(values: FormValues) {
    try {
      await forgotPassword({
        email: values.email,
        phone: values.phone,
        newPassword: values.newPassword,
      })
      message.success('密码已重置，请登录')
      navigate(ROUTES.LOGIN, { replace: true })
    } catch {
      message.error('重置失败：请确认邮箱与手机号匹配同一账号')
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
          忘记密码
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          请填写注册时的邮箱与手机号以校验身份，然后设置新密码（后续将支持验证码）。
        </Typography.Paragraph>

        <Form form={form} layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
            ]}
          >
            <Input prefix={<MobileOutlined />} autoComplete="tel" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              重置密码
            </Button>
          </Form.Item>
        </Form>

        <Space>
          <Link to={ROUTES.LOGIN} replace>
            返回登录
          </Link>
        </Space>
      </Card>
    </motion.div>
  )
}
