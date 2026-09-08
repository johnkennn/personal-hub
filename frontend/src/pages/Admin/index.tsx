import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Col, Row, Space, Spin, Statistic, Typography } from 'antd'
import {
  CrownOutlined,
  FileTextOutlined,
  FolderOutlined,
  MessageOutlined,
  TeamOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { fetchAdminStats, type AdminStats } from '../../api/adminStats'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES } from '../../router/paths'
import { isAdmin, isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'

/**
 * 治理后台入口
 *
 * 数据流：
 *   JWT role=ADMIN（localStorage，仅门禁）
 *     → GET /api/admin/stats（真权限在后端 requireAdmin）
 *     → 顶部仪表数字
 *     → 下方入口卡片跳转子治理页
 */
export function AdminHomePage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(isAdmin)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const res = await fetchAdminStats()
      setStats(res.data.data)
    } catch (err: unknown) {
      setStats(null)
      const status = (err as { response?: { status?: number; data?: { code?: number } } })?.response
        ?.status
      const code = (err as { response?: { data?: { code?: number } } })?.response?.data?.code
      if (status === 401 || code === 401) {
        setStatsError('登录已失效，请重新登录后再查看仪表')
      } else {
        setStatsError('概览加载失败，请确认已登录管理员账号且服务可用')
      }
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }
    return subscribeAuthChange(() => setAdmin(isAdmin()))
  }, [navigate])

  useEffect(() => {
    if (!admin) return
    void loadStats()
  }, [admin, loadStats])

  if (!admin) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Typography.Title level={2} className={styles.pageTitle}>
          治理后台
        </Typography.Title>
        <Alert
          type="warning"
          showIcon
          icon={<CrownOutlined />}
          style={{ marginBottom: 16 }}
          message="当前账号不是管理员"
          description="请使用 role=ADMIN 的账号登录（例如本地引导账号 admin）。不再支持前端演示切角色。"
        />
        <Link to={ROUTES.LOGIN}>
          <Button type="primary">去登录</Button>
        </Link>
      </motion.div>
    )
  }

  const metricCards = [
    {
      title: '用户总数',
      value: stats?.userTotal,
      icon: <TeamOutlined />,
      to: ROUTES.ADMIN_USERS,
    },
    {
      title: '已禁用',
      value: stats?.userDisabled,
      icon: <UserDeleteOutlined />,
      to: ROUTES.ADMIN_USERS,
    },
    {
      title: '已发文章',
      value: stats?.articlePublished,
      icon: <FileTextOutlined />,
      to: ROUTES.ADMIN_ARTICLES,
    },
    {
      title: '已发项目',
      value: stats?.projectPublished,
      icon: <FolderOutlined />,
      to: ROUTES.ADMIN_PROJECTS,
    },
    {
      title: '建议条数',
      value: stats?.suggestionTotal,
      icon: <MessageOutlined />,
      to: ROUTES.ADMIN_SUGGESTIONS,
    },
  ]

  const entries = [
    {
      title: '用户管理',
      desc: '查看用户列表，启用 / 禁用普通账号。',
      to: ROUTES.ADMIN_USERS,
      icon: <TeamOutlined />,
    },
    {
      title: '文章管理',
      desc: '查看已发布文章，强制下架。',
      to: ROUTES.ADMIN_ARTICLES,
      icon: <FileTextOutlined />,
    },
    {
      title: '项目管理',
      desc: '查看已发布项目，强制下架。',
      to: ROUTES.ADMIN_PROJECTS,
      icon: <FolderOutlined />,
    },
    {
      title: '建议箱',
      desc: '查看用户反馈，删除无效建议。',
      to: ROUTES.ADMIN_SUGGESTIONS,
      icon: <MessageOutlined />,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.STUDIO} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            治理后台
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            运营总览与治理入口。点击下方卡片进入对应用户、内容或建议管理。
          </Typography.Paragraph>
        </div>
        <Button onClick={() => void loadStats()} loading={statsLoading}>
          刷新概览
        </Button>
      </div>

      {statsError ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="仪表数据加载失败"
          description={statsError}
          action={
            <Button size="small" onClick={() => void loadStats()}>
              重试
            </Button>
          }
        />
      ) : null}

      <Spin spinning={statsLoading}>
        <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
          {metricCards.map((m) => (
            <Col xs={12} sm={8} lg={4} xl={4} key={m.title} style={{ flex: '1 1 160px', maxWidth: '100%' }}>
              <Link to={m.to} className={styles.cardLink}>
                <Card className={styles.studioCard} variant="borderless">
                  <Space align="center" size={10} style={{ marginBottom: 8 }}>
                    <Typography.Text style={{ fontSize: 18, color: 'var(--ph-accent)' }}>
                      {m.icon}
                    </Typography.Text>
                    <Typography.Text type="secondary">{m.title}</Typography.Text>
                  </Space>
                  <Statistic value={m.value ?? '—'} valueStyle={{ color: 'var(--ph-text)' }} />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Spin>

      <Typography.Title level={4} style={{ marginBottom: 12 }}>
        治理入口
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {entries.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.to}>
            <Link to={item.to} className={styles.cardLink}>
              <Card className={styles.studioCard} variant="borderless">
                <Space align="start">
                  <Typography.Text style={{ fontSize: 22, color: 'var(--ph-accent)' }}>
                    {item.icon}
                  </Typography.Text>
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {item.title}
                    </Typography.Title>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {item.desc}
                    </Typography.Paragraph>
                  </div>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </motion.div>
  )
}
