import { Link } from 'react-router-dom'
import { Space, Tag, Typography } from 'antd'

import { toolDetailPath } from '../router/paths'
import type { HubTool } from '../types/tool'

type RelatedToolsBlockProps = {
  tools: HubTool[]
  /** 紧凑模式：只显示标签行 */
  compact?: boolean
}

/** 评测详情：展示可点击的关联 AI 产品 */
export function RelatedToolsBlock({ tools, compact }: RelatedToolsBlockProps) {
  if (tools.length === 0) return null

  return (
    <div style={{ marginBottom: compact ? 0 : 20 }}>
      {!compact ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
          关联 AI 产品
        </Typography.Text>
      ) : null}
      <Space size={[8, 8]} wrap>
        {tools.map((t) => (
          <Link key={t.slug} to={toolDetailPath(t.slug)}>
            <Tag
              color="cyan"
              style={{ cursor: 'pointer', marginInlineEnd: 0, padding: '2px 10px' }}
            >
              {t.name}
              {t.category ? (
                <Typography.Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                  {t.category}
                </Typography.Text>
              ) : null}
            </Tag>
          </Link>
        ))}
      </Space>
    </div>
  )
}
