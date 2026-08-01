import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import { deleteProject, fetchAllProjects } from '../../api/project'
import { ROUTES, projectEditPath, projectDetailPath } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import type { Project } from '../../types/project'
import styles from '../../styles/ui.module.css'

export function AdminProjectsPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    fetchAllProjects()
      .then((res) => setProjects(res.data.data ?? []))
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false))
  }, [navigate, message])

  function handleDelete(id: number) {
    modal.confirm({
      title: '确认删除？',
      okType: 'danger',
      onOk: async () => {
        await deleteProject(id)
        setProjects((prev) => prev.filter((item) => item.id !== id))
        message.success('已删除')
      },
    })
  }

  const columns: ColumnsType<Project> = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
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
      render: (_, project) => (
        <Space>
          {project.published ? (
            <Link to={projectDetailPath(project.id)}>查看</Link>
          ) : null}
          <Link to={projectEditPath(project.id)}>编辑</Link>
          <Button type="link" danger onClick={() => handleDelete(project.id)}>
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
          项目管理
        </Typography.Title>
        <Link to={ROUTES.PROJECT_NEW}>
          <Button type="primary">新建项目</Button>
        </Link>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={projects}
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
