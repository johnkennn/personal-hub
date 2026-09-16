import { useEffect, useState } from 'react'
import { Form, Select, Typography } from 'antd'

import { fetchMyProjectDrafts, fetchMyProjectPublished } from '../api/project'
import type { Project } from '../types/project'

/**
 * 写评测时可选关联项目（站内笔记/展映，次要）。
 * 选项 = 我的草稿 + 已发布项目。
 */
export function RelatedProjectField() {
  const [options, setOptions] = useState<{ value: number; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([fetchMyProjectPublished(), fetchMyProjectDrafts()])
      .then(([published, drafts]) => {
        if (cancelled) return
        const map = new Map<number, Project>()
        for (const p of [...(published.data.data ?? []), ...(drafts.data.data ?? [])]) {
          map.set(p.id, p)
        }
        setOptions(
          [...map.values()]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((p) => ({
              value: p.id,
              label: p.published ? p.name : `${p.name}（草稿）`,
            })),
        )
      })
      .catch(() => {
        if (!cancelled) setOptions([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Form.Item
      name="relatedProjectId"
      label="相关笔记（可选）"
      extra={
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          次要字段。一般只需绑定上方「关联 AI 工具」；有站内项目笔记时再选。
        </Typography.Text>
      }
    >
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        loading={loading}
        placeholder={options.length ? '选择相关笔记' : '暂无可关联笔记'}
        options={options}
        disabled={!loading && options.length === 0}
      />
    </Form.Item>
  )
}
