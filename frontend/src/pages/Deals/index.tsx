import { Empty, Typography } from 'antd'
import { motion } from 'framer-motion'

import { usePageMeta } from '../../hooks/usePageMeta'
import styles from '../../styles/ui.module.css'

export function DealsPage() {
  usePageMeta({
    title: '限时优惠',
    description: '近期有折扣或活动的 AI 产品汇总。',
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            限时优惠
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            重点列举并介绍近期市面上有优惠的 AI 产品，帮你抓住合适的入手时机。
          </Typography.Paragraph>
        </div>
      </div>

      <Empty description="暂无进行中的优惠，稍后再来看看" />
    </motion.div>
  )
}
