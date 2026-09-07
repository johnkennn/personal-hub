import { useEffect, useState } from 'react'
import { Input, Modal, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

import { SearchResultsPanel } from './SearchResultsPanel'
import {
  searchGlobal,
  type GlobalSearchResult,
} from '../services/globalSearch'
import styles from './GlobalSearch.module.css'

type GlobalSearchProps = {
  open: boolean
  onClose: () => void
}

const EMPTY: GlobalSearchResult = { authors: [], articles: [], projects: [] }

/** 移动端 / ⌘K：弹层搜索作者、文章、项目 */
export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GlobalSearchResult>(EMPTY)

  useEffect(() => {
    if (!open) {
      setQ('')
      setResults(EMPTY)
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const keyword = q.trim()
    if (!keyword) {
      setResults(EMPTY)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(() => {
      void searchGlobal(keyword).then((res) => {
        if (!cancelled) {
          setResults(res)
          setLoading(false)
        }
      })
    }, 220)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [q, open])

  const showPanel = Boolean(q.trim())

  return (
    <Modal
      title="搜索"
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
        placeholder="搜索作者、文章或项目…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div className={styles.modalBody}>
        {!showPanel ? (
          <Typography.Text type="secondary">输入关键词，按类型查看匹配结果</Typography.Text>
        ) : (
          <SearchResultsPanel
            results={results}
            loading={loading}
            onNavigate={onClose}
          />
        )}
      </div>
    </Modal>
  )
}
