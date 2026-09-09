import { useEffect, useState } from 'react'
import { App, Button, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

import { resolveMediaUrl } from '../utils/mediaUrl'
import { apiErrorMessage } from '../utils/apiError'
import styles from './ProjectGalleryEditor.module.css'

export const COVER_MAX_MB = 5

export function isAllowedCoverFile(file: File, maxMb = COVER_MAX_MB) {
  if (file.size > maxMb * 1024 * 1024) {
    return `封面不超过 ${maxMb}MB`
  }
  return null
}

type CoverEditorProps = {
  /** 有 id：立刻上传；无 id：仅本地预选（新建页） */
  contentId?: number | string
  initialCoverUrl?: string | null
  pendingFile?: File | null
  onPendingFileChange?: (file: File | null) => void
  /** 返回更新后的 coverUrl */
  upload: (id: number | string, file: File) => Promise<string | null | undefined>
  title?: string
  hint?: string
  alt?: string
}

/** 通用封面：编辑直传 / 新建预选后由父页面上传 */
export function CoverEditor({
  contentId,
  initialCoverUrl = null,
  pendingFile = null,
  onPendingFileChange,
  upload,
  title = '封面',
  hint = '建议横图，用于列表与分享预览。',
  alt = '封面',
}: CoverEditorProps) {
  const { message } = App.useApp()
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [syncedId, setSyncedId] = useState(contentId)

  if (contentId !== syncedId) {
    setSyncedId(contentId)
    setCoverUrl(initialCoverUrl)
  }

  useEffect(() => {
    if (contentId != null) setCoverUrl(initialCoverUrl)
  }, [initialCoverUrl, contentId])

  useEffect(() => {
    if (!pendingFile) {
      setLocalPreview(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setLocalPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const uploadProps: UploadProps = {
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    showUploadList: false,
    disabled: busy,
    beforeUpload: (file) => {
      const err = isAllowedCoverFile(file)
      if (err) {
        message.error(err)
        return Upload.LIST_IGNORE
      }

      if (contentId == null) {
        onPendingFileChange?.(file)
        return false
      }

      setBusy(true)
      upload(contentId, file)
        .then((url) => {
          setCoverUrl(url ?? null)
          message.success('封面已更新')
        })
        .catch((e) => message.error(apiErrorMessage(e, '上传失败')))
        .finally(() => setBusy(false))
      return false
    },
  }

  const preview = localPreview || resolveMediaUrl(coverUrl)
  const hasCover = Boolean(preview)

  return (
    <div className={styles.editor}>
      <Typography.Text strong>{title}</Typography.Text>
      <Typography.Paragraph className={styles.hint}>
        {hint} 单张 ≤ {COVER_MAX_MB}MB。
        {contentId == null
          ? hasCover
            ? ' 已预选，创建后自动上传。'
            : ' 可先选择，创建时一并上传。'
          : hasCover
            ? ' 已设置。'
            : ' 尚未设置，将显示色调占位。'}
      </Typography.Paragraph>
      {preview ? (
        <div className={`${styles.tile} ${styles.coverPreview}`}>
          <img src={preview} alt={alt} />
        </div>
      ) : null}
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} loading={busy}>
          {hasCover ? '更换封面' : '上传封面'}
        </Button>
      </Upload>
      {contentId == null && pendingFile ? (
        <Button type="link" onClick={() => onPendingFileChange?.(null)} style={{ paddingLeft: 8 }}>
          清除
        </Button>
      ) : null}
    </div>
  )
}
