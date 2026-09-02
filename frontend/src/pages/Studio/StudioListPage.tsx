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
import { getStudioBucket, saveStudioBucket } from '../../utils/studioStorage'
import styles from '../../styles/ui.module.css'
import studioStyles from './Studio.module.css'

export type StudioListMode = 'draft' | 'published'
export type StudioPersistBucket =
  | 'articleDrafts'
  | 'articlePublished'
  | 'projectDrafts'
  | 'projectPublished'

type StudioListPageProps<T extends { id: number }> = {
  title: string
  description: string
  mode: StudioListMode
  moduleLabel: string
  createPath: string
  createLabel: string
  /** 演示回退数据；remote 模式下仅作初始空列表 */
  initialItems?: T[]
  persistBucket?: StudioPersistBucket
  /** 提供则走真 API：加载与发布/下架/删除 */
  loadItems?: () => Promise<T[]>
  onPublish?: (ids: number[]) => Promise<void>
  onUnpublish?: (ids: number[]) => Promise<void>
  onDelete?: (ids: number[]) => Promise<void>
  getTitle: (item: T) => string
  getSubtitle: (item: T) => string
  getUpdatedAt: (item: T) => string
  editPath?: (id: number) => string
}

export function StudioListPage<T extends { id: number }>({
  title,
  description,
  mode,
  moduleLabel,
  createPath,
  createLabel,
  initialItems = [],
  persistBucket,
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
  const remote = Boolean(loadItems)
  const [items, setItems] = useState<T[]>(() => {
    if (remote) return []
    if (persistBucket) return getStudioBucket(persistBucket) as unknown as T[]
    return initialItems
  })
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(remote)
  const [loadError, setLoadError] = useState(false)

  const refresh = useCallback(async () => {
    if (!loadItems) return
    setLoading(true)
    setLoadError(false)
    try {
      const next = await loadItems()
      setItems(next)
    } catch {
      setLoadError(true)
      message.error('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [loadItems, message])

  useEffect(() => {
    if (remote) {
      void refresh()
      return
    }
  }, [remote, refresh])

  useEffect(() => {
    if (remote || !persistBucket) return
    saveStudioBucket(persistBucket, items as never)
  }, [items, persistBucket, remote])

  const isDraft = mode === 'draft'

  async function runPublish(ids: number[]) {
    if (onPublish) {
      try {
        await onPublish(ids)
        message.success(ids.length > 1 ? `已批量发布 ${ids.length} 项` : '已发布')
        setSelectedRowKeys([])
        await refresh()
      } catch {
        message.error('发布失败')
      }
      return
    }
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
    setSelectedRowKeys([])
    message.success(
      ids.length > 1 ? `已批量发布 ${ids.length} 项（演示）` : '已发布（演示）',
    )
  }

  async function runUnpublish(ids: number[]) {
    if (onUnpublish) {
      try {
        await onUnpublish(ids)
        message.success(ids.length > 1 ? `已批量下架 ${ids.length} 项` : '已下架到草稿')
        setSelectedRowKeys([])
        await refresh()
      } catch {
        message.error('下架失败')
      }
      return
    }
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
    setSelectedRowKeys([])
    message.success(
      ids.length > 1 ? `已批量下架 ${ids.length} 项（演示）` : '已下架到草稿（演示）',
    )
  }

  function confirmDelete(ids: number[]) {
    modal.confirm({
      title: `确认删除 ${ids.length} 项？`,
      content: remote ? '删除后进入软删除，列表中不再显示。' : '演示环境为本地移除。',
      okType: 'danger',
      okText: '删除',
      onOk: async () => {
        if (onDelete) {
          try {
            await onDelete(ids)
            message.success('已删除')
            setSelectedRowKeys([])
            await refresh()
          } catch {
            message.error('删除失败')
          }
          return
        }
        setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
        setSelectedRowKeys([])
        message.success('已删除')
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
        width: 120,
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
    [items, isDraft, editPath, remote],
  )

  const rowSelection: TableProps<T>['rowSelection'] = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }

  function batchPublish() {
    const ids = selectedRowKeys.map(Number)
    modal.confirm({
      title: `批量发布 ${ids.length} 项？`,
      content: '发布后将对所有访客可见；已发布内容不可直接编辑。',
      okText: '发布',
      onOk: () => runPublish(ids),
    })
  }

  function batchUnpublish() {
    const ids = selectedRowKeys.map(Number)
    modal.confirm({
      title: `批量下架 ${ids.length} 项？`,
      content: '下架后进入草稿，才可编辑。',
      onOk: () => runUnpublish(ids),
    })
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

      {remote ? (
        loadError ? (
          <Alert
            type="warning"
            showIcon
            className={studioStyles.banner}
            message="无法加载创作台数据"
            description="接口请求失败。请检查登录状态与后端服务后重试。"
            action={
              <Button size="small" onClick={() => void refresh()}>
                重试
              </Button>
            }
          />
        ) : null
      ) : (
        <Alert
          type="info"
          showIcon
          className={studioStyles.banner}
          message="当前为创作台演示数据"
          description="该列表尚未对接 /api/me/*。失败时不会用假数据冒充真实内容。"
        />
      )}

      {selectedRowKeys.length > 0 ? (
        <div className={studioStyles.batchBar}>
          <Typography.Text>已选 {selectedRowKeys.length} 项</Typography.Text>
          <Space wrap>
            {isDraft ? (
              <Button type="primary" icon={<SendOutlined />} onClick={batchPublish}>
                批量发布
              </Button>
            ) : (
              <Button icon={<StopOutlined />} onClick={batchUnpublish}>
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
                  ? '暂无草稿，去写一篇吧'
                  : '暂无已发布内容',
            }}
          />
        </Spin>
      </div>
    </motion.div>
  )
}
