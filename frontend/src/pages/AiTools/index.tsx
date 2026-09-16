import { Link } from 'react-router-dom'
import { Card, Col, Row, Tag, Typography } from 'antd'
import { motion } from 'framer-motion'

import { usePageMeta } from '../../hooks/usePageMeta'
import { ROUTES } from '../../router/paths'
import ui from '../../styles/ui.module.css'

const TOOLS = [
  {
    slug: 'product-desc',
    path: ROUTES.AI_TOOL_PRODUCT_DESC,
    title: '商品描述生成器',
    desc: '输入卖点与受众，快速生成可用的商品文案。',
    status: '即将开放' as const,
  },
]

export function AiToolsPage() {
  usePageMeta({
    title: '站内能力',
    description: '也可直接找小智用大模型完成文案等任务。',
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className={ui.pageHead}>
        <div>
          <Typography.Title level={2} className={ui.pageTitle}>
            站内能力
          </Typography.Title>
          <Typography.Paragraph className={ui.pageDesc}>
            独立页即将开放；现在也可以去「小智」里直接吩咐大模型完成文案等任务。
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={[14, 14]}>
        {TOOLS.map((tool, i) => (
          <Col xs={24} sm={12} lg={8} key={tool.slug}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
            >
              <Link to={tool.path} className={ui.cardLink}>
                <Card className={ui.contentCard} variant="borderless" hoverable>
                  <Tag style={{ marginBottom: 8 }}>{tool.status}</Tag>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>
                    {tool.title}
                  </Typography.Title>
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {tool.desc}
                  </Typography.Paragraph>
                </Card>
              </Link>
            </motion.div>
          </Col>
        ))}
      </Row>
    </motion.div>
  )
}
