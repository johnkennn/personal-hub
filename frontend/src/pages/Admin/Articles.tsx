import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import { fetchAdminArticles, unpublishAdminArticle } from '../../api/adminArticles'
import { fetchAdminUsers } from '../../api/adminUsers'
import { AdminListShell, AdminPager, ADMIN_PAGE_SIZE, sliceAdminPage } from '../../components/AdminListShell'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES, articleDetailPath, userProfilePath } from '../../router/paths'
import { isAdmin, isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import type { Article } from '../../types/article'
import styles from '../../styles/ui.module.css'

/**
 * 内容治理 · 文章
 * 只治理已发布内容：查看 / 强制下架。不做删除、编辑、代建。
 */
export function AdminArticlesPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [articles, setArticles] = useState<Article[]>([])
  const [authorNames, setAuthorNames] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(ADMIN_PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [articlesRes, usersRes] = await Promise.all([
        fetchAdminArticles(),
        fetchAdminUsers(),
      ])
      setArticles(articlesRes.data.data ?? [])
      const names: Record<number, string> = {}
      for (const u of usersRes.data.data ?? []) {
        names[u.id] = u.username
      }
      setAuthorNames(names)
    } catch {
      message.error('加载失败（需 ADMIN）')
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

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return articles
    return articles.filter((a) => a.title.toLowerCase().includes(q))
  }, [articles, keyword])

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

  function handleUnpublish(article: Article) {
    modal.confirm({
      title: `强制下架「${article.title}」？`,
      content: '下架后对公众不可见，作者可在草稿中继续编辑。',
      onOk: async () => {
        try {
          await unpublishAdminArticle(article.id)
          setArticles((prev) => prev.filter((a) => a.id !== article.id))
          message.success('已下架')
        } catch {
          message.error('下架失败')
        }
      },
    })
  }

  const columns: ColumnsType<Article> = [
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string, row) => <Link to={articleDetailPath(row.id)}>{title}</Link>,
    },
    {
      title: '作者',
      dataIndex: 'authorId',
      width: 140,
      ellipsis: true,
      render: (id?: number) => {
        if (id == null) return '—'
        const name = authorNames[id]
        return name ? <Link to={userProfilePath(id)}>{name}</Link> : `用户 #${id}`
      },
    },
    {
      title: '状态',
      width: 100,
      render: () => <Tag color="success">已发布</Tag>,
    },
    {
      title: '更新',
      dataIndex: 'updatedAt',
      width: 140,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      width: 120,
      render: (_, article) => (
        <Button type="link" size="small" onClick={() => handleUnpublish(article)}>
          强制下架
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
            文章管理
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            治理已发布文章：查看、强制下架。删除由作者自行处理；他人草稿不对管理员开放。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void load()}>刷新</Button>
      </div>

      <AdminListShell
        searchPlaceholder="按文章标题模糊搜索"
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
