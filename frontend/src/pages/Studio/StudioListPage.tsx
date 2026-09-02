import { useState, type Key, useMemo, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Space,
  Table,
  Tag,
  Typography,
  Alert,
  Dropdown,
  Spin,
} from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { formatDateTime, excerpt } from '../../utils/format'
import styles from '../../styles/ui.module.css'
import studioStyles from './Studio.module.css'

export type StudioListMode = 'draft' | 'published'

type StudioListPageProps<T extends { id: number }> = {
  title: string
  description: string
  mode: StudioListMode
  moduleLabel: string
  createPath: string
  createLabel: string
  /** 真数据：挂载时拉取；失败只提示，不灌假数据 */
  loadItems: () => Promise<T[]>
  onPublish?: (ids: number[]) => Promise<void>
  onUnpublish?: (ids: number[]) => Promise<void>
  onDelete?: (ids: number[]) => Promise<void>
  getTitle: (item: T) => string
  getSubtitle: (item: T) => string
  getUpdatedAt: (item: T) => string
  editPath?: (id: number) => string
}

/**
 * 创作台列表的「展示壳」：
 * - 页面只负责传 loadItems / 批量动作（文章或项目）
 * - 列表 UI、多选、发布/下架/删除交互集中在这里，避免四套复制粘贴
 */
export function StudioListPage<T extends { id: number }>({
  title,
  description,
  mode,
  moduleLabel,
  createPath,
  createLabel,
  loadItems,
  onPublish,
  onUnpublish,
  onDelete,
  getTitle,
  getSubtitle,
  getUpdatedAt,
  editPath,
}: StudioListPageProps<T>) {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [items, setItems] = useState<T[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      setItems(await loadItems())
    } catch {
      setLoadError(true)
      message.error('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [loadItems, message])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const isDraft = mode === 'draft'

  async function runPublish(ids: number[]) {
    if (!onPublish) return
    try {
      await onPublish(ids)
      message.success(ids.length > 1 ? `已批量发布 ${ids.length} 项` : '已发布')
      setSelectedRowKeys([])
      await refresh()
    } catch {
      message.error('发布失败')
    }
  }

  async function runUnpublish(ids: number[]) {
    if (!onUnpublish) return
    try {
      await onUnpublish(ids)
      message.success(ids.length > 1 ? `已批量下架 ${ids.length} 项` : '已下架到草稿')
      setSelectedRowKeys([])
      await refresh()
    } catch {
      message.error('下架失败')
    }
  }

  function confirmDelete(ids: number[]) {
    if (!onDelete) return
    modal.confirm({
      title: `确认删除 ${ids.length} 项？`,
      content: '删除后进入软删除，列表中不再显示。',
      okType: 'danger',
      okText: '删除',
      onOk: async () => {
        try {
          await onDelete(ids)
          message.success('已删除')
          setSelectedRowKeys([])
          await refresh()
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<T> = useMemo(
    () => [
      {
        title: moduleLabel,
        key: 'main',
        render: (_, record) => (
          <div>
            <Typography.Text strong style={{ display: 'block' }}>
              {getTitle(record)}
            </Typography.Text>
            <Typography.Text type="secondary" className={studioStyles.sub}>
              {excerpt(getSubtitle(record), 72)}
            </Typography.Text>
          </div>
        ),
      },
      {
        title: '状态',
        width: 110,
        render: () =>
          isDraft ? <Tag color="default">草稿</Tag> : <Tag color="success">已发布</Tag>,
      },
      {
        title: '更新',
        width: 160,
        render: (_, record) => (
          <Typography.Text type="secondary">{formatDateTime(getUpdatedAt(record))}</Typography.Text>
        ),
      },
      {
        title: '操作',
        width: 220,
        render: (_, record) => {
          const menuItems = [
            isDraft
              ? {
                  key: 'publish',
                  icon: <SendOutlined />,
                  label: '发布',
                  onClick: () => void runPublish([record.id]),
                }
              : {
                  key: 'unpublish',
                  icon: <StopOutlined />,
                  label: '下架到草稿',
                  onClick: () => void runUnpublish([record.id]),
                },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              danger: true,
              label: '删除',
              onClick: () => confirmDelete([record.id]),
            },
          ]

          return (
            <Space>
              {isDraft && editPath ? (
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(editPath(record.id))}
                >
                  编辑
                </Button>
              ) : (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  需下架后编辑
                </Typography.Text>
              )}
              <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, isDraft, editPath],
  )

  const rowSelection: TableProps<T>['rowSelection'] = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/studio')}
            style={{ marginLeft: -8, marginBottom: 4 }}
          >
            创作台
          </Button>
          <Typography.Title level={2} className={styles.pageTitle}>
            {title}
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>{description}</Typography.Paragraph>
        </div>
        <Link to={createPath}>
          <Button type="primary" icon={<PlusOutlined />}>
            {createLabel}
          </Button>
        </Link>
      </div>

      {loadError ? (
        <Alert
          type="warning"
          showIcon
          className={studioStyles.banner}
          message="无法加载创作台数据"
          description="接口请求失败。请检查登录状态与后端服务后重试（不会用假数据顶替）。"
          action={
            <Button size="small" onClick={() => void refresh()}>
              重试
            </Button>
          }
        />
      ) : null}

      {selectedRowKeys.length > 0 ? (
        <div className={studioStyles.batchBar}>
          <Typography.Text>已选 {selectedRowKeys.length} 项</Typography.Text>
          <Space wrap>
            {isDraft ? (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => {
                  const ids = selectedRowKeys.map(Number)
                  modal.confirm({
                    title: `批量发布 ${ids.length} 项？`,
                    content: '发布后将对访客可见；已发布不可直接编辑。',
                    okText: '发布',
                    onOk: () => runPublish(ids),
                  })
                }}
              >
                批量发布
              </Button>
            ) : (
              <Button
                icon={<StopOutlined />}
                onClick={() => {
                  const ids = selectedRowKeys.map(Number)
                  modal.confirm({
                    title: `批量下架 ${ids.length} 项？`,
                    content: '下架后进入草稿，才可编辑。',
                    onOk: () => runUnpublish(ids),
                  })
                }}
              >
                批量下架
              </Button>
            )}
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(selectedRowKeys.map(Number))}
            >
              批量删除
            </Button>
          </Space>
        </div>
      ) : null}

      <div className={studioStyles.tableWrap}>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20],
              showTotal: (total) => `共 ${total} 条`,
            }}
            locale={{
              emptyText: loadError
                ? '加载失败'
                : isDraft
                  ? '暂无草稿，去创建一篇吧'
                  : '暂无已发布内容',
            }}
          />
        </Spin>
      </div>
    </motion.div>
  )
}
