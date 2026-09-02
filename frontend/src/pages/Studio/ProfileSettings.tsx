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
  Upload,
} from 'antd'
import type { UploadProps } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { fetchMyProfile, updateMyProfile, uploadAvatar } from '../../api/profile'
import { resolveMediaUrl } from '../../utils/mediaUrl'
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
  const [uploading, setUploading] = useState(false)
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

  const uploadProps: UploadProps = {
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    showUploadList: false,
    maxCount: 1,
    beforeUpload: (file) => {
      const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      if (!ok) {
        message.error('仅支持 jpeg、png、gif、webp')
        return Upload.LIST_IGNORE
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('图片不能超过 5MB')
        return Upload.LIST_IGNORE
      }
      return true
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploading(true)
      try {
        const res = await uploadAvatar(file as File)
        const profile = res.data.data
        form.setFieldsValue({ avatarUrl: profile.avatarUrl ?? '' })
        message.success('头像已更新')
        onSuccess?.(profile)
      } catch (e) {
        message.error('头像上传失败')
        onError?.(e as Error)
      } finally {
        setUploading(false)
      }
    },
  }

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
            完善昵称与简介；头像支持本地上传（jpeg / png / gif / webp，最大 5MB）。
          </Typography.Paragraph>
        </div>
        <Link to={ROUTES.STUDIO}>
          <Button type="text">返回创作台</Button>
        </Link>
      </div>

      <Card className={`${styles.panel} ${styles.widePanel}`} variant="borderless">
        <Space align="start" size="large" style={{ marginBottom: 24 }} wrap>
          <Avatar size={72} src={resolveMediaUrl(avatarWatch)}>
            {(form.getFieldValue('nickname') || username || '?').slice(0, 1).toUpperCase()}
          </Avatar>
          <div>
            <Typography.Text type="secondary">登录名（不可修改）</Typography.Text>
            <Typography.Title level={4} style={{ margin: '4px 0 8px' }}>
              {username}
            </Typography.Title>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                上传头像
              </Button>
            </Upload>
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
          {/* 隐藏字段：保存资料时把已上传的 avatarUrl 一并提交 */}
          <Form.Item name="avatarUrl" hidden>
            <Input />
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
