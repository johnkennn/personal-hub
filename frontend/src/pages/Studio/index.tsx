import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Col, Row, Typography, Button, Space, Spin } from 'antd'
import {
  CrownOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  LockOutlined,
  MessageOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { StudioListPage } from './StudioListPage'
import { BackNavButton } from '../../components/BackNavButton'
import { fetchMyProfile } from '../../api/profile'
import {
  batchDeleteMyArticles,
  batchPublishMyArticles,
  batchUnpublishMyArticles,
  fetchMyArticleDrafts,
  fetchMyArticlePublished,
} from '../../api/article'
import {
  batchDeleteMyProjects,
  batchPublishMyProjects,
  batchUnpublishMyProjects,
  fetchMyProjectDrafts,
  fetchMyProjectPublished,
} from '../../api/project'
import { ROUTES, userFollowersPath, userFollowingPath } from '../../router/paths'
import { getUserId, isAdmin, isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'
import studioStyles from './Studio.module.css'

type StudioCounts = {
  articleDrafts: number
  articlePublished: number
  projectDrafts: number
  projectPublished: number
  following: number
  followers: number
}

const emptyCounts: StudioCounts = {
  articleDrafts: 0,
  articlePublished: 0,
  projectDrafts: 0,
  projectPublished: 0,
  following: 0,
  followers: 0,
}

type Entry = {
  title: string
  desc: string
  to: string
  icon: ReactNode
  count?: number | null
}

function EntryCard({ item }: { item: Entry }) {
  return (
    <Link to={item.to} className={styles.cardLink}>
      <Card className={styles.studioCard} variant="borderless">
        <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space align="start">
            <Typography.Text style={{ fontSize: 20, color: 'var(--ph-accent)' }}>
              {item.icon}
            </Typography.Text>
            <div>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {item.title}
              </Typography.Title>
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                {item.desc}
              </Typography.Paragraph>
            </div>
          </Space>
          {item.count != null ? (
            <Typography.Text strong style={{ color: 'var(--ph-accent)', fontSize: 18 }}>
              {item.count}
            </Typography.Text>
          ) : null}
        </Space>
      </Card>
    </Link>
  )
}

function StudioSection({
  title,
  desc,
  actions,
  children,
}: {
  title: string
  desc: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className={studioStyles.section}>
      <div className={studioStyles.sectionHead}>
        <div>
          <Typography.Title level={4} className={studioStyles.sectionTitle}>
            {title}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className={studioStyles.sectionDesc}>
            {desc}
          </Typography.Paragraph>
        </div>
        {actions ? <div className={studioStyles.sectionActions}>{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

/**
 * 个人中心 · 两级信息架构
 * 一级：作品 / 账号 / 治理
 * 二级：各分类下的具体入口
 */
export function StudioHomePage() {
  const navigate = useNavigate()
  const meId = getUserId()
  const [admin, setAdmin] = useState(isAdmin)
  const [counts, setCounts] = useState<StudioCounts>(emptyCounts)
  const [loadingCounts, setLoadingCounts] = useState(true)

  useEffect(() => {
    return subscribeAuthChange(() => setAdmin(isAdmin()))
  }, [])

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    let cancelled = false
    setLoadingCounts(true)
    Promise.all([
      fetchMyArticleDrafts(),
      fetchMyArticlePublished(),
      fetchMyProjectDrafts(),
      fetchMyProjectPublished(),
      fetchMyProfile(),
    ])
      .then(([ad, ap, pd, pp, profileRes]) => {
        if (cancelled) return
        const profile = profileRes.data.data
        setCounts({
          articleDrafts: ad.data.data.length,
          articlePublished: ap.data.data.length,
          projectDrafts: pd.data.data.length,
          projectPublished: pp.data.data.length,
          following: profile.followingCount ?? 0,
          followers: profile.followerCount ?? 0,
        })
      })
      .catch(() => {
        if (!cancelled) setCounts(emptyCounts)
      })
      .finally(() => {
        if (!cancelled) setLoadingCounts(false)
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  const workEntries: Entry[] = [
    {
      title: '文章草稿',
      desc: '未发布，可编辑后发布',
      to: ROUTES.STUDIO_ARTICLE_DRAFTS,
      icon: <FileTextOutlined />,
      count: counts.articleDrafts,
    },
    {
      title: '文章已发布',
      desc: '下架后才能再编辑',
      to: ROUTES.STUDIO_ARTICLE_PUBLISHED,
      icon: <FileTextOutlined />,
      count: counts.articlePublished,
    },
    {
      title: '项目草稿',
      desc: '未发布的项目',
      to: ROUTES.STUDIO_PROJECT_DRAFTS,
      icon: <FolderOutlined />,
      count: counts.projectDrafts,
    },
    {
      title: '项目已发布',
      desc: '公开作品集',
      to: ROUTES.STUDIO_PROJECT_PUBLISHED,
      icon: <FolderOutlined />,
      count: counts.projectPublished,
    },
  ]

  const accountEntries: Entry[] = [
    {
      title: '资料',
      desc: '昵称、邮箱、手机与头像',
      to: ROUTES.STUDIO_PROFILE,
      icon: <UserOutlined />,
    },
    {
      title: '修改密码',
      desc: '验证旧密码后更换',
      to: ROUTES.STUDIO_PASSWORD,
      icon: <LockOutlined />,
    },
    {
      title: '关注',
      desc: '你关注的创作者',
      to: meId != null ? userFollowingPath(meId) : ROUTES.LOGIN,
      icon: <TeamOutlined />,
      count: counts.following,
    },
    {
      title: '粉丝',
      desc: '关注你的人',
      to: meId != null ? userFollowersPath(meId) : ROUTES.LOGIN,
      icon: <TeamOutlined />,
      count: counts.followers,
    },
    {
      title: '建议',
      desc: '向平台提交想法',
      to: ROUTES.STUDIO_SUGGESTIONS,
      icon: <MessageOutlined />,
    },
  ]

  const adminEntries: Entry[] = [
    {
      title: '内容治理',
      desc: '用户、下架与建议箱',
      to: ROUTES.ADMIN,
      icon: <CrownOutlined />,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <BackNavButton fallback={ROUTES.HOME} className={styles.pageBack} />
          <Typography.Title level={2} className={styles.pageTitle}>
            个人中心
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            管理作品、账号与社交；已发布内容需下架后才能编辑。
          </Typography.Paragraph>
        </div>
      </div>

      <Spin spinning={loadingCounts}>
        <StudioSection
          title="作品"
          desc="文章与项目的草稿、已发布内容"
          actions={
            <Space wrap className={studioStyles.heroActions}>
              <Link to={ROUTES.STUDIO_ARTICLE_NEW}>
                <Button type="primary" icon={<EditOutlined />}>
                  写文章
                </Button>
              </Link>
              <Link to={ROUTES.STUDIO_PROJECT_NEW}>
                <Button type="primary" icon={<FolderOutlined />}>
                  建项目
                </Button>
              </Link>
            </Space>
          }
        >
          <Row gutter={[14, 14]}>
            {workEntries.map((item) => (
              <Col xs={24} sm={12} lg={6} key={item.to}>
                <EntryCard item={item} />
              </Col>
            ))}
          </Row>
        </StudioSection>

        <StudioSection title="账号" desc="个人资料、关注关系与反馈">
          <Row gutter={[14, 14]}>
            {accountEntries.map((item) => (
              <Col xs={24} sm={12} lg={6} key={item.to}>
                <EntryCard item={item} />
              </Col>
            ))}
          </Row>
        </StudioSection>

        {admin ? (
          <StudioSection title="治理" desc="管理员运营入口">
            <Row gutter={[14, 14]}>
              {adminEntries.map((item) => (
                <Col xs={24} sm={12} lg={6} key={item.to}>
                  <EntryCard item={item} />
                </Col>
              ))}
            </Row>
          </StudioSection>
        ) : null}
      </Spin>
    </motion.div>
  )
}

export function StudioArticleDraftsPage() {
  return (
    <StudioListPage
      title="文章草稿"
      description="作品 · 未发布文章可编辑、发布或删除。"
      mode="draft"
      moduleLabel="文章"
      createPath={ROUTES.STUDIO_ARTICLE_NEW}
      createLabel="写文章"
      loadItems={async () => (await fetchMyArticleDrafts()).data.data}
      onPublish={async (ids) => {
        await batchPublishMyArticles(ids)
      }}
      onDelete={async (ids) => {
        await batchDeleteMyArticles(ids)
      }}
      getTitle={(a) => a.title}
      getSubtitle={(a) => a.content}
      getUpdatedAt={(a) => a.updatedAt}
      editPath={(id) => `/studio/articles/${id}/edit`}
    />
  )
}

export function StudioArticlePublishedPage() {
  return (
    <StudioListPage
      title="文章已发布"
      description="作品 · 已发布不可直接编辑；可下架回草稿后再改。"
      mode="published"
      moduleLabel="文章"
      createPath={ROUTES.STUDIO_ARTICLE_NEW}
      createLabel="写文章"
      loadItems={async () => (await fetchMyArticlePublished()).data.data}
      onUnpublish={async (ids) => {
        await batchUnpublishMyArticles(ids)
      }}
      onDelete={async (ids) => {
        await batchDeleteMyArticles(ids)
      }}
      getTitle={(a) => a.title}
      getSubtitle={(a) => a.content}
      getUpdatedAt={(a) => a.updatedAt}
    />
  )
}

export function StudioProjectDraftsPage() {
  return (
    <StudioListPage
      title="项目草稿"
      description="作品 · 未发布项目草稿。"
      mode="draft"
      moduleLabel="项目"
      createPath={ROUTES.STUDIO_PROJECT_NEW}
      createLabel="建项目"
      loadItems={async () => (await fetchMyProjectDrafts()).data.data}
      onPublish={async (ids) => {
        await batchPublishMyProjects(ids)
      }}
      onDelete={async (ids) => {
        await batchDeleteMyProjects(ids)
      }}
      getTitle={(p) => p.name}
      getSubtitle={(p) => p.description}
      getUpdatedAt={(p) => p.updatedAt}
      editPath={(id) => `/studio/projects/${id}/edit`}
    />
  )
}

export function StudioProjectPublishedPage() {
  return (
    <StudioListPage
      title="项目已发布"
      description="作品 · 已发布项目：可下架或删除，不可直接编辑。"
      mode="published"
      moduleLabel="项目"
      createPath={ROUTES.STUDIO_PROJECT_NEW}
      createLabel="建项目"
      loadItems={async () => (await fetchMyProjectPublished()).data.data}
      onUnpublish={async (ids) => {
        await batchUnpublishMyProjects(ids)
      }}
      onDelete={async (ids) => {
        await batchDeleteMyProjects(ids)
      }}
      getTitle={(p) => p.name}
      getSubtitle={(p) => p.description}
      getUpdatedAt={(p) => p.updatedAt}
    />
  )
}
