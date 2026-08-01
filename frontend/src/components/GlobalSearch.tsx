import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, Input, List, Modal, Tag, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

import { searchDemoContent } from '../services/publicContent'
import { articleDetailPath, projectDetailPath } from '../router/paths'

type GlobalSearchProps = {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [q, setQ] = useState('')

  const results = useMemo(() => searchDemoContent(q), [q])
  const total = results.articles.length + results.projects.length

  return (
    <Modal
      title="搜索内容"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={560}
    >
      <Input
        allowClear
        size="large"
        prefix={<SearchOutlined />}
        placeholder="搜索文章标题或项目名称…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div style={{ marginTop: 16, maxHeight: 420, overflow: 'auto' }}>
        {!q.trim() ? (
          <Typography.Text type="secondary">输入关键词开始搜索（演示数据）</Typography.Text>
        ) : total === 0 ? (
          <Empty description="没有匹配结果" />
        ) : (
          <>
            {results.articles.length > 0 ? (
              <List
                header={<Typography.Text type="secondary">文章</Typography.Text>}
                dataSource={results.articles}
                renderItem={(a) => (
                  <List.Item>
                    <Link to={articleDetailPath(a.id)} onClick={onClose}>
                      {a.title}
                    </Link>
                    <Tag style={{ marginLeft: 8 }}>{a.authorName}</Tag>
                  </List.Item>
                )}
              />
            ) : null}
            {results.projects.length > 0 ? (
              <List
                header={<Typography.Text type="secondary">项目</Typography.Text>}
                dataSource={results.projects}
                renderItem={(p) => (
                  <List.Item>
                    <Link to={projectDetailPath(p.id)} onClick={onClose}>
                      {p.name}
                    </Link>
                    <Tag style={{ marginLeft: 8 }}>{p.authorName}</Tag>
                  </List.Item>
                )}
              />
            ) : null}
          </>
        )}
      </div>
    </Modal>
  )
}
