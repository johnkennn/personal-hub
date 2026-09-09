import { Link, useNavigate } from 'react-router-dom'
import { App, Button, Space } from 'antd'
import { DeleteOutlined, EditOutlined, RollbackOutlined } from '@ant-design/icons'

import {
  batchDeleteMyArticles,
  batchUnpublishMyArticles,
} from '../api/article'
import {
  batchDeleteMyProjects,
  batchUnpublishMyProjects,
} from '../api/project'
import { invalidateDiscoverCatalog } from '../services/publicContent'

type OwnerContentActionsProps = {
  kind: 'article' | 'project'
  contentId: number
  published: boolean
  editPath: string
  draftsPath: string
  publishedPath: string
}

/** 作者查看自己的详情：草稿可编辑/删除；已发布可下架/删除（均二次确认） */
export function OwnerContentActions({
  kind,
  contentId,
  published,
  editPath,
  draftsPath,
  publishedPath,
}: OwnerContentActionsProps) {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const label = kind === 'article' ? '文章' : '项目'

  function confirmUnpublish() {
    modal.confirm({
      title: `确认下架该${label}？`,
      content: '下架后将对访客不可见，并回到草稿，之后才能编辑。',
      okText: '下架',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (kind === 'article') await batchUnpublishMyArticles([contentId])
          else await batchUnpublishMyProjects([contentId])
          invalidateDiscoverCatalog()
          message.success('已下架到草稿')
          navigate(draftsPath, { replace: true })
        } catch {
          message.error('下架失败')
        }
      },
    })
  }

  function confirmDelete() {
    modal.confirm({
      title: `确认删除该${label}？`,
      content: '删除后将从你的列表中移除，且访客不可见。',
      okType: 'danger',
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (kind === 'article') await batchDeleteMyArticles([contentId])
          else await batchDeleteMyProjects([contentId])
          invalidateDiscoverCatalog()
          message.success('已删除')
          navigate(published ? publishedPath : draftsPath, { replace: true })
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      {!published ? (
        <Link to={editPath}>
          <Button type="primary" icon={<EditOutlined />}>
            编辑
          </Button>
        </Link>
      ) : (
        <Button icon={<RollbackOutlined />} onClick={confirmUnpublish}>
          下架
        </Button>
      )}
      <Button danger icon={<DeleteOutlined />} onClick={confirmDelete}>
        删除
      </Button>
    </Space>
  )
}
