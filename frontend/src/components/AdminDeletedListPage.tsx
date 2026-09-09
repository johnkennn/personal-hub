import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import type { AdminDeletedContent } from '../api/adminDeleted'
import { AdminListShell, AdminPager, ADMIN_PAGE_SIZE, sliceAdminPage } from './AdminListShell'
import { BackNavButton } from './BackNavButton'
import { ROUTES, articleDetailPath, projectDetailPath, userProfilePath } from '../router/paths'
import { isAdmin, isLoggedIn } from '../utils/authStorage'
import { formatDateTime, formatPurgeRemaining } from '../utils/format'
import styles from '../styles/ui.module.css'

type AdminDeletedListPageProps = {
  kind: 'article' | 'project'
  title: string
  description: string
  fetchList: () => Promise<{ data: { data?: AdminDeletedContent[] | null } }>
  restoreItem: (id: number) => Promise<unknown>
  purgeItem: (id: number) => Promise<unknown>
}

export function AdminDeletedListPage({
  kind,
  title,
  description,
  fetchList,
  restoreItem,
  purgeItem,
}: AdminDeletedListPageProps) {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [items, setItems] = useState<AdminDeletedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(ADMIN_PAGE_SIZE)

  const label = kind === 'article' ? '文章' : '项目'
  const detailPath = kind === 'article' ? articleDetailPath : projectDetailPath

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchList()
      setItems(res.data.data ?? [])
    } catch {
      message.error('加载失败（需管理员）')
    } finally {
      setLoading(false)
    }
  }, [fetchList, message])

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

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        row.authorName.toLowerCase().includes(q),
    )
  }, [items, keyword])

  const pageItems = useMemo(
    () => sliceAdminPage(filtered, page, pageSize),
    [filtered, page, pageSize],
  )

  function onKeywordChange(value: string) {
    setKeyword(value)
    setPage(1)
  }

  function onPageChange(nextPage: number, nextSize: number) {
    if (nextSize !== pageSize) {
      setPageSize(nextSize)
      setPage(1)
    } else {
      setPage(nextPage)
    }
  }

  function handleRestore(row: AdminDeletedContent) {
    modal.confirm({
      title: `恢复「${row.title}」？`,
      content: `恢复后将回到作者的${row.published ? '已发布' : '草稿'}列表。`,
      okText: '恢复',
      cancelText: '取消',
      onOk: async () => {
        try {
          await restoreItem(row.id)
          setItems((prev) => prev.filter((x) => x.id !== row.id))
          message.success('已恢复')
        } catch {
          message.error('恢复失败')
        }
      },
    })
  }

  function handlePurge(row: AdminDeletedContent) {
    modal.confirm({
      title: `立即彻底删除「${row.title}」？`,
      content: '此操作不可撤销，内容将永久清除。',
      okType: 'danger',
      okText: '彻底删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await purgeItem(row.id)
          setItems((prev) => prev.filter((x) => x.id !== row.id))
          message.success('已彻底删除')
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<AdminDeletedContent> = [
    {
      title: '作品名',
      dataIndex: 'title',
      ellipsis: true,
      render: (name: string, row) => <Link to={detailPath(row.id)}>{name}</Link>,
    },
    {
      title: '作者',
      dataIndex: 'authorName',
      width: 140,
      ellipsis: true,
      render: (name: string, row) =>
        row.authorId != null ? (
          <Link to={userProfilePath(row.authorId)}>{name}</Link>
        ) : (
          name
        ),
    },
    {
      title: '删除时间',
      dataIndex: 'deletedAt',
      width: 130,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '剩余时间',
      dataIndex: 'purgeAt',
      width: 140,
      render: (v: string) => {
        const text = formatPurgeRemaining(v)
        return text === '即将清除' ? <Tag color="warning">{text}</Tag> : text
      },
    },
    {
      title: '操作',
      width: 240,
      render: (_, row) => (
        <Space size={0} wrap>
          <Link to={detailPath(row.id)}>
            <Button type="link" size="small">
              查看详情
            </Button>
          </Link>
          <Button type="link" size="small" onClick={() => handleRestore(row)}>
            恢复
          </Button>
          <Button type="link" size="small" danger onClick={() => handlePurge(row)}>
            彻底删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.ADMIN} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            {title}
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>{description}</Typography.Paragraph>
        </div>
        <Button onClick={() => void load()}>刷新</Button>
      </div>

      <AdminListShell
        searchPlaceholder={`按${label}名或作者搜索`}
        keyword={keyword}
        onKeywordChange={onKeywordChange}
        pageSize={pageSize}
        pager={
          <AdminPager
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            onChange={onPageChange}
          />
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={pageItems}
          pagination={false}
        />
      </AdminListShell>
    </motion.div>
  )
}
