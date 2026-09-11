import { Link } from 'react-router-dom'
import { Alert, Button, Space, Typography } from 'antd'
import { motion } from 'framer-motion'

import { BackNavButton } from '../../components/BackNavButton'
import { usePageMeta } from '../../hooks/usePageMeta'
import { ROUTES } from '../../router/paths'
import styles from '../../styles/ui.module.css'

export function ProductDescPage() {
  usePageMeta({
    title: '商品描述生成器',
    description: '输入卖点与受众，快速生成商品描述文案。',
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <BackNavButton fallback={ROUTES.AI_TOOLS} className={styles.pageBack} />
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            商品描述生成器
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc}>
            告诉 AI 你的卖点、受众和语气，即可生成可直接使用的商品描述。
          </Typography.Paragraph>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="即将开放"
        description="功能正在准备中，开放后即可在本页直接生成文案。"
      />

      <Space wrap>
        <Link to={ROUTES.AI_TOOLS}>
          <Button>返回技能列表</Button>
        </Link>
        <Link to={ROUTES.TOOLS}>
          <Button type="primary">去 AI导览</Button>
        </Link>
      </Space>
    </motion.div>
  )
}
