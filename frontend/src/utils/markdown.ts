import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

/** 演示用 Markdown → HTML（内容来自自有 mock / 登录用户，不做完整消毒管线） */
export function renderMarkdown(source: string): string {
  return marked.parse(source ?? '', { async: false }) as string
}
