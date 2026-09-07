import { useEffect, useRef, useState } from 'react'
import { Input } from 'antd'
import type { InputRef } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

import { SearchResultsPanel } from './SearchResultsPanel'
import {
  countSearchHits,
  searchGlobal,
  type GlobalSearchResult,
} from '../services/globalSearch'
import styles from './GlobalSearch.module.css'

const EMPTY: GlobalSearchResult = { authors: [], articles: [], projects: [] }

type HeaderSearchProps = {
  inputRef?: React.RefObject<InputRef | null>
}

/** 顶栏内联搜索：有关键词时在输入框下方按类型展示结果 */
export function HeaderSearch({ inputRef }: HeaderSearchProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GlobalSearchResult>(EMPTY)

  useEffect(() => {
    const keyword = q.trim()
    if (!keyword) {
      setResults(EMPTY)
      setLoading(false)
      setOpen(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setOpen(true)
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
  }, [q])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const panelVisible = open && Boolean(q.trim()) && (loading || countSearchHits(results) > 0)

  return (
    <div ref={wrapRef} className={styles.headerSearch}>
      <Input
        ref={inputRef}
        allowClear
        size="middle"
        className={styles.headerSearchInput}
        prefix={<SearchOutlined />}
        placeholder="搜索作者 / 文章 / 项目"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => {
          if (q.trim()) setOpen(true)
        }}
      />
      {panelVisible ? (
        <div className={styles.dropdown} role="listbox">
          <SearchResultsPanel
            results={results}
            loading={loading}
            onNavigate={() => {
              setOpen(false)
              setQ('')
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
