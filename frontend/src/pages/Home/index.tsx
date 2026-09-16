import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Row, Tag, Typography } from 'antd'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { PageHero, pageHeroStyles, SectionHead } from '../../components/PageHero'
import type { PublicArticle } from '../../mocks/publicDemo'
import { usePageMeta } from '../../hooks/usePageMeta'
import {
  articleDetailPath,
  ROUTES,
  toolDetailPath,
} from '../../router/paths'
import { loadPublicArticles } from '../../services/publicContent'
import { loadFeaturedHubTools } from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import { excerpt, formatDateTime } from '../../utils/format'
import ui from '../../styles/ui.module.css'

export function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [hotTools, setHotTools] = useState<HubTool[]>([])

  usePageMeta({
    title: '发现',
    description: '热门 AI 产品与精选评测。',
  })

  useEffect(() => {
    let cancelled = false
    loadPublicArticles()
      .then((data) => {
        if (!cancelled) setArticles(data.items)
      })
      .catch(() => {
        if (!cancelled) setArticles([])
      })
    loadFeaturedHubTools(4).then((list) => {
      if (!cancelled) setHotTools(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const featuredReviews = useMemo(
    () =>
      [...articles]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 4),
    [articles],
  )

  return (
    <PageHero title="发现" tagline="热门产品 · 小智助手 · 精选评测">
      <motion.section
        className={pageHeroStyles.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <SectionHead
          label="热门产品"
          action={
            <Link to={ROUTES.TOOLS}>
              <Button type="link">AI导览</Button>
            </Link>
          }
        />
        <Row gutter={[14, 14]}>
          {hotTools.map((t) => (
            <Col key={t.slug} xs={24} sm={12} lg={6}>
              <Link to={toolDetailPath(t.slug)} className={ui.cardLink}>
                <Card className={ui.contentCard} variant="borderless" hoverable>
                  <Tag style={{ marginBottom: 8 }}>{t.category}</Tag>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>
                    {t.name}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {t.summary}
                  </Typography.Paragraph>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </motion.section>

      <motion.section
        className={pageHeroStyles.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <SectionHead
          label="快捷入口"
          action={
            <Link to={ROUTES.CHAT}>
              <Button type="link">打开小智</Button>
            </Link>
          }
        />
        <Row gutter={[14, 14]}>
          <Col xs={24} sm={12} lg={8}>
            <Link to={ROUTES.CHAT} className={ui.cardLink}>
              <Card className={ui.contentCard} variant="borderless" hoverable>
                <Tag style={{ marginBottom: 8 }}>小智</Tag>
                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  大模型助手
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  问答、文案、翻译、总结，一句话吩咐小智
                </Typography.Paragraph>
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Link to={ROUTES.DEALS} className={ui.cardLink}>
              <Card className={ui.contentCard} variant="borderless" hoverable>
                <Tag style={{ marginBottom: 8 }}>限时</Tag>
                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  限时优惠
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  折扣与活动一站看
                </Typography.Paragraph>
              </Card>
            </Link>
          </Col>
        </Row>
      </motion.section>

      <motion.section
        className={pageHeroStyles.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <SectionHead
          label="精选评测"
          action={
            <Link to={ROUTES.ARTICLES}>
              <Button type="link">更多</Button>
            </Link>
          }
        />

        {featuredReviews.length === 0 ? (
          <Empty description="暂无评测" />
        ) : (
          <Row gutter={[14, 14]}>
            {featuredReviews.map((item) => (
              <Col xs={24} sm={12} lg={6} key={item.id} style={{ display: 'flex' }}>
                <motion.div
                  className={ui.catalogCardMotion}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${ui.cardLink} ${ui.catalogCardShell}`}>
                    <Link
                      to={articleDetailPath(item.id)}
                      className={ui.catalogCardHit}
                      aria-label={item.title}
                    />
                    <Card className={`${ui.contentCard} ${ui.catalogCard}`} variant="borderless">
                      <CoverStrip
                        title={item.title}
                        tone={item.coverTone ?? coverToneFromId(item.id)}
                        coverUrl={item.coverUrl}
                        compact
                      />
                      <Tag style={{ marginBottom: 8, width: 'fit-content' }}>评测</Tag>
                      <Typography.Title level={5} className={ui.catalogCardTitle}>
                        {item.title}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className={ui.catalogCardExcerpt}>
                        {excerpt(item.content, 72)}
                      </Typography.Paragraph>
                      <div className={`${ui.catalogCardMeta} ${ui.catalogCardMetaInteractive}`}>
                        <AuthorChip
                          authorId={item.authorId || undefined}
                          authorName={item.authorName}
                          avatarUrl={item.avatarUrl}
                          size={22}
                        />
                        <Typography.Text type="secondary" className={ui.muted}>
                          {formatDateTime(item.createdAt)}
                        </Typography.Text>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </motion.section>
    </PageHero>
  )
}
