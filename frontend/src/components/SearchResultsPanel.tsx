import { Link } from 'react-router-dom'
import { Empty, Typography } from 'antd'
import type { ReactNode } from 'react'

import type { GlobalSearchResult } from '../services/globalSearch'
import { articleDetailPath, projectDetailPath, userProfilePath } from '../router/paths'
import styles from './GlobalSearch.module.css'

type SearchResultsPanelProps = {
  results: GlobalSearchResult
  loading?: boolean
  onNavigate?: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.section}>
      <Typography.Text type="secondary" className={styles.sectionTitle}>
        {title}
      </Typography.Text>
      <ul className={styles.list}>{children}</ul>
    </div>
  )
}

/** 按作者 / 文章 / 项目分组的搜索结果列表 */
export function SearchResultsPanel({ results, loading, onNavigate }: SearchResultsPanelProps) {
  const total = results.authors.length + results.articles.length + results.projects.length

  if (loading) {
    return (
      <Typography.Text type="secondary" className={styles.hint}>
        搜索中…
      </Typography.Text>
    )
  }

  if (total === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配结果" />
  }

  return (
    <div className={styles.results}>
      {results.authors.length > 0 ? (
        <Section title="作者">
          {results.authors.map((a) => (
            <li key={`author-${a.id}`}>
              <Link to={userProfilePath(a.id)} className={styles.hit} onClick={onNavigate}>
                <span className={styles.hitTitle}>{a.name}</span>
                <span className={styles.hitMeta}>主页</span>
              </Link>
            </li>
          ))}
        </Section>
      ) : null}

      {results.articles.length > 0 ? (
        <Section title="文章">
          {results.articles.map((a) => (
            <li key={`article-${a.id}`}>
              <Link to={articleDetailPath(a.id)} className={styles.hit} onClick={onNavigate}>
                <span className={styles.hitTitle}>{a.title}</span>
                {a.authorName ? <span className={styles.hitMeta}>{a.authorName}</span> : null}
              </Link>
            </li>
          ))}
        </Section>
      ) : null}

      {results.projects.length > 0 ? (
        <Section title="项目">
          {results.projects.map((p) => (
            <li key={`project-${p.id}`}>
              <Link to={projectDetailPath(p.id)} className={styles.hit} onClick={onNavigate}>
                <span className={styles.hitTitle}>{p.title}</span>
                {p.authorName ? <span className={styles.hitMeta}>{p.authorName}</span> : null}
              </Link>
            </li>
          ))}
        </Section>
      ) : null}
    </div>
  )
}
