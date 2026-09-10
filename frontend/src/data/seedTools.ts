import { toolDetailPath } from '../router/paths'

/** 种子 AI 产品：Tool API 上线前供导航页与聊天检索共用 */
export type SeedTool = {
  slug: string
  name: string
  category: string
  keywords: string[]
  /** 一句话摘要（列表卡） */
  summary: string
  /** 详情页较长介绍 */
  intro: string
  /** 适合谁 */
  audience: string
  /** 典型用法 */
  useCases: string[]
  pricing: string
  tags: string[]
  pros: string[]
  cons: string[]
  websiteUrl: string
  featured?: boolean
}

export const TOOL_CATEGORIES = [
  '全部',
  'AI对话',
  'AI编程',
  'AI绘画',
  'AI视频',
  'AI办公',
] as const

export type ToolCategoryFilter = (typeof TOOL_CATEGORIES)[number]

export const SEED_TOOLS: SeedTool[] = [
  {
    slug: 'doubao',
    name: '豆包',
    category: 'AI对话',
    keywords: ['豆包', '字节', '对话'],
    summary: '字节跳动出品的对话助手，适合日常问答、写作与轻度办公。',
    intro:
      '豆包是面向大众用户的对话式 AI 助手。你可以把它当成随时可问的「第二大脑」：查资料、改文案、列提纲、解释概念，都能用口语化方式开聊。中文表达较自然，对日常办公与学习场景友好；若你需要更硬核的专业推理或大型代码库改造，建议再结合专用编程工具对比体验。',
    audience: '学生、内容创作者、轻办公用户，以及想先上手对话 AI 的新手。',
    useCases: [
      '日常问答与概念解释',
      '短文案、大纲、邮件草稿',
      '会议纪要整理与待办拆解',
      '轻度翻译与润色',
    ],
    pricing: '免费 + 会员',
    tags: ['中文', '免费起步'],
    pros: ['中文体验自然', '入口多、上手快', '适合碎片化提问'],
    cons: ['专业深度因场景而异', '复杂长任务需分段引导'],
    websiteUrl: 'https://www.doubao.com',
    featured: true,
  },
  {
    slug: 'yuanbao',
    name: '元宝',
    category: 'AI对话',
    keywords: ['元宝', '腾讯'],
    summary: '腾讯系对话助手，偏日常问答与内容创作辅助。',
    intro:
      '元宝定位为贴近腾讯生态的对话助手，适合日常问答、内容灵感与轻度创作辅助。若你已经习惯微信等腾讯产品，可以把它当作补充生产力入口；具体能力边界建议以官网与近期版本为准，并和同类对话产品横向对比。',
    audience: '习惯腾讯产品生态、需要中文对话与轻创作的用户。',
    useCases: ['日常问答', '短内容灵感', '文案润色', '学习答疑'],
    pricing: '免费 + 增值',
    tags: ['中文', '社交生态'],
    pros: ['中文友好', '与腾讯产品协同潜力', '上手成本低'],
    cons: ['能力边界需实测', '专业场景可能不如专用工具'],
    websiteUrl: 'https://yuanbao.tencent.com',
  },
  {
    slug: 'qwen',
    name: '通义千问',
    category: 'AI对话',
    keywords: ['千问', '通义', 'qwen', '阿里'],
    summary: '阿里通义大模型对话产品，适合写作、总结与多轮问答。',
    intro:
      '通义千问覆盖写作、总结、多轮问答等常见需求，并常与阿里云通义生态工具联动。中文理解表现稳定，适合把长材料压成要点、生成结构化提纲，或做多轮迭代改稿。入口可能分散在网页与云产品中，第一次用建议从官网主入口开始。',
    audience: '需要中文写作、总结与办公辅助的个人与团队用户。',
    useCases: ['长文总结与要点提炼', '多轮改稿', '办公提纲与表格思路', '知识问答'],
    pricing: '免费额度 + 付费',
    tags: ['中文', '多模态'],
    pros: ['中文理解强', '生态工具多', '总结与结构化表达稳'],
    cons: ['界面入口较分散', '套餐与额度需留意'],
    websiteUrl: 'https://tongyi.aliyun.com',
    featured: true,
  },
  {
    slug: 'deepseek',
    name: 'DeepSeek',
    category: 'AI编程',
    keywords: ['deepseek', '深度求索', '编程'],
    summary: '偏推理与编程的对话模型，适合代码、解题与长文梳理。',
    intro:
      'DeepSeek 在推理与编程向任务上口碑较好，常见用法包括写/改代码、梳理解题步骤、整理长文逻辑。对预算敏感又想要较强推理表现的用户很有吸引力。产品形态与套餐更新较快，请以官网最新说明为准。',
    audience: '开发者、学生、需要性价比推理能力的重度问答用户。',
    useCases: ['代码编写与排错', '算法/题目拆解', '技术文档梳理', '长链路推理问答'],
    pricing: '免费额度 + API',
    tags: ['编程', '推理'],
    pros: ['性价比高', '代码场景口碑好', '推理链路较清晰'],
    cons: ['产品形态更新快', '企业合规需自行评估'],
    websiteUrl: 'https://www.deepseek.com',
    featured: true,
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    category: 'AI对话',
    keywords: ['chatgpt', 'gpt', 'openai'],
    summary: 'OpenAI 对话产品，通用问答、写作与轻度分析都常见。',
    intro:
      'ChatGPT 是全球使用最广的通用对话产品之一，适合写作、头脑风暴、轻度分析与多轮协作。生态插件与自定义能力成熟，英语场景优势明显。部分地区访问与支付方式需自行准备；若主攻中文办公，也可与国内产品对照试用。',
    audience: '需要通用 AI 助手、英文写作或跨领域头脑风暴的用户。',
    useCases: ['英文写作与润色', '方案头脑风暴', '学习辅导', '轻度数据分析思路'],
    pricing: '免费 + Plus',
    tags: ['英文强', '插件生态'],
    pros: ['通用能力稳', '生态成熟', '多轮协作体验好'],
    cons: ['部分地区访问与支付需自行解决', '免费额度有限'],
    websiteUrl: 'https://chatgpt.com',
  },
  {
    slug: 'gemini',
    name: 'Gemini',
    category: 'AI对话',
    keywords: ['gemini', '谷歌', 'google'],
    summary: 'Google 多模态助手，适合检索、总结与图文理解。',
    intro:
      'Gemini 强调多模态与长上下文，适合结合检索做总结、理解图文材料，并与 Google 文档/搜索生态联动。中文体验因任务类型可能波动，建议用你的真实材料试一轮再决定是否作为主力。',
    audience: '依赖 Google 生态、需要图文理解与长文处理的用户。',
    useCases: ['网页/文档总结', '图文理解', '研究提纲', '多文件信息整合'],
    pricing: '免费 + Advanced',
    tags: ['多模态', '搜索'],
    pros: ['与 Google 生态结合', '长上下文', '多模态能力'],
    cons: ['中文体验因场景波动', '高级功能常在付费档'],
    websiteUrl: 'https://gemini.google.com',
  },
  {
    slug: 'midjourney',
    name: 'Midjourney',
    category: 'AI绘画',
    keywords: ['midjourney', 'mj', '绘画', '画图'],
    summary: '以审美风格著称的图像生成工具，适合概念图与视觉探索。',
    intro:
      'Midjourney 以画面风格与审美完成度见长，常用于概念设计、氛围图、品牌视觉探索。工作流多与 Discord 结合，需要一定学习成本；订阅制下按需选择档位。若你更想要本地/网页一体化生图，可与其它绘画工具对比。',
    audience: '设计师、内容创作者、需要高质量概念图的产品与运营同学。',
    useCases: ['概念图与情绪板', '海报/封面灵感', '角色与场景设定', '风格化视觉探索'],
    pricing: '订阅制',
    tags: ['绘画', '订阅'],
    pros: ['画面风格突出', '社区活跃', '适合视觉头脑风暴'],
    cons: ['需订阅', '主要走 Discord 工作流'],
    websiteUrl: 'https://www.midjourney.com',
    featured: true,
  },
  {
    slug: 'runway',
    name: 'Runway',
    category: 'AI视频',
    keywords: ['runway', '视频'],
    summary: '面向创作者的 AI 视频工具，可做生成、剪辑与特效实验。',
    intro:
      'Runway 面向创作者提供生成、剪辑与特效类 AI 视频能力，适合短片实验、广告草图与视觉特效探索。算力消耗与套餐成本需要提前规划；第一次建议用小片段验证流程，再扩大到正式项目。',
    audience: '短视频创作者、广告/影视预演、视觉实验爱好者。',
    useCases: ['文生视频实验', '镜头补全与特效', '短片预演', '素材风格化'],
    pricing: '免费试用 + 订阅',
    tags: ['视频', '创作'],
    pros: ['视频能力前沿', '工具链完整', '适合快速出片实验'],
    cons: ['算力与套餐成本需留意', '成片稳定性因任务而异'],
    websiteUrl: 'https://runwayml.com',
  },
  {
    slug: 'notion-ai',
    name: 'Notion AI',
    category: 'AI办公',
    keywords: ['notion', '办公', '写作'],
    summary: '嵌在 Notion 里的写作与整理助手，适合笔记、摘要与大纲。',
    intro:
      'Notion AI 长在文档工作流内部：写笔记时直接摘要、扩写、改语气，减少「复制到别的聊天框」的打断。适合已经把知识库放在 Notion 的个人与团队；若你几乎不用 Notion，单独买 AI 能力的性价比可能一般。',
    audience: '重度 Notion 用户、知识管理与文档协作团队。',
    useCases: ['笔记摘要', '会议记录整理', '大纲与待办生成', '段落改写润色'],
    pricing: '随 Notion 套餐',
    tags: ['办公', '写作'],
    pros: ['与文档工作流一体', '改写摘要方便', '减少上下文切换'],
    cons: ['重度依赖 Notion 使用习惯', '复杂推理不如专用对话模型'],
    websiteUrl: 'https://www.notion.com/product/ai',
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    category: 'AI编程',
    keywords: ['cursor', '编程', '代码'],
    summary: '面向开发者的 AI 代码编辑器，适合读写项目代码与重构。',
    intro:
      'Cursor 把大模型嵌进编辑器，能结合当前仓库上下文改代码、解释模块、协助重构与写测试。比「纯聊天贴代码」更贴近真实工程。需要一定编程基础才能发挥；注意仓库隐私与权限设置。',
    audience: '前后端开发者、需要在真实项目里结对编程的工程师。',
    useCases: ['读写项目代码', '重构与补测试', '读懂陌生模块', '生成样板代码'],
    pricing: '免费额度 + Pro',
    tags: ['IDE', '编程'],
    pros: ['贴合真实代码库', '改代码效率高', '上下文感知强'],
    cons: ['需要一定编程基础', '大型私有仓库需注意权限'],
    websiteUrl: 'https://cursor.com',
    featured: true,
  },
]

export function listSeedTools(category: ToolCategoryFilter = '全部'): SeedTool[] {
  if (category === '全部') return [...SEED_TOOLS]
  return SEED_TOOLS.filter((t) => t.category === category)
}

export function getSeedTool(slug: string): SeedTool | undefined {
  return SEED_TOOLS.find((t) => t.slug === slug)
}

export function seedToolToCatalogHit(t: SeedTool) {
  return {
    key: t.slug,
    title: t.name,
    category: t.category,
    href: toolDetailPath(t.slug),
    hint: t.category,
  }
}
