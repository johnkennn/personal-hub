import { Avatar, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'

import { userProfilePath } from '../router/paths'
import { resolveMediaUrl } from '../utils/mediaUrl'

type AuthorChipProps = {
  authorId?: number
  authorName: string
  avatarUrl?: string
  size?: number
}

export function AuthorChip({ authorId, authorName, avatarUrl, size = 28 }: AuthorChipProps) {
  const displayName = (authorName || '未知作者').trim() || '未知作者'
  const src = resolveMediaUrl(avatarUrl)
  const inner = (
    <Space size={8}>
      <Avatar size={size} src={src} style={{ background: 'var(--ph-accent-muted, #2a4a3a)' }}>
        {displayName.slice(0, 1)}
      </Avatar>
      <Typography.Text ellipsis style={{ maxWidth: 96 }}>
        {displayName}
      </Typography.Text>
    </Space>
  )

  if (!authorId) return inner
  return (
    <Link to={userProfilePath(authorId)} style={{ color: 'inherit' }}>
      {inner}
    </Link>
  )
}
