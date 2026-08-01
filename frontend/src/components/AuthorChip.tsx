import { Avatar, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'

import { userProfilePath } from '../router/paths'

type AuthorChipProps = {
  authorId?: number
  authorName: string
  avatarUrl?: string
  size?: number
}

export function AuthorChip({ authorId, authorName, avatarUrl, size = 28 }: AuthorChipProps) {
  const inner = (
    <Space size={8}>
      <Avatar size={size} src={avatarUrl} style={{ background: 'var(--ph-accent-muted, #2a4a3a)' }}>
        {authorName.slice(0, 1)}
      </Avatar>
      <Typography.Text>{authorName}</Typography.Text>
    </Space>
  )

  if (!authorId) return inner
  return (
    <Link to={userProfilePath(authorId)} style={{ color: 'inherit' }}>
      {inner}
    </Link>
  )
}
