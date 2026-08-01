import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Pagination,
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
import { CoverStrip, coverToneFromId } from '../../components/CoverStrip'
import { getDemoCreator, type PublicArticle } from '../../mocks/publicDemo'
import { articleDetailPath, ROUTES } from '../../router/paths'
import { loadPublicArticles } from '../../services/publicContent'
import { isLoggedIn } from '../../utils/authStorage'
import { excerpt, formatDateTime } from '../../utils/format'
import { getLikeCount } from '../../utils/socialStorage'
import styles from '../../styles/ui.module.css'

const PAGE_SIZE = 6

export function BlogPage() {
  const { message } = App.useApp()
  const [articles, setArticles] = useState<PublicArticle[]>([])
  const [fromDemo, setFromDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<'latest' | 'hot'>('latest')

  useEffect(() => {
    loadPublicArticles()
      .then((res) => {
        setArticles(res.items)
        setFromDemo(res.fromDemo)
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
    const start = (page - 1) * PAGE_SIZE
    return sorted.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            文章
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            已发布创作。支持最新 / 最热排序；点作者进入主页。
          </Typography.Paragraph>
        </div>
        <Space wrap>
          <Segmented
            value={sort}
            onChange={(v) => {
              setSort(v as 'latest' | 'hot')
              setPage(1)
            }}
            options={[
              { label: '最新', value: 'latest' },
              { label: (
                <span>
                  <FireOutlined /> 最热
                </span>
              ), value: 'hot' },
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
      </div>

      {fromDemo ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="当前展示演示文章"
          description="点赞会影响「最热」排序；后端接入后自动切换真数据。"
        />
      ) : null}

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : articles.length === 0 ? (
        <Empty description="暂无已发布文章" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {pageItems.map((article) => (
              <Col xs={24} md={12} lg={8} key={article.id}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Link to={articleDetailPath(article.id)} className={styles.cardLink}>
                    <Card className={styles.contentCard} variant="borderless" styles={{ body: { paddingTop: 16 } }}>
                      <CoverStrip
                        title={article.title}
                        tone={article.coverTone ?? coverToneFromId(article.id)}
                      />
                      <Typography.Title level={4} style={{ marginTop: 0 }}>
                        {article.title}
                      </Typography.Title>
                      <Typography.Paragraph type="secondary">
                        {excerpt(article.content)}
                      </Typography.Paragraph>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <AuthorChip
                          authorId={article.authorId || undefined}
                          authorName={article.authorName}
                          avatarUrl={getDemoCreator(article.authorId)?.avatarUrl}
                        />
                        <Typography.Text type="secondary" className={styles.muted}>
                          {sort === 'hot'
                            ? `${getLikeCount('article', article.id)} 赞`
                            : formatDateTime(article.createdAt)}
                        </Typography.Text>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={sorted.length}
              onChange={setPage}
              showTotal={(total) => `共 ${total} 条`}
              hideOnSinglePage={false}
            />
          </div>
        </>
      )}
    </motion.div>
  )
}
