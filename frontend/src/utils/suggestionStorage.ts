export type Suggestion = {
  id: string
  content: string
  createdAt: string
}

const STORAGE_KEY = 'personal_hub_suggestions'

export function loadSuggestions(): Suggestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Suggestion[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSuggestions(list: Suggestion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addSuggestion(content: string): Suggestion {
  const item: Suggestion = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  }
  const next = [item, ...loadSuggestions()]
  saveSuggestions(next)
  return item
}

export function removeSuggestion(id: string) {
  saveSuggestions(loadSuggestions().filter((s) => s.id !== id))
}
