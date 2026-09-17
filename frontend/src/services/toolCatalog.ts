import { fetchToolBySlug, fetchToolCategories, fetchTools } from '../api/tools'
import { SEED_TOOLS, type SeedTool } from '../data/seedTools'
import { toolDetailPath } from '../router/paths'
import type { HubTool, ToolCategoryDto, ToolDto } from '../types/tool'

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  try {
    const v: unknown = JSON.parse(raw)
    if (!Array.isArray(v)) return []
    return v.map((x) => String(x)).filter(Boolean)
  } catch {
    return []
  }
}

export function toolFromApi(t: ToolDto): HubTool {
  return {
    slug: t.slug,
    name: t.name,
    category: t.categoryName ?? '',
    categorySlug: t.categorySlug ?? '',
    keywords: parseJsonArray(t.keywordsJson),
    summary: t.summary,
    intro: t.intro,
    audience: t.audience ?? '',
    useCases: parseJsonArray(t.useCasesJson),
    pricing: t.pricing,
    tags: parseJsonArray(t.tagsJson),
    pros: parseJsonArray(t.prosJson),
    cons: parseJsonArray(t.consJson),
    websiteUrl: t.websiteUrl,
    logoUrl: t.logoUrl,
    featured: Boolean(t.featured),
  }
}

export function toolFromSeed(t: SeedTool): HubTool {
  return {
    slug: t.slug,
    name: t.name,
    category: t.category,
    categorySlug: '',
    keywords: t.keywords,
    summary: t.summary,
    intro: t.intro,
    audience: t.audience,
    useCases: t.useCases,
    pricing: t.pricing,
    tags: t.tags,
    pros: t.pros,
    cons: t.cons,
    websiteUrl: t.websiteUrl,
    logoUrl: null,
    featured: Boolean(t.featured),
  }
}

export function hubToolToCatalogHit(t: HubTool) {
  return {
    key: t.slug,
    title: t.name,
    category: t.category,
    href: toolDetailPath(t.slug),
    hint: t.category,
  }
}

let toolsCache: HubTool[] | null = null
let toolsCachePromise: Promise<HubTool[]> | null = null
let categoriesCache: ToolCategoryDto[] | null = null

export function invalidateToolCatalogCache() {
  toolsCache = null
  toolsCachePromise = null
  categoriesCache = null
}

/** 公开工具列表：优先 API，失败回退种子 */
export async function loadHubTools(): Promise<HubTool[]> {
  if (toolsCache) return toolsCache
  if (!toolsCachePromise) {
    toolsCachePromise = fetchTools()
      .then((res) => {
        const list = (res.data.data ?? []).map(toolFromApi)
        toolsCache = list.length > 0 ? list : SEED_TOOLS.map(toolFromSeed)
        return toolsCache
      })
      .catch(() => {
        toolsCache = SEED_TOOLS.map(toolFromSeed)
        return toolsCache
      })
      .finally(() => {
        toolsCachePromise = null
      })
  }
  return toolsCachePromise
}

export async function loadHubToolCategories(): Promise<ToolCategoryDto[]> {
  if (categoriesCache) return categoriesCache
  try {
    const res = await fetchToolCategories()
    categoriesCache = res.data.data ?? []
    if (categoriesCache.length > 0) return categoriesCache
  } catch {
    /* 降级 */
  }
  const names = [...new Set(SEED_TOOLS.map((t) => t.category))]
  categoriesCache = names.map((name, i) => ({
    id: i + 1,
    name,
    slug: `seed-${i}`,
    sortOrder: (i + 1) * 10,
  }))
  return categoriesCache
}

export async function loadHubToolBySlug(slug: string): Promise<HubTool | null> {
  try {
    const res = await fetchToolBySlug(slug)
    if (res.data.data) return toolFromApi(res.data.data)
  } catch {
    /* 降级种子 */
  }
  const seed = SEED_TOOLS.find((t) => t.slug === slug)
  return seed ? toolFromSeed(seed) : null
}

export async function loadFeaturedHubTools(limit = 4): Promise<HubTool[]> {
  const all = await loadHubTools()
  const featured = all.filter((t) => t.featured)
  return (featured.length > 0 ? featured : all).slice(0, limit)
}

export function filterHubToolsByCategoryName(tools: HubTool[], categoryName: string): HubTool[] {
  if (!categoryName || categoryName === '全部') return tools
  return tools.filter((t) => t.category === categoryName)
}
