import { useNavigate } from 'react-router-dom'
import { App, Button, Space, Typography } from 'antd'
import { DeleteOutlined, UndoOutlined } from '@ant-design/icons'

import {
  purgeAdminDeletedArticle,
  purgeAdminDeletedProject,
  restoreAdminDeletedArticle,
  restoreAdminDeletedProject,
} from '../api/adminDeleted'
import { ROUTES } from '../router/paths'
import { formatDateTime, formatPurgeRemaining } from '../utils/format'

type AdminDeletedActionsProps = {
  kind: 'article' | 'project'
  contentId: number
  published: boolean
  deletedAt?: string | null
  purgeAt?: string | null
}

/** 管理员在详情页预览已删内容：恢复 / 彻底删除 */
export function AdminDeletedActions({
  kind,
  contentId,
  published,
  deletedAt,
  purgeAt,
}: AdminDeletedActionsProps) {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const label = kind === 'article' ? '文章' : '项目'
  const listPath =
    kind === 'article' ? ROUTES.ADMIN_ARTICLES_DELETED : ROUTES.ADMIN_PROJECTS_DELETED

  function handleRestore() {
    modal.confirm({
      title: `恢复该${label}？`,
      content: `恢复后将回到作者的${published ? '已发布' : '草稿'}列表。`,
      okText: '恢复',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (kind === 'article') await restoreAdminDeletedArticle(contentId)
          else await restoreAdminDeletedProject(contentId)
          message.success('已恢复')
          navigate(listPath, { replace: true })
        } catch {
          message.error('恢复失败')
        }
      },
    })
  }

  function handlePurge() {
    modal.confirm({
      title: `立即彻底删除该${label}？`,
      content: '此操作不可撤销，内容将永久清除。',
      okType: 'danger',
      okText: '彻底删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (kind === 'article') await purgeAdminDeletedArticle(contentId)
          else await purgeAdminDeletedProject(contentId)
          message.success('已彻底删除')
          navigate(listPath, { replace: true })
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
        已删除
        {deletedAt ? ` · ${formatDateTime(deletedAt)}` : ''}
        {purgeAt ? ` · 剩余 ${formatPurgeRemaining(purgeAt)}` : ''}
      </Typography.Text>
      <Space wrap>
        <Button type="primary" icon={<UndoOutlined />} onClick={handleRestore}>
          恢复
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={handlePurge}>
          彻底删除
        </Button>
      </Space>
    </div>
  )
}
