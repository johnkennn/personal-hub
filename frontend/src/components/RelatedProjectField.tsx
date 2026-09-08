import { useEffect, useState } from 'react'
import { Form, Select, Typography } from 'antd'

import { fetchMyProjectDrafts, fetchMyProjectPublished } from '../api/project'
import type { Project } from '../types/project'

/**
 * 写文章时选择关联项目（制作特辑）。
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
      label="关联项目（制作特辑）"
      extra={
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          可选。关联后会在该项目展映页展示为「制作特辑」。
        </Typography.Text>
      }
    >
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        loading={loading}
        placeholder={options.length ? '选择一个项目' : '暂无可关联项目'}
        options={options}
        disabled={!loading && options.length === 0}
      />
    </Form.Item>
  )
}
