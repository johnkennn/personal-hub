import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Empty, Skeleton, Tag } from 'antd'
import { GiftOutlined, LinkOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { PageHero } from '../../components/PageHero'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ROUTES, toolDetailPath } from '../../router/paths'
import { loadActiveDeals } from '../../services/dealCatalog'
import type { DealDto } from '../../types/deal'
import { isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { formatDateTime } from '../../utils/format'
import { loginPathWithReturn } from '../../utils/requireLogin'
import styles from './Deals.module.css'

function dealUrl(url: string | null | undefined): string | null {
  const t = url?.trim()
  if (!t || t === 'https://' || t === 'http://') return null
  return t
}

export function DealsPage() {
  const [items, setItems] = useState<DealDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)

  usePageMeta({
    title: '限时优惠',
    description: '折扣与活动一站看。',
  })

  useEffect(() => subscribeAuthChange(() => setLoggedIn(isLoggedIn())), [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isLoggedIn()) {
        setItems([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { items: list } = await loadActiveDeals()
        if (!cancelled) setItems(list)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [loggedIn])

  async function onGoLogin() {
    window.location.assign(loginPathWithReturn(ROUTES.DEALS))
  }

  return (
    <PageHero title="限时优惠" tagline="折扣与活动，一站看清">
      {!loggedIn ? (
        <Empty
          description="登录后即可查看限时优惠"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => void onGoLogin()}>
            去登录
          </Button>
        </Empty>
      ) : loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : items.length === 0 ? (
        <Empty description="暂无进行中的优惠" />
      ) : (
        <div className={styles.grid}>
          {items.map((d, i) => {
            const link = dealUrl(d.url)
            return (
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
                    <h3 className={styles.title}>{d.title}</h3>
                    <div className={styles.tags}>
                      {d.toolName ? (
                        <Tag color="cyan">
                          {d.toolSlug ? (
                            <Link to={toolDetailPath(d.toolSlug)}>{d.toolName}</Link>
                          ) : (
                            d.toolName
                          )}
                        </Tag>
                      ) : null}
                      {d.promoCode ? (
                        <span className={styles.code}>
                          <code>{d.promoCode}</code>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <p className={styles.desc}>{d.description}</p>

                {link ? (
                  <a
                    className={styles.url}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    title={link}
                  >
                    <LinkOutlined />
                    <span>{link.replace(/^https?:\/\//, '')}</span>
                  </a>
                ) : null}

                <div className={styles.footer}>
                  <span className={styles.window}>
                    {formatDateTime(d.startsAt)} — {formatDateTime(d.endsAt)}
                  </span>
                  <div className={styles.actions}>
                    {d.toolSlug ? (
                      <Link to={toolDetailPath(d.toolSlug)}>
                        <Button size="small">产品详情</Button>
                      </Link>
                    ) : (
                      <Link to={ROUTES.TOOLS}>
                        <Button size="small">AI导览</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </PageHero>
  )
}
