import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Segmented,
  Skeleton,
  Space,
  Typography,
  App,
} from 'antd'
import { FireOutlined, PlusOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { AuthorChip } from '../../components/AuthorChip'
import {
  applyCatalogPageChange,
  CatalogListLayout,
  CatalogPager,
} from '../../components/CatalogPager'
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { PageHero } from '../../components/PageHero'
import type { PublicArticle } from '../../mocks/publicDemo'
import { CATALOG_PAGE_SIZE } from '../../constants/catalog'
import { usePageMeta } from '../../hooks/usePageMeta'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { loadPublicArticles } from '../../services/publicContent'
import { isLoggedIn } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import { getLikeCount } from '../../utils/socialStorage'
import styles from '../../styles/ui.module.css'

export function ArticlesPage() {
  const { message } = App.useApp()
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(CATALOG_PAGE_SIZE)
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')

  usePageMeta({
    title: 'AI评测',
    description: '体验与对比，帮你判断适不适合。',
  })

  useEffect(() => {
    loadPublicArticles()
      .then((res) => {
        setArticles(res.items)
      })
      .catch(() => message.error('文章列表加载失败'))
      .finally(() => setLoading(false))
  }, [message])

  const sorted = useMemo(() => {
    const list = [...articles]
    if (sort === 'hot') {
      list.sort((a, b) => getLikeCount('article', b.id) - getLikeCount('article', a.id))
    } else {
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
    return list
  }, [articles, sort])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  return (
    <PageHero
      title="AI评测"
      tagline="真实体验，帮你判断值不值得用"
      extra={
        <Space wrap>
          <Segmented
            value={sort}
            onChange={(v) => {
              setSort(v as 'latest' | 'hot')
              setPage(1)
            }}
            options={[
              { label: '最新', value: 'latest' },
              {
                label: (
                  <span>
                    <FireOutlined /> 最热
                  </span>
                ),
                value: 'hot',
              },
            ]}
          />
          {isLoggedIn() ? (
            <Link to={ROUTES.STUDIO_ARTICLE_NEW}>
              <Button type="primary" icon={<PlusOutlined />}>
                写文章
              </Button>
            </Link>
          ) : null}
        </Space>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : articles.length === 0 ? (
        <Empty description="暂无已发布文章" />
      ) : (
        <CatalogListLayout
          pageSize={pageSize}
          pager={
            <CatalogPager
              current={page}
              pageSize={pageSize}
              total={sorted.length}
              onChange={(p, ps) => applyCatalogPageChange(setPage, setPageSize, pageSize, p, ps)}
            />
          }
        >
          <Row gutter={[14, 14]}>
            {pageItems.map((article) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={article.id} style={{ display: 'flex' }}>
                <motion.div
                  className={styles.catalogCardMotion}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${styles.cardLink} ${styles.catalogCardShell}`}>
                    <Link
                      to={articleDetailPath(article.id)}
                      className={styles.catalogCardHit}
                      aria-label={article.title}
                    />
                    <Card
                      className={`${styles.contentCard} ${styles.catalogCard}`}
                      variant="borderless"
                    >
                      <CoverStrip
                        title={article.title}
                        tone={article.coverTone ?? coverToneFromId(article.id)}
                        coverUrl={article.coverUrl}
                        compact
                      />
                      <Typography.Title level={5} className={styles.catalogCardTitle}>
                        {article.title}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary" className={styles.catalogCardExcerpt}>
                        {excerpt(article.content, 72)}
                      </Typography.Paragraph>
                      <div className={`${styles.catalogCardMeta} ${styles.catalogCardMetaInteractive}`}>
                        <AuthorChip
                          authorId={article.authorId || undefined}
                          authorName={article.authorName}
                          avatarUrl={article.avatarUrl}
                          size={22}
                        />
                        <Typography.Text type="secondary" className={styles.muted}>
                          {sort === 'hot'
                            ? `${getLikeCount('article', article.id)} 赞`
                            : formatDateTime(article.createdAt)}
                        </Typography.Text>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </CatalogListLayout>
      )}
    </PageHero>
  )
}
