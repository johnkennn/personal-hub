import { fetchActiveDeals } from '../api/deals'
import { SEED_DEALS } from '../data/seedDeals'
import type { DealDto } from '../types/deal'

function isOngoing(d: DealDto, now = Date.now()): boolean {
  if (d.status !== 'ACTIVE') return false
  const start = Date.parse(d.startsAt)
  const end = Date.parse(d.endsAt)
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return start <= now && now <= end
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
      return { items: list, fromApi: true }
    }
  } catch {
    /* fall through */
  }
  return {
    items: SEED_DEALS.filter((d) => isOngoing(d)),
    fromApi: false,
  }
}
