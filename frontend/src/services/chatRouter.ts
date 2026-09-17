/**
 * 轻量规则意图路由 + 可选 LLM 路由回退。
 * 站内：搜产品/评测、跳转板块、介绍本站。
 * 其余生成类需求统一走 AI 聊天（调大模型），不再拆多技能入口。
 */

export type SkillSlug = 'chat'

/** 历史气泡选项 id 仍可点；一律映射为 chat / search */
export type RouteOverride =
  | SkillSlug
  | 'search'
  | 'copywriting'
  | 'translate'
  | 'resume'
  | 'contract'
  | 'summary'
  | null

export type ChatRouteResult =
  | { kind: 'search'; query: string }
  | { kind: 'skill'; slug: SkillSlug; prompt: string }
  | {
      kind: 'clarify'
      text: string
      options: { id: string; label: string }[]
    }
  | { kind: 'smalltalk'; text: string }
  | { kind: 'section'; section: 'deals' | 'articles' | 'tools' | 'discover' | 'about' }

export type LlmRouteDto = {
  intent: string
  query?: string | null
}

function hasSearchCue(q: string): boolean {
  return /搜索|搜一下|搜下|搜搜|查找|找一下|找下|查一下|检索|有没有.*?(工具|产品|评测|模型|软件)|哪个好|有哪些.*?(工具|产品|ai|软件)|推荐.*?(工具|产品|软件|模型|ai)|安利|本站.*?(工具|产品|ai|软件)|站内.*?(工具|产品|ai|软件)/.test(
    q,
  )
}

/** 想让小智推荐 / 挑选 AI 产品（优先走站内检索） */
export function looksLikeCatalogRecommend(q: string): boolean {
  const hasProductWord = /工具|产品|软件|模型|ai|助手|平台|应用/.test(q)
  const hasRecommend =
    /推荐|安利|选一个|挑一个|哪个好|哪款|有没有好用|好用的|适合.*(用|做)|求推荐/.test(q)
  const hasSiteScope = /本站|站内|你们站|站点里|导览里|收录/.test(q)
  return (hasRecommend && hasProductWord) || (hasSiteScope && (hasRecommend || hasProductWord))
}

function hasGenerativeCue(q: string): boolean {
  return /翻译|译成|润色|简历|文案|商品描述|卖点|合同|总结|摘要|识别|画图|生图|图中|图片里|这张图|看图|图里|弄一下|处理一下|优化一下|改一下/.test(
    q,
  )
}

/** 用户在问「图里是什么」一类（配合附件走识图） */
export function looksLikeImageQuestion(q: string): boolean {
  return /图中|图片里|图片中|这张图|照片里|图里|看图|识图|识别图片|描述.*(图|照片)|图.*(什么|内容|描述)|照片.*(什么|内容)/.test(
    q,
  )
}

function looksLikeQuestion(q: string): boolean {
  return /[？?]|(什么|怎么|怎样|为何|为什么|多少|几号|日期|今天|明天|昨天|是否|能否|可以吗|吗$|呢$|嘛$)/.test(
    q,
  )
}

const CLARIFY_OPTIONS = [
  { id: 'search', label: '搜产品 / 评测' },
  { id: 'chat', label: '大模型' },
] as const

function toChatSkill(raw: string): ChatRouteResult {
  return { kind: 'skill', slug: 'chat', prompt: withLocalDateHint(raw) }
}

/**
 * 高置信规则：命中则无需调模型；拿不准返回 null。
 */
export function routeChatIntentConfident(
  rawInput: string,
  override?: RouteOverride,
): ChatRouteResult | null {
  const raw = rawInput.trim()
  const q = raw.toLowerCase()

  if (override === 'search') {
    const query = raw.replace(/^(帮我)?(搜索|搜)\s*/i, '').trim() || raw
    return { kind: 'search', query }
  }
  if (
    override === 'chat' ||
    override === 'copywriting' ||
    override === 'translate' ||
    override === 'resume' ||
    override === 'contract' ||
    override === 'summary'
  ) {
    return toChatSkill(raw)
  }

  if (!raw) {
    return {
      kind: 'clarify',
      text: '可以说具体一点哦～例如「搜豆包」，或直接提问让小智帮你处理。',
      options: [...CLARIFY_OPTIONS],
    }
  }

  // 翻译/文案等优先于寒暄：避免「翻译：你好…」被当成打招呼
  if (hasGenerativeCue(q) || looksLikeImageQuestion(q)) {
    return toChatSkill(raw)
  }

  // 仅整句寒暄才走 smalltalk（不要用「包含你好」）
  if (
    /^(你好|您好|嗨|hi|hello|早上好|晚上好|下午好)([啊呀哇哦呢吗]?[.!！。～\s]*)$/i.test(
      q.trim(),
    )
  ) {
    return {
      kind: 'smalltalk',
      text: '嗨～小智在呢！可以直接提问，或说「搜 + 关键词」找站内产品与评测。',
    }
  }
  if (/^(谢谢|感谢|多谢)([啦了哦啊]?[.!！。～\s]*)$/i.test(q.trim())) {
    return { kind: 'smalltalk', text: '嘿嘿不客气，还有需要随时叫小智～' }
  }
  if (/你是谁|你叫什么|介绍一下你|什么助手/.test(q)) {
    return {
      kind: 'smalltalk',
      text: '小智是「小智AI」的站内助手：能帮你搜产品与评测，也能问答、翻译、文案、总结～',
    }
  }

  // 站内板块跳转（明确）
  if (/^(打开|去|看看)?(ai\s*)?(优惠|折扣|促销|限时优惠)$/i.test(q) || (/优惠|折扣|促销|限时/.test(q) && q.length < 12)) {
    return { kind: 'section', section: 'deals' }
  }
  if (/^(打开|去)?(ai)?(评测|测评)$/.test(q)) {
    return { kind: 'section', section: 'articles' }
  }
  if (/^(打开|去)?(ai)?(导航|导览)$/.test(q) || /^分类浏览$/.test(q)) {
    return { kind: 'section', section: 'tools' }
  }
  if (/^(去)?发现$/.test(q) || (/发现|热门|精选/.test(q) && q.length < 10)) {
    return { kind: 'section', section: 'discover' }
  }
  if (/关于|联系管理员|客服电话/.test(q) && q.length < 16) {
    return { kind: 'section', section: 'about' }
  }

  const searchQuery = extractSearchQuery(raw)
  if (hasSearchCue(q) && hasGenerativeCue(q)) {
    return {
      kind: 'clarify',
      text: '这句话既像「搜产品」又像「找 AI 帮忙」。选一个就好～',
      options: [...CLARIFY_OPTIONS],
    }
  }
  if (hasSearchCue(q) && searchQuery.length >= 1) {
    return { kind: 'search', query: searchQuery }
  }

  // 推荐 / 找站内 AI 产品：优先检索目录，避免直接调大模型瞎编
  if (
    looksLikeCatalogRecommend(q) &&
    !looksLikeImageQuestion(q) &&
    !/文案|翻译|译成|简历|合同|总结|摘要|润色|生图|画图/.test(q)
  ) {
    const query = extractSearchQuery(raw) || raw
    if (query.length >= 1) {
      return { kind: 'search', query }
    }
  }

  // 生成类 / 普通问句：统一 AI 聊天（调大模型）；短歧义句再追问
  if (
    /帮我|弄一下|处理一下|看一下这份|优化一下|改一下/.test(q) &&
    !hasSearchCue(q) &&
    !looksLikeCatalogRecommend(q) &&
    !looksLikeQuestion(q) &&
    raw.length < 12
  ) {
    return {
      kind: 'clarify',
      text: '想让小智具体做什么？选一项（也可再发一段更完整的说明）～',
      options: [...CLARIFY_OPTIONS],
    }
  }

  // 拿不准的短词交给 LLM 路由；其余直接聊天
  if (raw.length <= 16 && !looksLikeQuestion(q) && !hasGenerativeCue(q) && !hasSearchCue(q)) {
    return null
  }

  return toChatSkill(raw)
}

/** 完整规则兜底（模型不可用时） */
export function routeChatIntent(rawInput: string, override?: RouteOverride): ChatRouteResult {
  const hit = routeChatIntentConfident(rawInput, override)
  if (hit) return hit

  const raw = rawInput.trim()
  const q = raw.toLowerCase()
  const searchQuery = extractSearchQuery(raw)

  if (
    searchQuery.length >= 2 &&
    searchQuery.length <= 16 &&
    !looksLikeQuestion(q) &&
    !/[，。！？、]/.test(raw)
  ) {
    return { kind: 'search', query: searchQuery }
  }

  return toChatSkill(raw)
}

/** 把后端 LLM 路由结果转成前端统一结构 */
export function chatRouteFromLlm(data: LlmRouteDto, rawInput: string): ChatRouteResult {
  const raw = rawInput.trim()
  const intent = (data.intent || '').trim().toLowerCase()
  const query = (data.query || '').trim() || extractSearchQuery(raw) || raw

  switch (intent) {
    case 'search':
      return { kind: 'search', query }
    case 'translate':
    case 'copywriting':
    case 'resume':
    case 'summary':
    case 'contract':
    case 'chat':
      return toChatSkill(raw)
    case 'deals':
    case 'section_deals':
      return { kind: 'section', section: 'deals' }
    case 'articles':
    case 'section_articles':
      return { kind: 'section', section: 'articles' }
    case 'tools':
    case 'section_tools':
      return { kind: 'section', section: 'tools' }
    case 'discover':
    case 'section_discover':
      return { kind: 'section', section: 'discover' }
    case 'about':
    case 'section_about':
      return { kind: 'section', section: 'about' }
    case 'clarify':
      return {
        kind: 'clarify',
        text: '还不太确定你的意图呢。选一个方向就好～',
        options: [...CLARIFY_OPTIONS],
      }
    default:
      return toChatSkill(raw)
  }
}

export function withLocalDateHint(raw: string): string {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  return `${raw}\n\n（参考信息：用户本地日期为 ${today}）`
}

export function extractSearchQuery(raw: string): string {
  let s = raw.trim()
  // 多轮剥离：本站范围词 + 推荐/搜索虚词 +「好用」等
  for (let i = 0; i < 3; i += 1) {
    const before = s
    s = s.replace(/^(本站|站内|你们站|站点里|导览里)(里|中|的)?/i, '')
    s = s.replace(
      /^(请|帮我|麻烦你?|给我)?(搜索|搜一下|搜下|搜搜|查找|找一下|找下|查一下|检索一下|检索|搜|推荐一下|推荐一个|推荐个|推荐|安利一个|安利)(一下|下|一个|个)?[:：\s]*/i,
      '',
    )
    s = s.replace(/^(有没有|求|想要|想找|找个|找一个)/i, '')
    if (s === before) break
  }
  s = s.replace(/好用的?/g, '')
  s = s.replace(/相关的?(评测|测评|文章|工具|产品|ai|软件)?$/i, '')
  s = s.replace(/(的)?(评测|测评|文章)$/i, '')
  s = s.replace(/[？?]+$/g, '')
  return s.replace(/\s+/g, ' ').trim()
}
