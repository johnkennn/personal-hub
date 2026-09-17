import { fetchActiveDeals } from '../api/deals'
import { SEED_DEALS } from '../data/seedDeals'
import type { DealDto } from '../types/deal'
import { loadHubTools } from './toolCatalog'

function isOngoing(d: DealDto, now = Date.now()): boolean {
  if (d.status !== 'ACTIVE') return false
  const start = Date.parse(d.startsAt)
  const end = Date.parse(d.endsAt)
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return start <= now && now <= end
}

/** 用工具目录补全关联产品 Logo（后端尚未返回 toolLogoUrl 时也能显示） */
async function withToolLogos(list: DealDto[]): Promise<DealDto[]> {
  if (!list.length) return list
  if (list.every((d) => d.toolLogoUrl)) return list
  try {
    const tools = await loadHubTools()
    const bySlug = new Map(tools.map((t) => [t.slug, t]))
    const byName = new Map(tools.map((t) => [t.name, t]))
    return list.map((d) => {
      if (d.toolLogoUrl) return d
      const tool =
        (d.toolSlug ? bySlug.get(d.toolSlug) : undefined) ||
        (d.toolName ? byName.get(d.toolName) : undefined)
      return { ...d, toolLogoUrl: tool?.logoUrl ?? null }
    })
  } catch {
    return list
  }
}

/** 优先 API；失败或空列表时用种子演示（仅进行中） */
export async function loadActiveDeals(): Promise<{ items: DealDto[]; fromApi: boolean }> {
  try {
    const res = await fetchActiveDeals()
    const list = (res.data.data ?? [])
      .filter((d) => isOngoing(d))
      .map((d) => ({
        ...d,
        description: d.description.replace(/\s*<!--seed:bulk-v1-->\s*/g, '').trim(),
      }))
    if (list.length > 0) {
      return { items: await withToolLogos(list), fromApi: true }
    }
  } catch {
    /* fall through */
  }
  return {
    items: await withToolLogos(SEED_DEALS.filter((d) => isOngoing(d))),
    fromApi: false,
  }
}
