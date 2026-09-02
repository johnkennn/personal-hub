import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Col, Row, Typography, Button, Space, Statistic } from 'antd'
import {
  CrownOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'

import { StudioListPage } from './StudioListPage'
import {
  MOCK_ARTICLE_DRAFTS,
  MOCK_ARTICLE_PUBLISHED,
  MOCK_PROJECT_DRAFTS,
  MOCK_PROJECT_PUBLISHED,
} from '../../mocks/studioMock'
import { loadStudioStore } from '../../utils/studioStorage'
import { ROUTES } from '../../router/paths'
import { isLoggedIn } from '../../utils/authStorage'
import styles from '../../styles/ui.module.css'
import studioStyles from './Studio.module.css'

export function StudioHomePage() {
  const navigate = useNavigate()
  const store = loadStudioStore()

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [navigate])

  const counts = {
    articleDrafts: store.articleDrafts.length,
    articlePublished: store.articlePublished.length,
    projectDrafts: store.projectDrafts.length,
    projectPublished: store.projectPublished.length,
  }

  const entries = [
    {
      title: '文章 · 我的草稿',
      desc: '未发布内容，可继续编辑后发布。',
      to: ROUTES.STUDIO_ARTICLE_DRAFTS,
      icon: <FileTextOutlined />,
      count: counts.articleDrafts,
    },
    {
      title: '文章 · 我的发布',
      desc: '已公开：可下架回草稿，不可直接编辑。',
      to: ROUTES.STUDIO_ARTICLE_PUBLISHED,
      icon: <FileTextOutlined />,
      count: counts.articlePublished,
    },
    {
      title: '项目 · 我的草稿',
      desc: '未发布项目草稿。',
      to: ROUTES.STUDIO_PROJECT_DRAFTS,
      icon: <FolderOutlined />,
      count: counts.projectDrafts,
    },
    {
      title: '项目 · 我的发布',
      desc: '已公开项目作品集。',
      to: ROUTES.STUDIO_PROJECT_PUBLISHED,
      icon: <FolderOutlined />,
      count: counts.projectPublished,
    },
    {
      title: '我的资料',
      desc: '昵称、简介与头像设置。',
      to: ROUTES.STUDIO_PROFILE,
      icon: <UserOutlined />,
      count: null as number | null,
    },
    {
      title: '我的建议',
      desc: '对平台提想法，可提交多条。',
      to: ROUTES.STUDIO_SUGGESTIONS,
      icon: <MessageOutlined />,
      count: null as number | null,
    },
    {
      title: '内容治理',
      desc: '管理员：全站文章/项目发布与下架。',
      to: ROUTES.ADMIN,
      icon: <CrownOutlined />,
      count: null as number | null,
    },
  ]
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            创作台
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            写文章、建项目，在草稿箱打磨后再发布。已发布内容需下架后才能编辑。
          </Typography.Paragraph>
        </div>
        <Space wrap className={studioStyles.heroActions}>
          <Link to={ROUTES.STUDIO_ARTICLE_NEW}>
            <Button type="primary" size="large" icon={<EditOutlined />}>
              写文章
            </Button>
          </Link>
          <Link to={ROUTES.STUDIO_PROJECT_NEW}>
            <Button type="primary" size="large" icon={<FolderOutlined />}>
              建项目
            </Button>
          </Link>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} md={6}>
          <Card className={styles.studioCard} variant="borderless">
            <Statistic title="文章草稿" value={counts.articleDrafts} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className={styles.studioCard} variant="borderless">
            <Statistic title="已发文章" value={counts.articlePublished} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className={styles.studioCard} variant="borderless">
            <Statistic title="项目草稿" value={counts.projectDrafts} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className={styles.studioCard} variant="borderless">
            <Statistic title="已发项目" value={counts.projectPublished} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {entries.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.to}>
            <Link to={item.to} className={styles.cardLink}>
              <Card className={styles.studioCard} variant="borderless">
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
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
                  {item.count !== null ? (
                    <Typography.Text strong style={{ color: 'var(--ph-accent)', fontSize: 20 }}>
                      {item.count}
                    </Typography.Text>
                  ) : null}
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </motion.div>
  )
}

export function StudioArticleDraftsPage() {
  return (
    <StudioListPage
      title="文章 · 我的草稿"
      description="未发布文章可编辑、发布或删除。数据为演示假数据。"
      mode="draft"
      moduleLabel="文章"
      createPath={ROUTES.STUDIO_ARTICLE_NEW}
      createLabel="写文章"
      initialItems={MOCK_ARTICLE_DRAFTS}
      persistBucket="articleDrafts"
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
      title="文章 · 我的发布"
      description="已发布不可直接编辑；可下架回草稿后再改。"
      mode="published"
      moduleLabel="文章"
      createPath={ROUTES.STUDIO_ARTICLE_NEW}
      createLabel="写文章"
      initialItems={MOCK_ARTICLE_PUBLISHED}
      persistBucket="articlePublished"
      getTitle={(a) => a.title}
      getSubtitle={(a) => a.content}
      getUpdatedAt={(a) => a.updatedAt}
    />
  )
}

export function StudioProjectDraftsPage() {
  return (
    <StudioListPage
      title="项目 · 我的草稿"
      description="未发布项目草稿。数据为演示假数据。"
      mode="draft"
      moduleLabel="项目"
      createPath={ROUTES.STUDIO_PROJECT_NEW}
      createLabel="建项目"
      initialItems={MOCK_PROJECT_DRAFTS}
      persistBucket="projectDrafts"
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
      title="项目 · 我的发布"
      description="已发布项目：可下架或删除，不可直接编辑。"
      mode="published"
      moduleLabel="项目"
      createPath={ROUTES.STUDIO_PROJECT_NEW}
      createLabel="建项目"
      initialItems={MOCK_PROJECT_PUBLISHED}
      persistBucket="projectPublished"
      getTitle={(p) => p.name}
      getSubtitle={(p) => p.description}
      getUpdatedAt={(p) => p.updatedAt}
    />
  )
}
