import { Card, Space, Tag, Typography } from 'antd'
import { LikeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { AuthorChip } from './AuthorChip'
import { ToolLogoChips, type ToolLogoItem } from './ToolLogoChips'
import { articleDetailPath } from '../router/paths'
import { excerpt, formatDateTime } from '../utils/format'
import styles from '../styles/ui.module.css'

export type ArticleReviewCardItem = {
  id: number
  title: string
  content?: string
  excerpt?: string
  authorId?: number
  authorName: string
  avatarUrl?: string
  createdAt: string
  likeCount?: number
}

type ArticleReviewCardProps = {
  article: ArticleReviewCardItem
  tools?: ToolLogoItem[]
  /** 详情链接；默认文章详情 */
  to?: string
  showReviewTag?: boolean
  className?: string
}

/** 评测列表卡：无封面；关联工具 Logo + 作者 + 赞数与时间同显 */
export function ArticleReviewCard({
  article,
  tools = [],
  to,
  showReviewTag = false,
  className,
}: ArticleReviewCardProps) {
  const href = to ?? articleDetailPath(article.id)
  const body = article.excerpt ?? excerpt(article.content ?? '', 72)
  const likes = article.likeCount ?? 0

  return (
    <motion.div
      className={[styles.catalogCardMotion, className].filter(Boolean).join(' ')}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`${styles.cardLink} ${styles.catalogCardShell}`}>
        <Link to={href} className={styles.catalogCardHit} aria-label={article.title} />
        <Card className={`${styles.contentCard} ${styles.catalogCard}`} variant="borderless">
          {tools.length > 0 ? (
            <div className={styles.catalogCardLogos}>
              <ToolLogoChips tools={tools} size={32} />
            </div>
          ) : null}
          {showReviewTag ? (
            <Tag style={{ marginBottom: 8, width: 'fit-content' }}>评测</Tag>
          ) : null}
          <Typography.Title level={5} className={styles.catalogCardTitle}>
            {article.title}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className={styles.catalogCardExcerpt}>
            {body}
          </Typography.Paragraph>
          <div className={`${styles.catalogCardMeta} ${styles.catalogCardMetaInteractive}`}>
            <AuthorChip
              authorId={article.authorId || undefined}
              authorName={article.authorName}
              avatarUrl={article.avatarUrl}
              size={22}
            />
            <Space size={10} className={styles.catalogCardStats} wrap={false}>
              <Typography.Text type="secondary" className={styles.muted}>
                <LikeOutlined style={{ marginRight: 4 }} />
                {likes}
              </Typography.Text>
              <Typography.Text type="secondary" className={styles.muted}>
                {formatDateTime(article.createdAt)}
              </Typography.Text>
            </Space>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
