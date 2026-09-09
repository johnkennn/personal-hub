import { uploadProjectCover } from '../api/project'
import { CoverEditor } from './CoverEditor'

type ProjectCoverEditorProps = {
  projectId?: number | string
  initialCoverUrl?: string | null
  pendingFile?: File | null
  onPendingFileChange?: (file: File | null) => void
}

/** 项目展映封面 */
export function ProjectCoverEditor({
  projectId,
  initialCoverUrl,
  pendingFile,
  onPendingFileChange,
}: ProjectCoverEditorProps) {
  return (
    <CoverEditor
      contentId={projectId}
      initialCoverUrl={initialCoverUrl}
      pendingFile={pendingFile}
      onPendingFileChange={onPendingFileChange}
      title="展映封面"
      hint="用于展映页大图、分享卡片与列表缩略图。建议横图。"
      alt="项目封面"
      upload={async (id, file) => {
        const res = await uploadProjectCover(id, file)
        return res.data.data.coverUrl
      }}
    />
  )
}
