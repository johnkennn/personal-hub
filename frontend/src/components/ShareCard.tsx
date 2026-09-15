import type { CSSProperties } from 'react'
import { App, Button, Typography } from 'antd'
import { CopyOutlined, ShareAltOutlined } from '@ant-design/icons'

import { PAGE_META_DEFAULTS } from '../hooks/usePageMeta'
import { copyToClipboard } from '../utils/clipboard'
import { excerpt } from '../utils/format'
import styles from './ShareCard.module.css'

type ShareCardProps = {
  title: string
  description: string
  /** css background-image value，含 url(...) 或渐变 */
  mediaStyle: CSSProperties
  url?: string
}

/**
 * 页内「分享卡片」预览：复制链接 / 系统分享。
 * 视觉对齐展映语言，便于用户外发前确认长什么样。
 */
export function ShareCard({ title, description, mediaStyle, url }: ShareCardProps) {
  const { message } = App.useApp()
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function copyLink() {
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      message.success('链接已复制，可以粘贴分享')
    } else {
      message.error('复制失败，请手动复制地址栏链接')
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: `${title} · ${PAGE_META_DEFAULTS.site}`,
        text: excerpt(description, 80),
        url: shareUrl,
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      message.error('分享未完成')
    }
  }

  return (
    <div>
      <div className={styles.head}>
        <Typography.Title level={3} className={styles.title}>
          分享这件作品
        </Typography.Title>
        <Typography.Paragraph className={styles.hint}>
          预览外链卡片，一键复制链接。
        </Typography.Paragraph>
      </div>
      <div className={styles.card}>
        <div className={styles.preview}>
          <div className={styles.media} style={mediaStyle} />
          <div className={styles.body}>
            <p className={styles.site}>{PAGE_META_DEFAULTS.site}</p>
            <Typography.Title level={4} className={styles.previewTitle}>
              {title}
            </Typography.Title>
            <Typography.Paragraph className={styles.previewDesc}>
              {excerpt(description, 88)}
            </Typography.Paragraph>
          </div>
        </div>
        <div className={styles.actions}>
          <Button type="primary" icon={<CopyOutlined />} onClick={() => void copyLink()}>
            复制链接
          </Button>
          {canNativeShare ? (
            <Button icon={<ShareAltOutlined />} onClick={() => void nativeShare()}>
              系统分享
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
