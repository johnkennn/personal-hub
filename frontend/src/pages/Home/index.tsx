import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Empty, Row, Tag, Typography } from 'antd'
import { motion } from 'framer-motion'

import { ArticleReviewCard } from '../../components/ArticleReviewCard'
import { ToolLogo } from '../../components/ToolLogoChips'
import { PageHero, pageHeroStyles, SectionHead } from '../../components/PageHero'
import type { PublicArticle } from '../../mocks/publicDemo'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ROUTES, toolDetailPath } from '../../router/paths'
import { loadPublicArticles } from '../../services/publicContent'
import { loadFeaturedHubTools, loadHubTools } from '../../services/toolCatalog'
import type { HubTool } from '../../types/tool'
import ui from '../../styles/ui.module.css'

export function HomePage() {
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [hotTools, setHotTools] = useState<HubTool[]>([])
  const [toolsBySlug, setToolsBySlug] = useState<Record<string, HubTool>>({})

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
    loadHubTools().then((list) => {
      if (cancelled) return
      const map: Record<string, HubTool> = {}
      for (const t of list) map[t.slug] = t
      setToolsBySlug(map)
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
    <PageHero title="发现" tagline="热门 AI · 问问小智 · 真实评测">
      <motion.section
        className={pageHeroStyles.section}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <SectionHead
          label="热门 AI"
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
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <ToolLogo name={t.name} logoUrl={t.logoUrl} size={44} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Tag style={{ marginBottom: 8 }}>{t.category}</Tag>
                      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 6 }}>
                        {t.name}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {t.summary}
                      </Typography.Paragraph>
                    </div>
                  </div>
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
                  找小智聊聊
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
                <Tag style={{ marginBottom: 8 }}>优惠</Tag>
                <Typography.Title level={4} style={{ marginTop: 0 }}>
                  AI 优惠
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  各家 AI 的折扣活动，一站看清
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
              <Button type="link">更多测评</Button>
            </Link>
          }
        />

        {featuredReviews.length === 0 ? (
          <Empty description="暂无评测" />
        ) : (
          <Row gutter={[14, 14]}>
            {featuredReviews.map((item) => {
              const tools = (item.relatedToolSlugs ?? [])
                .map((slug) => toolsBySlug[slug])
                .filter(Boolean)
                .map((t) => ({ slug: t.slug, name: t.name, logoUrl: t.logoUrl }))
              return (
                <Col xs={24} sm={12} lg={6} key={item.id} style={{ display: 'flex' }}>
                  <ArticleReviewCard
                    showReviewTag
                    article={{
                      id: item.id,
                      title: item.title,
                      content: item.content,
                      authorId: item.authorId,
                      authorName: item.authorName,
                      avatarUrl: item.avatarUrl,
                      createdAt: item.createdAt,
                      likeCount: item.likeCount ?? 0,
                    }}
                    tools={tools}
                  />
                </Col>
              )
            })}
          </Row>
        )}
      </motion.section>
    </PageHero>
  )
}
