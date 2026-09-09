import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Spin, Typography } from 'antd'
import {
  CrownOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FolderOutlined,
  MessageOutlined,
  RightOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { fetchAdminStats, type AdminStats } from '../../api/adminStats'
import { BackNavButton } from '../../components/BackNavButton'
import { ROUTES } from '../../router/paths'
import { isAdmin, isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import ui from '../../styles/ui.module.css'
import styles from './Admin.module.css'

type AdminModule = {
  title: string
  desc: string
  to: string
  icon: ReactNode
  metrics: { label: string; value: number | undefined }[]
}

/**
 * 治理后台入口：指标与模块说明合在同一组卡片里，点击进入对应管理页。
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
        <Typography.Title level={2} className={ui.pageTitle}>
          治理后台
        </Typography.Title>
        <Alert
          type="warning"
          showIcon
          icon={<CrownOutlined />}
          style={{ marginBottom: 16 }}
          message="当前账号不是管理员"
          description="请使用管理员账号登录（例如本地引导账号 admin）。"
        />
        <Link to={ROUTES.LOGIN}>
          <Button type="primary">去登录</Button>
        </Link>
      </motion.div>
    )
  }

  const modules: AdminModule[] = [
    {
      title: '用户管理',
      desc: '查看用户列表，启用 / 禁用普通账号。',
      to: ROUTES.ADMIN_USERS,
      icon: <TeamOutlined />,
      metrics: [
        { label: '用户总数', value: stats?.userTotal },
        { label: '已禁用', value: stats?.userDisabled },
      ],
    },
    {
      title: '文章管理',
      desc: '查看已发布文章，强制下架。',
      to: ROUTES.ADMIN_ARTICLES,
      icon: <FileTextOutlined />,
      metrics: [{ label: '已发文章', value: stats?.articlePublished }],
    },
    {
      title: '项目管理',
      desc: '查看已发布项目，强制下架。',
      to: ROUTES.ADMIN_PROJECTS,
      icon: <FolderOutlined />,
      metrics: [{ label: '已发项目', value: stats?.projectPublished }],
    },
    {
      title: '已删文章',
      desc: '作者误删后的恢复入口；也可立即彻底清除。',
      to: ROUTES.ADMIN_ARTICLES_DELETED,
      icon: <DeleteOutlined />,
      metrics: [{ label: '待清除', value: stats?.articleDeleted }],
    },
    {
      title: '已删项目',
      desc: '作者误删后的恢复入口；也可立即彻底清除。',
      to: ROUTES.ADMIN_PROJECTS_DELETED,
      icon: <DeleteOutlined />,
      metrics: [{ label: '待清除', value: stats?.projectDeleted }],
    },
    {
      title: '建议箱',
      desc: '查看用户反馈，删除无效建议。',
      to: ROUTES.ADMIN_SUGGESTIONS,
      icon: <MessageOutlined />,
      metrics: [{ label: '建议条数', value: stats?.suggestionTotal }],
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={ui.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.STUDIO} className={ui.pageBack} />
          <Typography.Title level={2} className={ui.pageTitle}>
            治理后台
          </Typography.Title>
          <Typography.Paragraph className={ui.pageDesc}>
            运营概览与管理入口。点击卡片进入对应模块。
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
        <div className={styles.grid}>
          {modules.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Link
                to={item.to}
                className={styles.card}
                style={{ ['--metric-cols' as string]: item.metrics.length }}
              >
                <div className={styles.head}>
                  <div className={styles.headMain}>
                    <span className={styles.icon}>{item.icon}</span>
                    <Typography.Title level={5} className={styles.title}>
                      {item.title}
                    </Typography.Title>
                  </div>
                  <RightOutlined className={styles.chevron} aria-hidden />
                </div>
                <p className={styles.desc}>{item.desc}</p>
                <div className={styles.metrics}>
                  {item.metrics.map((m) => (
                    <div key={m.label} className={styles.metric}>
                      <span className={styles.metricValue}>{m.value ?? '—'}</span>
                      <span className={styles.metricLabel}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Spin>
    </motion.div>
  )
}
