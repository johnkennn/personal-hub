/**
 * 种子「相关评测」：Tool 关联字段就绪前，用于详情页展示。
 * relatedToolSlugs 可多个，对应产品文档「评测可绑定多个 AI 工具」。
 */
export type SeedToolReview = {
  /** 负数 id，避免与真实文章 id 冲突；有 articleId 时优先跳真实详情 */
  id: number
  title: string
  excerpt: string
  authorName: string
  updatedAt: string
  relatedToolSlugs: string[]
  /** 演示热度基数（真实赞评会叠加上去） */
  seedLikes: number
  seedComments: number
  /** 若站点已有同题文章可填，点击进真实详情 */
  articleId?: number
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString()
}

export const SEED_TOOL_REVIEWS: SeedToolReview[] = [
  {
    id: -1001,
    title: '豆包一周体验：日常问答够用吗？',
    excerpt: '用通勤碎片时间追问、改邮件、列提纲，记录中文流畅度与翻车点。',
    authorName: '体验笔记',
    updatedAt: daysAgo(2),
    relatedToolSlugs: ['doubao'],
    seedLikes: 18,
    seedComments: 6,
  },
  {
    id: -1002,
    title: '豆包 vs 通义千问：写短文案谁更省心',
    excerpt: '同一组卖点提示词，对比成稿速度、语气自然度与可直接上架程度。',
    authorName: '横向评测',
    updatedAt: daysAgo(5),
    relatedToolSlugs: ['doubao', 'qwen'],
    seedLikes: 42,
    seedComments: 15,
  },
  {
    id: -1003,
    title: '通义千问做长文总结的三个技巧',
    excerpt: '分段投喂、先要提纲再扩写、用表格收口——实测办公文档场景。',
    authorName: '办公效率',
    updatedAt: daysAgo(8),
    relatedToolSlugs: ['qwen'],
    seedLikes: 27,
    seedComments: 9,
  },
  {
    id: -1004,
    title: 'DeepSeek 写算法题：推理链路实测',
    excerpt: '从读题、拆步骤到给代码，看它是否真的「讲得清」。',
    authorName: '编程向',
    updatedAt: daysAgo(3),
    relatedToolSlugs: ['deepseek'],
    seedLikes: 55,
    seedComments: 21,
  },
  {
    id: -1005,
    title: 'Cursor 两周：在真实仓库里结对编程',
    excerpt: '补测试、重构模块、读陌生代码——哪些提示最有效，哪些会乱改。',
    authorName: '工程实践',
    updatedAt: daysAgo(1),
    relatedToolSlugs: ['cursor', 'deepseek'],
    seedLikes: 63,
    seedComments: 18,
  },
  {
    id: -1006,
    title: 'Midjourney 做品牌情绪板：提示词模板',
    excerpt: '风格锚点、构图词与负面提示，整理一套可复用的出图流程。',
    authorName: '视觉笔记',
    updatedAt: daysAgo(6),
    relatedToolSlugs: ['midjourney'],
    seedLikes: 31,
    seedComments: 11,
  },
  {
    id: -1007,
    title: 'ChatGPT Plus 值不值得续：个人向清单',
    excerpt: '从写作、翻译到轻度分析，列出免费档够用与不够用的边界。',
    authorName: '订阅决策',
    updatedAt: daysAgo(12),
    relatedToolSlugs: ['chatgpt'],
    seedLikes: 24,
    seedComments: 14,
  },
  {
    id: -1008,
    title: 'Runway 短片预演：成本与成片稳定性',
    excerpt: '小片段试跑到成片，记录耗时、套餐消耗与返工次数。',
    authorName: '影像实验',
    updatedAt: daysAgo(9),
    relatedToolSlugs: ['runway'],
    seedLikes: 19,
    seedComments: 7,
  },
  {
    id: -1009,
    title: 'Notion AI 能不能替代单独聊天框？',
    excerpt: '在知识库里直接摘要、改写，对比「复制出去问别的模型」的效率。',
    authorName: '知识管理',
    updatedAt: daysAgo(15),
    relatedToolSlugs: ['notion-ai'],
    seedLikes: 16,
    seedComments: 5,
  },
  {
    id: -1010,
    title: 'Gemini 长上下文：一次塞进多份材料',
    excerpt: '会议纪要 + 表格 + 截图，看它整合信息时的遗漏与幻觉。',
    authorName: '多模态体验',
    updatedAt: daysAgo(4),
    relatedToolSlugs: ['gemini'],
    seedLikes: 22,
    seedComments: 8,
  },
  {
    id: -1011,
    title: '元宝轻体验：腾讯生态里的对话助手',
    excerpt: '问答与短文案辅助的初印象，以及和其它中文助手的差异感。',
    authorName: '尝鲜记录',
    updatedAt: daysAgo(11),
    relatedToolSlugs: ['yuanbao', 'doubao'],
    seedLikes: 12,
    seedComments: 4,
  },
]

export function listSeedReviewsForTool(slug: string): SeedToolReview[] {
  return SEED_TOOL_REVIEWS.filter((r) => r.relatedToolSlugs.includes(slug))
}
