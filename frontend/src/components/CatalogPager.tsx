import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Pagination } from 'antd'

import { CATALOG_PAGE_SIZE_OPTIONS } from '../constants/catalog'
import styles from '../styles/ui.module.css'

type CatalogListLayoutProps = {
  pageSize: number
  children: ReactNode
  /** 分页器；无内容时可不传 */
  pager?: ReactNode
}

/** 内容区预留满页高度，分页器始终贴在壳层底部，避免末页卡片变少时上下跳动 */
export function CatalogListLayout({ pageSize, children, pager }: CatalogListLayoutProps) {
  const vars = {
    '--catalog-rows-xs': pageSize,
    '--catalog-rows-sm': Math.ceil(pageSize / 2),
    '--catalog-rows-lg': Math.ceil(pageSize / 3),
    '--catalog-rows-xl': Math.ceil(pageSize / 4),
  } as CSSProperties

  return (
    <div className={styles.catalogShell}>
      <div className={`${styles.catalogBody} ph-scroll`} style={vars}>
        {children}
      </div>
      {pager}
    </div>
  )
}

type CatalogPagerProps = {
  current: number
  pageSize: number
  total: number
  onChange: (page: number, pageSize: number) => void
}

function useNarrowScreen(maxWidth = 640) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [maxWidth])
  return narrow
}

export function CatalogPager({ current, pageSize, total, onChange }: CatalogPagerProps) {
  const narrow = useNarrowScreen()
  return (
    <div className={styles.catalogPager}>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        onShowSizeChange={onChange}
        showSizeChanger={narrow ? false : { showSearch: false }}
        pageSizeOptions={[...CATALOG_PAGE_SIZE_OPTIONS].map(String)}
        showTotal={narrow ? undefined : (t) => `共 ${t} 条`}
        simple={narrow}
        hideOnSinglePage={false}
      />
    </div>
  )
}

/** 翻页或改 pageSize 时的统一处理：改条数则回到第 1 页 */
export function applyCatalogPageChange(
  setPage: (p: number) => void,
  setPageSize: (s: number) => void,
  currentPageSize: number,
  nextPage: number,
  nextPageSize: number,
) {
  if (nextPageSize !== currentPageSize) {
    setPageSize(nextPageSize)
    setPage(1)
  } else {
    setPage(nextPage)
  }
}
