import { useState } from 'react'
import { Avatar, Space, Tooltip } from 'antd'
import { Link } from 'react-router-dom'

import { toolDetailPath } from '../router/paths'
import { resolveToolLogoUrl } from '../utils/toolLogo'
import styles from './ToolLogoChips.module.css'

export type ToolLogoItem = {
  slug: string
  name: string
  logoUrl?: string | null
}

type ToolLogoChipsProps = {
  tools: ToolLogoItem[]
  /** 小卡片内用更小尺寸 */
  size?: number
  className?: string
}

/** 评测卡 / 工具卡上的 Logo 组：可点进对应产品详情 */
export function ToolLogoChips({ tools, size = 32, className }: ToolLogoChipsProps) {
  if (!tools.length) return null
  return (
    <Space size={6} wrap className={[styles.row, className].filter(Boolean).join(' ')}>
      {tools.map((t) => (
        <Tooltip key={t.slug} title={t.name}>
          <Link
            to={toolDetailPath(t.slug)}
            className={styles.chip}
            aria-label={t.name}
            onClick={(e) => e.stopPropagation()}
          >
            <ToolLogo name={t.name} logoUrl={t.logoUrl} size={size} />
          </Link>
        </Tooltip>
      ))}
    </Space>
  )
}

type ToolLogoProps = {
  name: string
  logoUrl?: string | null
  size?: number
  className?: string
}

/** 单个工具 Logo（列表卡 / 详情头）；加载失败时回退为首字，避免白块 */
export function ToolLogo({ name, logoUrl, size = 40, className }: ToolLogoProps) {
  const resolved = resolveToolLogoUrl(logoUrl)
  const [broken, setBroken] = useState(false)
  const src = broken ? undefined : resolved

  return (
    <Avatar
      size={size}
      src={src}
      shape="square"
      className={[styles.avatar, className].filter(Boolean).join(' ')}
      style={{ background: 'rgba(46, 230, 166, 0.16)', flexShrink: 0 }}
      onError={() => {
        setBroken(true)
        return false
      }}
    >
      {name.slice(0, 1)}
    </Avatar>
  )
}
