import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { changePassword } from '../../api/auth'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

type FormValues = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/** 个人中心 · 修改密码：校验旧密码后设置新密码 */
export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [navigate])

  async function onFinish(values: FormValues) {
    setSubmitting(true)
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
      message.success('密码已更新')
      form.resetFields()
      navigate(ROUTES.STUDIO, { replace: true })
    } catch {
      message.error('修改失败：请确认旧密码正确')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.STUDIO} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            修改密码
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            账号 · 验证旧密码后设置新密码
          </Typography.Paragraph>
        </div>
      </div>

      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless">
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => void onFinish(v)}
          requiredMark={false}
          style={{ maxWidth: 420 }}
        >
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: '请输入旧密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
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
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存新密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  )
}
