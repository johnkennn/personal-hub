/**
 * 轻量规则意图路由（可升级为后端 / LLM Router）。
 * 原则：搜产品优先于模糊办事；冲突或低置信 → clarify，不瞎跑。
 */

export type SkillSlug = 'copywriting' | 'translate' | 'resume' | 'contract' | 'summary'

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

export type RouteOverride = SkillSlug | 'search' | null

function hasSearchCue(q: string): boolean {
  return /搜索|搜一下|搜下|搜搜|查找|找一下|找下|查一下|检索|有没有|相关|哪个好|有哪些/.test(
    q,
  )
}

function hasSkillCue(q: string): boolean {
  return /翻译|译成|润色|简历|文案|商品描述|卖点|合同|总结|摘要|识别|画图|生图/.test(q)
}

/**
 * @param override 用户点了追问选项时强制走某意图
 */
export function routeChatIntent(rawInput: string, override?: RouteOverride): ChatRouteResult {
  const raw = rawInput.trim()
  const q = raw.toLowerCase()

  if (override === 'search') {
    const query = raw.replace(/^(帮我)?(搜索|搜)\s*/i, '').trim() || raw
    return { kind: 'search', query }
  }
  if (
    override === 'copywriting' ||
    override === 'translate' ||
    override === 'resume' ||
    override === 'contract' ||
    override === 'summary'
  ) {
    return { kind: 'skill', slug: override, prompt: raw }
  }

  if (!raw) {
    return {
      kind: 'clarify',
      text: '可以说具体一点，例如「搜豆包」，或「译成英文：你好」。',
      options: [
        { id: 'search', label: '搜产品 / 评测' },
        { id: 'copywriting', label: '写文案' },
        { id: 'translate', label: '翻译' },
      ],
    }
  }

  if (/你好|您好|嗨|hi\b|hello|早上好|晚上好|下午好/.test(q)) {
    return {
      kind: 'smalltalk',
      text: '你好！直接说「搜 + 关键词」找产品，或说明要翻译 / 写文案 / 润色简历。拿不准时我会先问你。',
    }
  }
  if (/谢谢|感谢|多谢/.test(q)) {
    return { kind: 'smalltalk', text: '不客气，还有需要随时说。' }
  }
  if (/你是谁|你叫什么|介绍一下你|什么助手/.test(q)) {
    return {
      kind: 'smalltalk',
      text: '我是 AI Tools Hub 统一聊天助手：可搜站内产品与评测，也可在对话里做翻译、文案、简历润色等。关闭本标签页后，对话不会保留在服务器。',
    }
  }

  // —— 搜 vs 办事冲突：同时像搜又像办事 → 追问（搜产品优先级在选项顺序上体现）——
  if (hasSearchCue(q) && hasSkillCue(q)) {
    return {
      kind: 'clarify',
      text: '这句话既像「搜产品」又像「办事」。请选一个，我按你的选择来：',
      options: [
        { id: 'search', label: '搜产品 / 评测' },
        { id: 'translate', label: '翻译' },
        { id: 'copywriting', label: '写文案' },
        { id: 'resume', label: '简历优化' },
        { id: 'summary', label: '总结提炼' },
        { id: 'contract', label: '合同风险提示' },
      ],
    }
  }

  // —— 明确技能（无搜冲突时）——
  if (/译成|翻译成|翻译成|翻译为|请翻译|帮我翻译|translate/.test(q) || /^译[:：]/.test(raw)) {
    return { kind: 'skill', slug: 'translate', prompt: raw }
  }
  if (/简历|润色.*经历|优化.*简历|求职信/.test(q)) {
    return { kind: 'skill', slug: 'resume', prompt: raw }
  }
  if (/合同|条款风险|违约责任/.test(q)) {
    return { kind: 'skill', slug: 'contract', prompt: raw }
  }
  if (/总结|摘要|提炼要点|归纳一下/.test(q) && !hasSearchCue(q)) {
    return { kind: 'skill', slug: 'summary', prompt: raw }
  }
  if (/商品描述|写文案|生成描述|卖点文案|营销文案|帮我写.*文案/.test(q)) {
    return { kind: 'skill', slug: 'copywriting', prompt: raw }
  }

  // —— 站点板块（短指令）——
  if (/^(打开|去|看看)?(限时)?(优惠|折扣|促销)$/.test(q) || (/优惠|折扣|促销|限时/.test(q) && q.length < 12)) {
    return { kind: 'section', section: 'deals' }
  }
  if (/^(打开|去)?(ai)?(评测|测评)$/.test(q)) {
    return { kind: 'section', section: 'articles' }
  }
  if (/^(打开|去)?(ai)?导航$/.test(q) || /^分类浏览$/.test(q)) {
    return { kind: 'section', section: 'tools' }
  }
  if (/^(去)?发现$/.test(q) || (/发现|热门|精选/.test(q) && q.length < 10)) {
    return { kind: 'section', section: 'discover' }
  }
  if (/关于|联系管理员|客服电话/.test(q) && q.length < 16) {
    return { kind: 'section', section: 'about' }
  }

  // —— 搜索优先：显式搜，或像产品名 ——
  const searchQuery = extractSearchQuery(raw)
  if (hasSearchCue(q) && searchQuery.length >= 1) {
    return { kind: 'search', query: searchQuery }
  }

  // 模糊办事词但材料不足 → 追问
  if (/帮我|弄一下|处理一下|看一下这份|优化一下|改一下/.test(q) && !hasSearchCue(q)) {
    return {
      kind: 'clarify',
      text: '想让我具体做什么？选一项（也可再发一段更完整的说明）：',
      options: [
        { id: 'search', label: '搜产品 / 评测' },
        { id: 'copywriting', label: '写文案' },
        { id: 'translate', label: '翻译' },
        { id: 'resume', label: '简历优化' },
        { id: 'summary', label: '总结提炼' },
        { id: 'contract', label: '合同风险提示' },
      ],
    }
  }

  // 默认：当关键词去搜；搜不到由调用方兜底说明
  if (searchQuery.length >= 2) {
    return { kind: 'search', query: searchQuery }
  }

  return {
    kind: 'clarify',
    text: '还不太确定你的意图。请选一个方向：',
    options: [
      { id: 'search', label: '搜产品 / 评测' },
      { id: 'copywriting', label: '写文案' },
      { id: 'translate', label: '翻译' },
      { id: 'resume', label: '简历优化' },
    ],
  }
}

/** 去掉「搜索/找一下」等口语，留下关键词 */
export function extractSearchQuery(raw: string): string {
  let s = raw.trim()
  s = s.replace(
    /^(请|帮我|麻烦你?)?(搜索|搜一下|搜下|搜搜|查找|找一下|找下|查一下|检索一下|检索|搜)(一下|下)?[:：\s]*/i,
    '',
  )
  s = s.replace(/相关的?(评测|测评|文章|工具|产品|ai)?$/i, '')
  s = s.replace(/(的)?(评测|测评|文章)$/i, '')
  return s.replace(/\s+/g, ' ').trim()
}

export const DISCLAIMERS: Record<'resume' | 'contract', string> = {
  resume:
    '【说明】以下简历建议仅供参考，不构成录用或求职结果保证。关闭本标签页后，对话内容不会保留在服务器。',
  contract:
    '【重要】以下仅为条款风险提示草稿，不构成法律意见或正式审查结论。请咨询持证律师。关闭本标签页后，原文不会保留在服务器。',
}
