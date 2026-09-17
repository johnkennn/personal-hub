import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  App,
  Avatar,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { motion } from 'framer-motion'

import {
  createAdminDeal,
  deleteAdminDeal,
  fetchAdminDeals,
  updateAdminDeal,
} from '../../api/adminDeals'
import { fetchAdminTools } from '../../api/adminTools'
import { AdminListShell, AdminPager, ADMIN_PAGE_SIZE, sliceAdminPage } from '../../components/AdminListShell'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES } from '../../router/paths'
import type { DealDto, DealStatus, DealUpsertBody } from '../../types/deal'
import type { ToolDto } from '../../types/tool'
import { isAdmin, isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import styles from '../../styles/ui.module.css'

type FormValues = {
  title: string
  description: string
  promoCode?: string
  url: string
  range: [Dayjs, Dayjs]
  status: DealStatus
  toolId: number
}

const STATUS_OPTIONS: { value: DealStatus; label: string }[] = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'ACTIVE', label: '进行中' },
  { value: 'ENDED', label: '已结束' },
  { value: 'OFFLINE', label: '已下架' },
]

export function AdminDealsPage() {
  const { message, modal } = App.useApp()
  const navigate = useNavigate()
  const [rows, setRows] = useState<DealDto[]>([])
  const [tools, setTools] = useState<ToolDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DealDto | null>(null)
  const [form] = Form.useForm<FormValues>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dealRes, toolRes] = await Promise.all([
        fetchAdminDeals(),
        fetchAdminTools(),
      ])
      setRows(dealRes.data.data ?? [])
      setTools(toolRes.data.data ?? [])
    } catch {
      message.error('加载优惠失败（请确认后端 Deal API 已就绪）')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    void load()
  }, [load, navigate])

  function openCreate() {
    setEditing(null)
    form.setFieldsValue({
      title: '',
      description: '',
      promoCode: '',
      url: '',
      range: [dayjs(), dayjs().add(14, 'day')],
      status: 'ACTIVE',
      toolId: tools[0]?.id,
    })
    setOpen(true)
  }

  function openEdit(row: DealDto) {
    setEditing(row)
    form.setFieldsValue({
      title: row.title,
      description: row.description,
      promoCode: row.promoCode ?? '',
      url: row.url ?? '',
      range: [dayjs(row.startsAt), dayjs(row.endsAt)],
      status: row.status,
      toolId: row.toolId ?? undefined,
    })
    setOpen(true)
  }

  async function submit() {
    const v = await form.validateFields()
    const body: DealUpsertBody = {
      title: v.title.trim(),
      description: v.description.trim(),
      promoCode: v.promoCode?.trim() || null,
      url: (() => {
        const u = v.url?.trim() || ''
        if (!u || u === 'https://' || u === 'http://') return null
        return u
      })(),
      startsAt: v.range[0].toISOString(),
      endsAt: v.range[1].toISOString(),
      status: v.status,
      toolId: v.toolId,
    }
    try {
      if (editing) {
        await updateAdminDeal(editing.id, body)
        message.success('已更新')
      } else {
        await createAdminDeal(body)
        message.success('已创建')
      }
      setOpen(false)
      await load()
    } catch {
      message.error('保存失败')
    }
  }

  function onDelete(row: DealDto) {
    modal.confirm({
      title: '删除该优惠？',
      content: '前台将不再展示（软删除）。',
      onOk: async () => {
        try {
          await deleteAdminDeal(row.id)
          message.success('已删除')
          await load()
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  const filtered = rows.filter((r) => {
    const q = keyword.trim().toLowerCase()
    if (!q) return true
    return (
      r.title.toLowerCase().includes(q) ||
      (r.toolName ?? '').toLowerCase().includes(q) ||
      (r.promoCode ?? '').toLowerCase().includes(q)
    )
  })
  const pageRows = sliceAdminPage(filtered, page, ADMIN_PAGE_SIZE)

  const columns: ColumnsType<DealDto> = [
    {
      title: '产品',
      key: 'tool',
      width: 160,
      render: (_, r) => {
        const tool = tools.find((t) => t.id === r.toolId)
        const logo = tool?.logoUrl
        return (
          <Space size={8}>
            <Avatar
              shape="square"
              size={28}
              src={resolveMediaUrl(logo) || undefined}
              style={{ borderRadius: 6, background: 'rgba(46, 230, 166, 0.16)' }}
            >
              {(r.toolName || r.title).slice(0, 1)}
            </Avatar>
            <span>{r.toolName || '—'}</span>
          </Space>
        )
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: DealStatus) => {
        const color =
          s === 'ACTIVE' ? 'success' : s === 'DRAFT' ? 'default' : 'warning'
        const label = STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '有效期',
      key: 'window',
      width: 220,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          {formatDateTime(r.startsAt)}
          <br />
          {formatDateTime(r.endsAt)}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => openEdit(r)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(r)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <BackNavButton fallback={ROUTES.ADMIN} className={styles.pageBack} />
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={3} className={styles.pageTitle}>
            AI 优惠管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" className={styles.pageDesc}>
            维护进行中的活动；状态为「进行中」且在有效期内才会出现在前台。
          </Typography.Paragraph>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建优惠
        </Button>
      </div>

      <AdminListShell
        searchPlaceholder="按标题 / 产品 / 优惠码搜索"
        keyword={keyword}
        onKeywordChange={(value) => {
          setKeyword(value)
          setPage(1)
        }}
        pageSize={ADMIN_PAGE_SIZE}
        pager={
          <AdminPager
            current={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={filtered.length}
            onChange={(p) => setPage(p)}
          />
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={pageRows}
          pagination={false}
          size="middle"
        />
      </AdminListShell>

      <Modal
        title={editing ? '编辑优惠' : '新建优惠'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void submit()}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item name="description" label="说明" rules={[{ required: true }]}>
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Form.Item
            name="url"
            label="活动链接（可选）"
            rules={[{ type: 'url', message: '请输入合法链接' }]}
          >
            <Input placeholder="有则前台展示；无则不显示" />
          </Form.Item>
          <Form.Item name="promoCode" label="优惠码（可选）">
            <Input maxLength={64} />
          </Form.Item>
          <Form.Item
            name="toolId"
            label="关联产品"
            rules={[{ required: true, message: '请选择关联 AI 产品（卡片会展示其 Logo）' }]}
            extra="必填。前台优惠卡会显示该产品 Logo，方便一眼认出。"
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="选择 AI 产品"
              options={tools.map((t) => ({
                value: t.id,
                label: `${t.name} (${t.slug})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="range"
            label="有效期"
            rules={[{ required: true, message: '请选择起止时间' }]}
          >
            <DatePicker.RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
        <div style={{ marginTop: 8 }}>
          <Link to={ROUTES.DEALS}>查看前台 AI 优惠</Link>
        </div>
      </Modal>
    </motion.div>
  )
}
