import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { motion } from 'framer-motion'

import { fetchAdminProjects, unpublishAdminProject } from '../../api/adminProjects'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES, projectDetailPath } from '../../router/paths'
import { isAdmin, isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import type { Project } from '../../types/project'
import styles from '../../styles/ui.module.css'

/**
 * 内容治理 · 项目
 * 只治理已发布内容：查看 / 强制下架。不做删除、编辑、代建。
 */
export function AdminProjectsPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminProjects()
      setProjects(res.data.data ?? [])
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

  function handleUnpublish(project: Project) {
    modal.confirm({
      title: `强制下架「${project.name}」？`,
      content: '下架后对公众不可见，作者可在草稿中继续编辑。',
      onOk: async () => {
        try {
          await unpublishAdminProject(project.id)
          setProjects((prev) => prev.filter((p) => p.id !== project.id))
          message.success('已下架')
        } catch {
          message.error('下架失败')
        }
      },
    })
  }

  const columns: ColumnsType<Project> = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
    {
      title: '作者 ID',
      dataIndex: 'authorId',
      width: 100,
      render: (id?: number) => id ?? '—',
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
      width: 180,
      render: (_, project) => (
        <Space wrap>
          <Link to={projectDetailPath(project.id)}>查看</Link>
          <Button type="link" size="small" onClick={() => handleUnpublish(project)}>
            强制下架
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
            项目管理
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            治理已发布项目：查看、强制下架。删除由作者自行处理；他人草稿不对管理员开放。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void load()}>刷新</Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={projects}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </motion.div>
  )
}
