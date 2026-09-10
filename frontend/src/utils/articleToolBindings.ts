/**
 * 前端临时：评测 ↔ AI 工具多对多绑定（后端 relatedToolIds 就绪前）。
 * 写评测页选择工具后写入；工具详情「相关评测」会读这里。
 */
const KEY = 'ai-hub-article-tool-bindings-v1'

type BindingsMap = Record<string, string[]>

function read(): BindingsMap {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as BindingsMap
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

function write(map: BindingsMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function saveArticleToolBindings(articleId: number, slugs: string[]) {
  const map = read()
  const cleaned = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))]
  if (cleaned.length === 0) delete map[String(articleId)]
  else map[String(articleId)] = cleaned
  write(map)
}

export function getArticleToolBindings(articleId: number): string[] {
  return read()[String(articleId)] ?? []
}

export function listArticleIdsBoundToTool(slug: string): number[] {
  const map = read()
  return Object.entries(map)
    .filter(([, slugs]) => slugs.includes(slug))
    .map(([id]) => Number(id))
    .filter((id) => Number.isFinite(id))
}
