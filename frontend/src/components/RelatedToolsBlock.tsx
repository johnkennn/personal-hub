import { Link } from 'react-router-dom'
import { Space, Typography } from 'antd'

import { ToolLogo } from './ToolLogoChips'
import { toolDetailPath } from '../router/paths'
import type { HubTool } from '../types/tool'

type RelatedToolsBlockProps = {
  tools: HubTool[]
  /** 紧凑模式：只显示标签行 */
  compact?: boolean
}

/** 评测详情：展示可点击的关联 AI 产品（带 Logo） */
export function RelatedToolsBlock({ tools, compact }: RelatedToolsBlockProps) {
  if (tools.length === 0) return null

  return (
    <div style={{ marginBottom: compact ? 0 : 20 }}>
      {!compact ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
          关联 AI 产品
        </Typography.Text>
      ) : null}
      <Space size={[10, 10]} wrap>
        {tools.map((t) => (
          <Link
            key={t.slug}
            to={toolDetailPath(t.slug)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px 6px 6px',
              borderRadius: 10,
              border: '1px solid rgba(100, 140, 200, 0.28)',
              background: 'rgba(14, 22, 38, 0.72)',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <ToolLogo name={t.name} logoUrl={t.logoUrl} size={28} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
            {t.category ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {t.category}
              </Typography.Text>
            ) : null}
          </Link>
        ))}
      </Space>
    </div>
  )
}
