import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  App,
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import {
  createAdminTool,
  createAdminToolCategory,
  deleteAdminTool,
  deleteAdminToolCategory,
  fetchAdminToolCategories,
  fetchAdminTools,
  unpublishAdminTool,
  updateAdminTool,
  updateAdminToolCategory,
  uploadAdminToolLogo,
  type AdminCategoryUpsertBody,
  type AdminToolUpsertBody,
} from '../../api/adminTools'
import { AdminListShell, AdminPager, ADMIN_PAGE_SIZE, sliceAdminPage } from '../../components/AdminListShell'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES, toolDetailPath } from '../../router/paths'
import { invalidateToolCatalogCache } from '../../services/toolCatalog'
import type { ToolCategoryDto, ToolDto } from '../../types/tool'
import { apiErrorMessage } from '../../utils/apiError'
import { isAdmin, isLoggedIn } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import styles from '../../styles/ui.module.css'

function parseJsonList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  try {
    const v: unknown = JSON.parse(raw)
    return Array.isArray(v) ? v.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

function toJsonList(list: string[] | undefined): string | null {
  if (!list?.length) return null
  return JSON.stringify(list.map((s) => s.trim()).filter(Boolean))
}

/** 根据官网域名生成可读的默认 Logo 地址（可再上传覆盖） */
function faviconLogoFromWebsite(websiteUrl: string): string {
  const raw = websiteUrl.trim()
  if (!raw) return ''
  try {
    const host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  } catch {
    return ''
  }
}

type ToolFormValues = {
  slug: string
  name: string
  categoryId: number
  summary: string
  intro: string
  audience?: string
  pricing: string
  websiteUrl: string
  logoUrl: string
  affiliateUrl?: string
  keywords?: string[]
  tags?: string[]
  useCases?: string[]
  pros?: string[]
  cons?: string[]
  featured: boolean
  weight: number
  published: boolean
}

type CategoryFormValues = AdminCategoryUpsertBody

export function AdminToolsPage() {
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [tab, setTab] = useState('tools')
  const [tools, setTools] = useState<ToolDto[]>([])
  const [categories, setCategories] = useState<ToolCategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(ADMIN_PAGE_SIZE)

  const [toolModalOpen, setToolModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<ToolDto | null>(null)
  const [toolSubmitting, setToolSubmitting] = useState(false)
  const [toolForm] = Form.useForm<ToolFormValues>()

  const [catModalOpen, setCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<ToolCategoryDto | null>(null)
  const [catSubmitting, setCatSubmitting] = useState(false)
  const [catForm] = Form.useForm<CategoryFormValues>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [toolsRes, catsRes] = await Promise.all([
        fetchAdminTools(),
        fetchAdminToolCategories(),
      ])
      setTools(toolsRes.data.data ?? [])
      setCategories(catsRes.data.data ?? [])
    } catch {
      message.error('加载失败（需管理员登录）')
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

  const filteredTools = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return tools
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.categoryName ?? '').toLowerCase().includes(q),
    )
  }, [tools, keyword])

  const pageItems = useMemo(
    () => sliceAdminPage(filteredTools, page, pageSize),
    [filteredTools, page, pageSize],
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

  function openCreateTool() {
    setEditingTool(null)
    toolForm.resetFields()
    toolForm.setFieldsValue({
      featured: false,
      weight: 0,
      published: true,
      categoryId: categories[0]?.id,
      keywords: [],
      tags: [],
      useCases: [],
      pros: [],
      cons: [],
    })
    setToolModalOpen(true)
  }

  function openEditTool(row: ToolDto) {
    setEditingTool(row)
    toolForm.setFieldsValue({
      slug: row.slug,
      name: row.name,
      categoryId: row.categoryId,
      summary: row.summary,
      intro: row.intro,
      audience: row.audience ?? undefined,
      pricing: row.pricing,
      websiteUrl: row.websiteUrl,
      logoUrl: row.logoUrl ?? '',
      affiliateUrl: row.affiliateUrl ?? undefined,
      keywords: parseJsonList(row.keywordsJson),
      tags: parseJsonList(row.tagsJson),
      useCases: parseJsonList(row.useCasesJson),
      pros: parseJsonList(row.prosJson),
      cons: parseJsonList(row.consJson),
      featured: Boolean(row.featured),
      weight: row.weight ?? 0,
      published: Boolean(row.published),
    })
    setToolModalOpen(true)
  }

  async function submitTool() {
    const values = await toolForm.validateFields()
    const body: AdminToolUpsertBody = {
      slug: values.slug.trim(),
      name: values.name.trim(),
      categoryId: values.categoryId,
      summary: values.summary.trim(),
      intro: values.intro.trim(),
      audience: values.audience?.trim() || null,
      pricing: values.pricing.trim(),
      websiteUrl: values.websiteUrl.trim(),
      logoUrl: values.logoUrl.trim(),
      affiliateUrl: values.affiliateUrl?.trim() || null,
      keywordsJson: toJsonList(values.keywords),
      tagsJson: toJsonList(values.tags),
      useCasesJson: toJsonList(values.useCases),
      prosJson: toJsonList(values.pros),
      consJson: toJsonList(values.cons),
      featured: values.featured,
      weight: values.weight ?? 0,
      published: values.published,
    }
    setToolSubmitting(true)
    try {
      if (editingTool) {
        await updateAdminTool(editingTool.id, body)
        message.success('已保存')
      } else {
        await createAdminTool(body)
        message.success('已创建')
      }
      setToolModalOpen(false)
      invalidateToolCatalogCache()
      await load()
    } catch {
      message.error(editingTool ? '保存失败' : '创建失败')
    } finally {
      setToolSubmitting(false)
    }
  }

  function handleUnpublish(row: ToolDto) {
    modal.confirm({
      title: `下架「${row.name}」？`,
      content: '下架后前台 AI导览与检索将不再显示。',
      onOk: async () => {
        try {
          await unpublishAdminTool(row.id)
          invalidateToolCatalogCache()
          message.success('已下架')
          await load()
        } catch {
          message.error('下架失败')
        }
      },
    })
  }

  function handleDeleteTool(row: ToolDto) {
    modal.confirm({
      title: `删除「${row.name}」？`,
      content: '将软删除；前台不可见。分类下若仍有工具则不受影响。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAdminTool(row.id)
          invalidateToolCatalogCache()
          message.success('已删除')
          await load()
        } catch {
          message.error('删除失败')
        }
      },
    })
  }

  function openCreateCategory() {
    setEditingCat(null)
    catForm.resetFields()
    catForm.setFieldsValue({ sortOrder: (categories.length + 1) * 10 })
    setCatModalOpen(true)
  }

  function openEditCategory(row: ToolCategoryDto) {
    setEditingCat(row)
    catForm.setFieldsValue({
      name: row.name,
      slug: row.slug,
      sortOrder: row.sortOrder,
    })
    setCatModalOpen(true)
  }

  async function submitCategory() {
    const values = await catForm.validateFields()
    const body: AdminCategoryUpsertBody = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      sortOrder: values.sortOrder ?? 0,
    }
    setCatSubmitting(true)
    try {
      if (editingCat) {
        await updateAdminToolCategory(editingCat.id, body)
        message.success('分类已保存')
      } else {
        await createAdminToolCategory(body)
        message.success('分类已创建')
      }
      setCatModalOpen(false)
      invalidateToolCatalogCache()
      await load()
    } catch {
      message.error(editingCat ? '保存失败' : '创建失败')
    } finally {
      setCatSubmitting(false)
    }
  }

  function handleDeleteCategory(row: ToolCategoryDto) {
    modal.confirm({
      title: `删除分类「${row.name}」？`,
      content: '若分类下还有工具，后端会拒绝删除。',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAdminToolCategory(row.id)
          invalidateToolCatalogCache()
          message.success('已删除分类')
          await load()
        } catch {
          message.error('删除失败（可能仍有关联工具）')
        }
      },
    })
  }

  const toolColumns: ColumnsType<ToolDto> = [
    {
      title: 'Logo',
      width: 64,
      render: (_, row) => (
        <Avatar
          shape="square"
          size={36}
          src={resolveMediaUrl(row.logoUrl) || undefined}
          style={{ borderRadius: 8, background: 'rgba(46, 230, 166, 0.16)' }}
        >
          {row.name.slice(0, 1)}
        </Avatar>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (name: string, row) =>
        row.published ? <Link to={toolDetailPath(row.slug)}>{name}</Link> : name,
    },
    {
      title: 'slug',
      dataIndex: 'slug',
      width: 120,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      width: 110,
      ellipsis: true,
      render: (v: string | null) => v ?? '—',
    },
    {
      title: '状态',
      width: 100,
      render: (_, row) =>
        row.published ? <Tag color="success">已上架</Tag> : <Tag>未上架</Tag>,
    },
    {
      title: '精选',
      width: 70,
      render: (_, row) => (row.featured ? <Tag color="processing">是</Tag> : '—'),
    },
    {
      title: '更新',
      dataIndex: 'updatedAt',
      width: 140,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      width: 220,
      render: (_, row) => (
        <Space size={0} wrap>
          <Button type="link" size="small" onClick={() => openEditTool(row)}>
            编辑
          </Button>
          {row.published ? (
            <Button type="link" size="small" onClick={() => handleUnpublish(row)}>
              下架
            </Button>
          ) : null}
          <Button type="link" size="small" danger onClick={() => handleDeleteTool(row)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const categoryColumns: ColumnsType<ToolCategoryDto> = [
    { title: '名称', dataIndex: 'name' },
    { title: 'slug', dataIndex: 'slug', width: 140 },
    { title: '排序', dataIndex: 'sortOrder', width: 90 },
    {
      title: '操作',
      width: 160,
      render: (_, row) => (
        <Space size={0}>
          <Button type="link" size="small" onClick={() => openEditCategory(row)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteCategory(row)}>
            删除
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
            AI导览管理
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            维护分类与 AI 产品：上架后会出现在 AI导览、发现页与聊天检索中。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void load()}>刷新</Button>
      </div>

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: 'tools',
            label: `工具（${tools.length}）`,
            children: (
              <AdminListShell
                searchPlaceholder="按名称 / slug / 分类搜索"
                keyword={keyword}
                onKeywordChange={onKeywordChange}
                pageSize={pageSize}
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTool}>
                    新建工具
                  </Button>
                }
                pager={
                  <AdminPager
                    current={page}
                    pageSize={pageSize}
                    total={filteredTools.length}
                    onChange={onPageChange}
                  />
                }
              >
                <Table
                  rowKey="id"
                  loading={loading}
                  columns={toolColumns}
                  dataSource={pageItems}
                  pagination={false}
                />
              </AdminListShell>
            ),
          },
          {
            key: 'categories',
            label: `分类（${categories.length}）`,
            children: (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCategory}>
                    新建分类
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  loading={loading}
                  columns={categoryColumns}
                  dataSource={categories}
                  pagination={false}
                />
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editingTool ? `编辑工具 · ${editingTool.name}` : '新建工具'}
        open={toolModalOpen}
        onCancel={() => setToolModalOpen(false)}
        onOk={() => void submitTool()}
        confirmLoading={toolSubmitting}
        width={720}
        destroyOnHidden
      >
        <Form form={toolForm} layout="vertical" style={{ marginTop: 8 }}>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入名称' }]}
              style={{ minWidth: 200, flex: 1 }}
            >
              <Input placeholder="如：豆包" />
            </Form.Item>
            <Form.Item
              name="slug"
              label="slug"
              rules={[{ required: true, message: '请输入 slug' }]}
              style={{ minWidth: 160, flex: 1 }}
              extra="网址用，小写英文，如 doubao"
            >
              <Input placeholder="doubao" disabled={Boolean(editingTool)} />
            </Form.Item>
          </Space>
          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="选择分类"
            />
          </Form.Item>
          <Form.Item
            name="summary"
            label="一句话摘要"
            rules={[{ required: true, message: '请输入摘要' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="intro"
            label="详细介绍"
            rules={[{ required: true, message: '请输入介绍' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="audience" label="适合谁">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space wrap style={{ width: '100%' }} size="middle">
            <Form.Item
              name="pricing"
              label="定价"
              rules={[{ required: true, message: '请输入定价说明' }]}
              style={{ minWidth: 180, flex: 1 }}
            >
              <Input placeholder="免费 + 会员" />
            </Form.Item>
            <Form.Item
              name="websiteUrl"
              label="官网"
              rules={[{ required: true, message: '请输入官网' }]}
              style={{ minWidth: 240, flex: 2 }}
            >
              <Input
                placeholder="https://..."
                onBlur={(e) => {
                  const current = toolForm.getFieldValue('logoUrl') as string | undefined
                  if (current?.trim()) return
                  const auto = faviconLogoFromWebsite(e.target.value)
                  if (auto) toolForm.setFieldValue('logoUrl', auto)
                }}
              />
            </Form.Item>
          </Space>
          <Form.Item
            name="logoUrl"
            label="Logo"
            rules={[{ required: true, message: '请上传或填写 Logo 地址' }]}
            extra="必填。可粘贴图片 URL；填写官网后若为空会自动用站点图标；编辑已有工具时可直接上传。"
          >
            <Input placeholder="https://... 或 /media/..." />
          </Form.Item>
          <Form.Item shouldUpdate={(prev, next) => prev.logoUrl !== next.logoUrl} noStyle>
            {() => {
              const logo = toolForm.getFieldValue('logoUrl') as string | undefined
              const preview = resolveMediaUrl(logo)
              return (
                <Space align="center" style={{ marginBottom: 16 }} wrap>
                  <Avatar
                    shape="square"
                    size={48}
                    src={preview || undefined}
                    style={{ borderRadius: 10, background: 'rgba(46, 230, 166, 0.16)' }}
                  >
                    Logo
                  </Avatar>
                  {editingTool ? (
                    <Upload
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        void uploadAdminToolLogo(editingTool.id, file)
                          .then((res) => {
                            const url = res.data.data?.logoUrl
                            if (url) {
                              toolForm.setFieldValue('logoUrl', url)
                              setEditingTool({ ...editingTool, logoUrl: url })
                            }
                            message.success('Logo 已上传')
                            invalidateToolCatalogCache()
                          })
                          .catch((e) => message.error(apiErrorMessage(e, '上传失败')))
                        return false
                      }}
                    >
                      <Button icon={<UploadOutlined />}>上传 Logo</Button>
                    </Upload>
                  ) : (
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      新建时可先用官网图标；保存后再上传更高清图。
                    </Typography.Text>
                  )}
                  <Button
                    type="link"
                    onClick={() => {
                      const auto = faviconLogoFromWebsite(
                        String(toolForm.getFieldValue('websiteUrl') ?? ''),
                      )
                      if (!auto) {
                        message.warning('请先填写有效官网地址')
                        return
                      }
                      toolForm.setFieldValue('logoUrl', auto)
                    }}
                  >
                    用官网图标
                  </Button>
                </Space>
              )
            }}
          </Form.Item>
          <Form.Item name="affiliateUrl" label="联盟/跳转链接（可选）">
            <Input placeholder="可空" />
          </Form.Item>
          <Form.Item name="keywords" label="检索关键词">
            <Select mode="tags" placeholder="回车添加" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="回车添加" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="useCases" label="典型用法">
            <Select mode="tags" placeholder="回车添加一条" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="pros" label="优点">
            <Select mode="tags" placeholder="回车添加" tokenSeparators={[',']} />
          </Form.Item>
          <Form.Item name="cons" label="注意点">
            <Select mode="tags" placeholder="回车添加" tokenSeparators={[',']} />
          </Form.Item>
          <Space size="large" wrap>
            <Form.Item name="published" label="上架" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="featured" label="精选" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="weight" label="权重（越大越靠前）">
              <InputNumber min={0} max={9999} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      <Modal
        title={editingCat ? '编辑分类' : '新建分类'}
        open={catModalOpen}
        onCancel={() => setCatModalOpen(false)}
        onOk={() => void submitCategory()}
        confirmLoading={catSubmitting}
        destroyOnHidden
      >
        <Form form={catForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="AI对话" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="slug"
            rules={[{ required: true, message: '请输入 slug' }]}
          >
            <Input placeholder="ai-chat" disabled={Boolean(editingCat)} />
          </Form.Item>
          <Form.Item name="sortOrder" label="排序" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  )
}
