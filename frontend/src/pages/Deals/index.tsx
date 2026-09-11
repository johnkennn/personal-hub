import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Empty, Skeleton, Tag, Typography } from 'antd'
import { GiftOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { PageHero } from '../../components/PageHero'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ROUTES, toolDetailPath } from '../../router/paths'
import { loadActiveDeals } from '../../services/dealCatalog'
import type { DealDto } from '../../types/deal'
import { formatDateTime } from '../../utils/format'
import styles from './Deals.module.css'

export function DealsPage() {
  const [items, setItems] = useState<DealDto[]>([])
  const [loading, setLoading] = useState(true)

  usePageMeta({
    title: '限时优惠',
    description: '折扣与活动一站看。',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadActiveDeals()
      .then(({ items: list }) => {
        if (cancelled) return
        setItems(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageHero title="限时优惠" tagline="折扣与活动，一站看清">
      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : items.length === 0 ? (
        <Empty description="暂无进行中的优惠" />
      ) : (
        <div className={styles.list}>
          {items.map((d, i) => (
            <motion.article
              key={d.id}
              className={styles.card}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <div className={styles.cardTop}>
                <GiftOutlined className={styles.icon} />
                <div className={styles.meta}>
                  <Typography.Title level={4} className={styles.title}>
                    {d.title}
                  </Typography.Title>
                  {d.toolName ? (
                    <Tag color="cyan">
                      {d.toolSlug ? (
                        <Link to={toolDetailPath(d.toolSlug)}>{d.toolName}</Link>
                      ) : (
                        d.toolName
                      )}
                    </Tag>
                  ) : null}
                </div>
              </div>
              <Typography.Paragraph type="secondary" className={styles.desc}>
                {d.description}
              </Typography.Paragraph>
              {d.promoCode ? (
                <p className={styles.code}>
                  优惠码：<code>{d.promoCode}</code>
                </p>
              ) : null}
              <p className={styles.window}>
                {formatDateTime(d.startsAt)} — {formatDateTime(d.endsAt)}
              </p>
              <div className={styles.actions}>
                <Button type="primary" href={d.url} target="_blank" rel="noreferrer">
                  查看活动
                </Button>
                {d.toolSlug ? (
                  <Link to={toolDetailPath(d.toolSlug)}>
                    <Button type="default">产品详情</Button>
                  </Link>
                ) : (
                  <Link to={ROUTES.TOOLS}>
                    <Button type="default">去 AI导览</Button>
                  </Link>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </PageHero>
  )
}
