import styles from './MarkdownBody.module.css'
import { renderMarkdown } from '../utils/markdown'

type MarkdownBodyProps = {
  content: string
  className?: string
}

export function MarkdownBody({ content, className }: MarkdownBodyProps) {
  return (
    <div
      className={`${styles.body} ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}
