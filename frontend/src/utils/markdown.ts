import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * 模型常输出「##标题」无空格、或把标题粘在段中。
 * 先规范化再交给 marked，否则 ATX 标题不生效。
 */
export function normalizeMarkdown(source: string): string {
  let s = (source ?? '').replace(/\r\n/g, '\n')

  // 段中粘连的标题：…口。##二、… → 换行再当标题
  s = s.replace(/([^\n#])(#{1,6})([^\s#])/g, '$1\n\n$2 $3')

  // 行首 ##标题 → ## 标题
  s = s.replace(/^(#{1,6})([^\s#].*)$/gm, '$1 $2')

  // 多余空行压一下，避免气泡过高
  s = s.replace(/\n{3,}/g, '\n\n')

  return s.trim()
}

/** Markdown → HTML（内容来自模型 / 本站，不做完整消毒管线） */
export function renderMarkdown(source: string): string {
  return marked.parse(normalizeMarkdown(source), { async: false }) as string
}
