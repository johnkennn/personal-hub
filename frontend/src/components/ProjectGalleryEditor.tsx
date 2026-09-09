import { useEffect, useState } from 'react'
import { App, Button, Typography, Upload } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

import {
  deleteProjectMedia,
  fetchMyProjectMedia,
  uploadProjectMedia,
} from '../api/project'
import type { ProjectMedia } from '../types/projectMedia'
import { resolveMediaUrl } from '../utils/mediaUrl'
import { apiErrorMessage } from '../utils/apiError'
import styles from './ProjectGalleryEditor.module.css'

const MAX_ITEMS = 12
const MAX_MB = 5

type ProjectGalleryEditorProps = {
  projectId: number | string
}

/** 草稿项目媒体画廊：上传 / 删除（最多 12 张） */
export function ProjectGalleryEditor({ projectId }: ProjectGalleryEditorProps) {
  const { message } = App.useApp()
  const [items, setItems] = useState<ProjectMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadedId, setLoadedId] = useState(projectId)

  // projectId 变化时在渲染期重置，避免 effect 内同步 setState
  if (projectId !== loadedId) {
    setLoadedId(projectId)
    setLoading(true)
    setItems([])
  }

  useEffect(() => {
    let cancelled = false
    fetchMyProjectMedia(projectId)
      .then((res) => {
        if (!cancelled) setItems(res.data.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  const uploadProps: UploadProps = {
    accept: 'image/jpeg,image/png,image/gif,image/webp',
    showUploadList: false,
    disabled: busy || items.length >= MAX_ITEMS,
    beforeUpload: (file) => {
      if (items.length >= MAX_ITEMS) {
        message.warning(`最多 ${MAX_ITEMS} 张`)
        return Upload.LIST_IGNORE
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        message.error(`单张不超过 ${MAX_MB}MB`)
        return Upload.LIST_IGNORE
      }
      setBusy(true)
      uploadProjectMedia(projectId, file)
        .then((res) => {
          setItems((prev) => [...prev, res.data.data])
          message.success('已加入画廊')
        })
        .catch((e) => message.error(apiErrorMessage(e, '上传失败')))
        .finally(() => setBusy(false))
      return false
    },
  }

  async function onRemove(mediaId: number) {
    setBusy(true)
    try {
      await deleteProjectMedia(projectId, mediaId)
      setItems((prev) => prev.filter((m) => m.id !== mediaId))
      message.success('已删除')
    } catch {
      message.error('删除失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.editor}>
      <Typography.Text strong>媒体画廊</Typography.Text>
      <Typography.Paragraph className={styles.hint}>
        展映页「画廊」分镜会展示这些图片。最多 {MAX_ITEMS} 张，单张 ≤ {MAX_MB}MB。
        {loading ? ' 加载中…' : ` 当前 ${items.length} 张。`}
      </Typography.Paragraph>
      <div className={styles.grid}>
        {items.map((m) => {
          const src = resolveMediaUrl(m.url)
          return (
            <div key={m.id} className={styles.tile}>
              {src ? <img src={src} alt="" /> : null}
              <Button
                className={styles.remove}
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={busy}
                onClick={() => void onRemove(m.id)}
              />
            </div>
          )
        })}
      </div>
      <Upload {...uploadProps}>
        <Button icon={<PlusOutlined />} loading={busy} disabled={items.length >= MAX_ITEMS}>
          添加图片
        </Button>
      </Upload>
    </div>
  )
}
