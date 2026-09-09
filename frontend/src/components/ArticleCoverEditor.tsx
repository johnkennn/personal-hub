import { uploadArticleCover } from '../api/article'
import { CoverEditor } from './CoverEditor'

type ArticleCoverEditorProps = {
  articleId?: number | string
  initialCoverUrl?: string | null
  pendingFile?: File | null
  onPendingFileChange?: (file: File | null) => void
}

/** 文章封面：列表卡 / 分享预览 */
export function ArticleCoverEditor({
  articleId,
  initialCoverUrl,
  pendingFile,
  onPendingFileChange,
}: ArticleCoverEditorProps) {
  return (
    <CoverEditor
      contentId={articleId}
      initialCoverUrl={initialCoverUrl}
      pendingFile={pendingFile}
      onPendingFileChange={onPendingFileChange}
      title="文章封面"
      hint="用于文章列表与分享卡片预览。建议横图。"
      alt="文章封面"
      upload={async (id, file) => {
        const res = await uploadArticleCover(id, file)
        return res.data.data.coverUrl
      }}
    />
  )
}
