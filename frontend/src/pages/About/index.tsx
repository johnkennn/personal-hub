import { Card, Typography } from 'antd'
import { motion } from 'framer-motion'

import { usePageMeta } from '../../hooks/usePageMeta'
import { SITE_BRAND } from '../../router/paths'
import styles from '../../styles/ui.module.css'

const MODULES = [
  {
    title: '聊天检索',
    desc: '默认模式：问答、站内导流，并支持模糊搜索已收录的 AI 产品与评测，结果可点击进入；左侧可切换文案、翻译、简历、图像、识别、内容总结、合同等技能。',
  },
  {
    title: '发现',
    desc: '热门产品与精选评测一站浏览。',
  },
  {
    title: 'AI导览',
    desc: '市面成熟 AI 产品按分类汇总，少花时间到处搜。',
  },
  {
    title: 'AI评测',
    desc: '针对具体 AI 工具的评测与体验帖。',
  },
  {
    title: '限时优惠',
    desc: '近期有折扣或活动的 AI 产品集中介绍。',
  },
] as const

export function AboutPage() {
  usePageMeta({
    title: `关于 ${SITE_BRAND}`,
    description: '了解 AI Tools Hub 各模块能为你带来的便利。',
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHead}>
        <div>
          <Typography.Title level={2} className={styles.pageTitle}>
            关于 {SITE_BRAND}
          </Typography.Title>
          <Typography.Paragraph className={styles.pageDesc} style={{ maxWidth: 640 }}>
            帮你更快找到合适的 AI 产品，在聊天里用上站内技能，并用评测与优惠降低选择成本。
          </Typography.Paragraph>
        </div>
      </div>

      <Typography.Title level={4} style={{ marginTop: 0 }}>
        本站能为你做什么
      </Typography.Title>

      {MODULES.map((m) => (
        <Card
          key={m.title}
          className={styles.contentCard}
          variant="borderless"
          style={{ marginBottom: 12 }}
        >
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            {m.title}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {m.desc}
          </Typography.Paragraph>
        </Card>
      ))}

      <Card className={styles.contentCard} variant="borderless" style={{ marginTop: 8 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          联系
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 4 }}>
          网站管理员
        </Typography.Paragraph>
        <Typography.Text style={{ fontSize: 18 }}>13476270359</Typography.Text>
      </Card>
    </motion.div>
  )
}
