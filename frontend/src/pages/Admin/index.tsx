import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Space,
  Table,
  Tag,
  Typography,
  Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DeleteOutlined,
  SendOutlined,
  StopOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { MOCK_ADMIN_CONTENTS, type AdminContentItem } from '../../mocks/studioMock'
import { ROUTES } from '../../router/paths'
import { isAdmin, isLoggedIn, setDemoRole, subscribeAuthChange } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'
import studioStyles from '../Studio/Studio.module.css'

export function AdminHomePage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [admin, setAdmin] = useState(isAdmin)
  const [items, setItems] = useState(MOCK_ADMIN_CONTENTS)
  const [moduleFilter, setModuleFilter] = useState<'ALL' | 'ARTICLE' | 'PROJECT'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    return subscribeAuthChange(() => setAdmin(isAdmin()))
  }, [navigate])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (moduleFilter !== 'ALL' && i.module !== moduleFilter) return false
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false
      return true
    })
  }, [items, moduleFilter, statusFilter])

  function enableAdmin() {
    setDemoRole('ADMIN')
    setAdmin(true)
    message.success('已切换为管理员演示身份')
  }

  function disableAdmin() {
    setDemoRole('AUTHOR')
    setAdmin(false)
    message.info('已恢复为普通创作者')
  }

  function publish(id: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'PUBLISHED', updatedAt: new Date().toISOString() } : i)),
    )
    message.success('已发布（演示）')
  }

  function unpublish(id: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'DRAFT', updatedAt: new Date().toISOString() } : i)),
    )
    message.success('已下架（演示）')
  }

  function remove(id: number) {
    modal.confirm({
      title: '确认删除该内容？',
      content: '管理员删除将作用于所有用户内容（演示假数据）。',
      okType: 'danger',
      onOk: () => {
        setItems((prev) => prev.filter((i) => i.id !== id))
        message.success('已删除')
      },
    })
  }

  const columns: ColumnsType<AdminContentItem> = [
    {
      title: '模块',
      dataIndex: 'module',
      width: 90,
      render: (m: AdminContentItem['module']) =>
        m === 'ARTICLE' ? <Tag color="cyan">文章</Tag> : <Tag color="purple">项目</Tag>,
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '作者', dataIndex: 'author', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: AdminContentItem['status']) =>
        s === 'PUBLISHED' ? <Tag color="success">已发布</Tag> : <Tag>草稿</Tag>,
    },
    {
      title: '更新',
      dataIndex: 'updatedAt',
      width: 120,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      width: 260,
      render: (_, row) => (
        <Space wrap>
          {row.status === 'DRAFT' ? (
            <Button type="link" size="small" icon={<SendOutlined />} onClick={() => publish(row.id)}>
              发布
            </Button>
          ) : (
            <Button type="link" size="small" icon={<StopOutlined />} onClick={() => unpublish(row.id)}>
              下架
            </Button>
          )}
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => remove(row.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  if (!admin) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Typography.Title level={2} className={styles.pageTitle}>
          治理后台
        </Typography.Title>
        <Alert
          type="warning"
          showIcon
          icon={<CrownOutlined />}
          style={{ marginBottom: 16 }}
          message="当前账号不是管理员"
          description="后端角色体系接通前，可用演示开关切换。正式环境将由 users.role=ADMIN 控制。"
        />
        <Button type="primary" icon={<CrownOutlined />} onClick={enableAdmin}>
          演示：切换为管理员
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            内容治理
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            查看 / 发布 / 下架 / 删除全站文章与项目（演示数据，后端后续接入）。
          </Typography.Paragraph>
        </div>
        <Space>
          <Link to={ROUTES.ADMIN_ARTICLES}>
            <Button type="text">旧版文章表</Button>
          </Link>
          <Button onClick={disableAdmin}>退出管理员演示</Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        className={studioStyles.banner}
        message="管理员前端原型"
        description="数据来自 mocks，操作仅影响本页状态。"
      />

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          value={moduleFilter}
          style={{ width: 140 }}
          onChange={setModuleFilter}
          options={[
            { value: 'ALL', label: '全部模块' },
            { value: 'ARTICLE', label: '文章' },
            { value: 'PROJECT', label: '项目' },
          ]}
        />
        <Select
          value={statusFilter}
          style={{ width: 140 }}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: '全部状态' },
            { value: 'DRAFT', label: '草稿' },
            { value: 'PUBLISHED', label: '已发布' },
          ]}
        />
      </Space>

      <div className={studioStyles.tableWrap}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: [5, 10, 20],
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </div>
    </motion.div>
  )
}
