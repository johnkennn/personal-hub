import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import {
  disableAdminUser,
  enableAdminUser,
  fetchAdminUsers,
} from '../../api/adminUsers'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES, userProfilePath } from '../../router/paths'
import { getUserId, isAdmin, isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import type { AdminUser } from '../../types/adminUser'
import styles from '../../styles/ui.module.css'

/**
 * 管理台 · 用户治理
 * 数据来自 GET /api/admin/users；启用/禁用走 POST .../enable|disable
 */
export function AdminUsersPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const myId = getUserId()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminUsers()
      setUsers(res.data.data ?? [])
    } catch {
      message.error('加载用户列表失败（需 ADMIN 账号）')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    if (!isAdmin()) {
      navigate(ROUTES.ADMIN, { replace: true })
      return
    }
    void load()
  }, [navigate, load])

  function handleDisable(user: AdminUser) {
    if (user.id === myId) {
      message.warning('不能禁用自己')
      return
    }
    modal.confirm({
      title: `禁用用户「${user.username}」？`,
      content: '禁用后该用户将无法登录。',
      okType: 'danger',
      okText: '禁用',
      onOk: async () => {
        try {
          const res = await disableAdminUser(user.id)
          setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data.data : u)))
          message.success('已禁用')
        } catch {
          message.error('禁用失败')
        }
      },
    })
  }

  async function handleEnable(user: AdminUser) {
    try {
      const res = await enableAdminUser(user.id)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data.data : u)))
      message.success('已启用')
    } catch {
      message.error('启用失败')
    }
  }

  const columns: ColumnsType<AdminUser> = [
    { title: 'ID', dataIndex: 'id', width: 72 },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 140,
      render: (name: string, row) => <Link to={userProfilePath(row.id)}>{name}</Link>,
    },
    { title: '邮箱', dataIndex: 'email', ellipsis: true },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      render: (phone: string | null) => phone || '—',
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (role: AdminUser['role']) =>
        role === 'ADMIN' ? <Tag color="gold">ADMIN</Tag> : <Tag>AUTHOR</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: AdminUser['status']) =>
        status === 'ACTIVE' ? (
          <Tag color="success">正常</Tag>
        ) : (
          <Tag color="error">已禁用</Tag>
        ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 140,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      width: 160,
      render: (_, user) => {
        const isSelf = user.id === myId
        return (
          <Space size={0}>
            <Link to={userProfilePath(user.id)}>
              <Button type="link" size="small">
                主页
              </Button>
            </Link>
            {user.status === 'ACTIVE' ? (
              <Button
                type="link"
                danger
                size="small"
                disabled={isSelf}
                onClick={() => handleDisable(user)}
              >
                禁用
              </Button>
            ) : (
              <Button type="link" size="small" onClick={() => void handleEnable(user)}>
                启用
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.ADMIN} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            用户管理
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            查看全站用户（含手机号与邮箱），点击用户名进入其公开主页。不能禁用当前管理员自己。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void load()}>刷新</Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={users}
        scroll={{ x: 960 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (t) => `共 ${t} 人`,
        }}
      />
    </motion.div>
  )
}
