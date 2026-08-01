import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import { deleteArticle, fetchAllArticles } from '../../api/blog'
import { ROUTES, blogEditPath, articleDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import type { Article } from '../../types/article'
import styles from '../../styles/ui.module.css'

export function AdminArticlesPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    fetchAllArticles()
      .then((res) => setArticles(res.data.data ?? []))
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false))
  }, [navigate, message])

  function handleDelete(id: number) {
    modal.confirm({
      title: '确认删除？',
      okType: 'danger',
      onOk: async () => {
        await deleteArticle(id)
        setArticles((prev) => prev.filter((item) => item.id !== id))
        message.success('已删除')
      },
    })
  }

  const columns: ColumnsType<Article> = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'published',
      width: 100,
      render: (published: boolean) =>
        published ? <Tag color="success">已发布</Tag> : <Tag>草稿</Tag>,
    },
    {
      title: '操作',
      width: 220,
      render: (_, article) => (
        <Space>
          {article.published ? (
            <Link to={articleDetailPath(article.id)}>查看</Link>
          ) : null}
          <Link to={blogEditPath(article.id)}>编辑</Link>
          <Button type="link" danger onClick={() => handleDelete(article.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <Typography.Title level={2} className={styles.pageTitle}>
          文章管理
        </Typography.Title>
        <Link to={ROUTES.ARTICLE_NEW}>
          <Button type="primary">新建文章</Button>
        </Link>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={articles}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </motion.div>
  )
}
