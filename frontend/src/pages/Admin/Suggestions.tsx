import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Button, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import {
  deleteAdminSuggestion,
  fetchAdminSuggestions,
  type AdminSuggestionItem,
} from '../../api/suggestions'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES } from '../../router/paths'
import { isAdmin, isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import styles from '../../styles/ui.module.css'

/** 管理台 · 建议箱：查看全站建议并删除 */
export function AdminSuggestionsPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [items, setItems] = useState<AdminSuggestionItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminSuggestions()
      setItems(res.data.data ?? [])
    } catch {
      message.error('加载建议失败（需 ADMIN）')
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

  function handleDelete(row: AdminSuggestionItem) {
    modal.confirm({
      title: '删除这条建议？',
      content: `来自 ${row.userName}：${row.content.slice(0, 40)}${row.content.length > 40 ? '…' : ''}`,
      okType: 'danger',
      okText: '删除',
      onOk: async () => {
        try {
          await deleteAdminSuggestion(row.id)
          setItems((prev) => prev.filter((i) => i.id !== row.id))
          message.success('已删除')
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<AdminSuggestionItem> = [
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '提交者',
      dataIndex: 'userName',
      width: 140,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 140,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      width: 100,
      render: (_, row) => (
        <Button type="link" size="small" danger onClick={() => handleDelete(row)}>
          删除
        </Button>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.ADMIN} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            建议箱
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            查看用户提交的产品建议，可删除无效或重复内容。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void load()}>刷新</Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={items}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </motion.div>
  )
}
