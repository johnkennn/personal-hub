import { useState, type Key, useMemo, useEffect } from 'react'
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
import { pushActivity } from '../../utils/activityStorage'
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
  initialItems: T[]
  persistBucket?: StudioPersistBucket
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
  initialItems,
  persistBucket,
  getTitle,
  getSubtitle,
  getUpdatedAt,
  editPath,
}: StudioListPageProps<T>) {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [items, setItems] = useState<T[]>(() =>
    persistBucket ? (getStudioBucket(persistBucket) as unknown as T[]) : initialItems,
  )
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  useEffect(() => {
    if (!persistBucket) return
    saveStudioBucket(persistBucket, items as never)
  }, [items, persistBucket])

  const isDraft = mode === 'draft'

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
                  onClick: () => mockPublish([record.id]),
                }
              : {
                  key: 'unpublish',
                  icon: <StopOutlined />,
                  label: '下架到草稿',
                  onClick: () => mockUnpublish([record.id]),
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

  function mockPublish(ids: number[]) {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
    setSelectedRowKeys([])
    message.success(
      ids.length > 1 ? `已批量发布 ${ids.length} 项（演示）` : '已发布（演示）',
    )
    pushActivity({
      title: '创作台：内容已发布',
      desc: `发布了 ${ids.length} 项（本地演示）`,
      href: '/studio',
    })
  }

  function mockUnpublish(ids: number[]) {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
    setSelectedRowKeys([])
    message.success(
      ids.length > 1 ? `已批量下架 ${ids.length} 项（演示）` : '已下架到草稿（演示）',
    )
  }

  function confirmDelete(ids: number[]) {
    modal.confirm({
      title: `确认删除 ${ids.length} 项？`,
      content: '演示环境为假数据移除；正式版将走软删除。',
      okType: 'danger',
      okText: '删除',
      onOk: () => {
        setItems((prev) => prev.filter((i) => !ids.includes(i.id)))
        setSelectedRowKeys([])
        message.success('已删除')
      },
    })
  }

  function batchPublish() {
    const ids = selectedRowKeys.map(Number)
    modal.confirm({
      title: `批量发布 ${ids.length} 项？`,
      content: '发布后将对所有访客可见；已发布内容不可直接编辑。',
      okText: '发布',
      onOk: () => mockPublish(ids),
    })
  }

  function batchUnpublish() {
    const ids = selectedRowKeys.map(Number)
    modal.confirm({
      title: `批量下架 ${ids.length} 项？`,
      content: '下架后进入草稿，才可编辑。',
      onOk: () => mockUnpublish(ids),
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

      <Alert
        type="info"
        showIcon
        className={studioStyles.banner}
        message="当前为创作台 UI 演示数据"
        description="列表读写尚未对接 /api/me/* 接口。交互（编辑限制、发布/下架、批量）已按产品规则实现。"
      />

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
          locale={{ emptyText: isDraft ? '暂无草稿' : '暂无已发布内容' }}
        />
      </div>
    </motion.div>
  )
}
