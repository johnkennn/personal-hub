import type { CSSProperties, ReactNode } from 'react'
import { Input, Pagination, Space } from 'antd'

import { ADMIN_PAGE_SIZE, ADMIN_PAGE_SIZE_OPTIONS } from '../constants/admin'
import styles from '../styles/ui.module.css'

type AdminListShellProps = {
  searchPlaceholder: string
  keyword: string
  onKeywordChange: (value: string) => void
  pageSize?: number
  /** 表格外独立分页器，固定在壳层底部 */
  pager?: ReactNode
  extra?: ReactNode
  children: ReactNode
}

type AdminPagerProps = {
  current: number
  pageSize: number
  total: number
  onChange: (page: number, pageSize: number) => void
  unit?: string
}

/** 顶部模糊搜索 + 表体预留满页高度 + 分页器贴壳层底 */
export function AdminListShell({
  searchPlaceholder,
  keyword,
  onKeywordChange,
  pageSize = ADMIN_PAGE_SIZE,
  pager,
  extra,
  children,
}: AdminListShellProps) {
  const shellStyle = {
    '--admin-rows': pageSize,
  } as CSSProperties

  return (
    <div className={styles.adminListShell}>
      <div className={styles.adminListToolbar}>
        <Input.Search
          allowClear
          placeholder={searchPlaceholder}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onSearch={onKeywordChange}
          style={{ maxWidth: 360 }}
        />
        {extra ? <Space wrap>{extra}</Space> : null}
      </div>
      <div className={styles.adminTableShell} style={shellStyle}>
        <div className={styles.adminTableBody}>{children}</div>
        {pager}
      </div>
    </div>
  )
}

export function AdminPager({
  current,
  pageSize,
  total,
  onChange,
  unit = '条',
}: AdminPagerProps) {
  return (
    <div className={styles.adminPager}>
      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        onShowSizeChange={onChange}
        showSizeChanger
        pageSizeOptions={[...ADMIN_PAGE_SIZE_OPTIONS].map(String)}
        showTotal={(t) => `共 ${t} ${unit}`}
        hideOnSinglePage={false}
      />
    </div>
  )
}

/** 当前页切片（表格关闭内置分页时使用） */
export function sliceAdminPage<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export { ADMIN_PAGE_SIZE }
