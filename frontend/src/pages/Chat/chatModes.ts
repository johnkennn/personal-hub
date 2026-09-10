export type ChatModeId =
  | 'chat'
  | 'copywriting'
  | 'translate'
  | 'resume'
  | 'image-gen'
  | 'vision'
  | 'video'
  | 'doc-summary'
  | 'contract'

export type ChatMode = {
  id: ChatModeId
  label: string
  group: '对话' | '文本' | '视觉' | '文档'
  blurb: string
  placeholder: string
  welcome: string
  ready: boolean
}

/** 侧栏模式：技能一律在聊天输入框内完成，不跳转独立表单页 */
export const CHAT_MODES: ChatMode[] = [
  {
    id: 'chat',
    label: '聊天检索',
    group: '对话',
    blurb: '问答、导流与模糊搜索',
    placeholder: '问问题，或说「搜豆包」「找 Midjourney 评测」…',
    welcome:
      '当前是聊天检索：可以问答、跳转到导航 / 评测 / 优惠，也可以直接搜已收录的 AI 产品与评测（例如「搜通义千问」「找绘画相关评测」）。结果会以可点击列表回复。写文案、总结文档等请切换左侧技能模式。',
    ready: true,
  },
  {
    id: 'copywriting',
    label: '文案写作',
    group: '文本',
    blurb: '商品描述、营销短文',
    placeholder: '描述卖点、受众与语气…',
    welcome:
      '文案写作模式：直接在下方输入卖点、受众和语气，发送后我会在对话里生成文案草稿（可继续追问修改）。',
    ready: true,
  },
  {
    id: 'translate',
    label: '文本翻译',
    group: '文本',
    blurb: '多语言互译',
    placeholder: '粘贴要翻译的文本，并说明目标语言…',
    welcome: '文本翻译模式即将开放。上线后在本对话直接粘贴文本即可翻译，无需跳转。',
    ready: false,
  },
  {
    id: 'resume',
    label: '简历优化',
    group: '文本',
    blurb: '润色与结构调整',
    placeholder: '粘贴简历片段或说明岗位方向…',
    welcome: '简历优化模式即将开放。内容尽量少留存，保护隐私；也在本对话内完成。',
    ready: false,
  },
  {
    id: 'image-gen',
    label: '图像生成',
    group: '视觉',
    blurb: '文生图',
    placeholder: '描述你想生成的画面…',
    welcome: '图像生成模式即将开放：描述画面后在对话中出图，无需另开页面。',
    ready: false,
  },
  {
    id: 'vision',
    label: '图片识别',
    group: '视觉',
    blurb: '理解图片内容',
    placeholder: '先描述图片里想问的问题（上传能力即将接入）…',
    welcome: '图片识别模式即将开放：上传与提问都在本对话完成。',
    ready: false,
  },
  {
    id: 'video',
    label: '视频理解',
    group: '视觉',
    blurb: '摘要与要点',
    placeholder: '说明视频环节或粘贴说明文字…',
    welcome: '视频理解模式即将开放，同样在对话内完成。',
    ready: false,
  },
  {
    id: 'doc-summary',
    label: '内容总结',
    group: '文档',
    blurb: 'Word / Excel / PPT / PDF 等',
    placeholder: '粘贴文档要点，或说明已上传的文件想总结什么…',
    welcome:
      '内容总结模式：支持 Word、Excel、PPT、PDF 等材料的要点提炼与结构化摘要。开放后可在本对话上传或粘贴文本，无需跳转。',
    ready: false,
  },
  {
    id: 'contract',
    label: '合同助手',
    group: '文档',
    blurb: '风险提示草稿',
    placeholder: '粘贴合同片段（仅作风险提示，非法务意见）…',
    welcome:
      '合同助手仅提供风险提示草稿，不构成法律意见。能力开放后也在本对话粘贴文本即可。',
    ready: false,
  },
]

export function getChatMode(id: ChatModeId): ChatMode {
  return CHAT_MODES.find((m) => m.id === id) ?? CHAT_MODES[0]
}

export const CHAT_MODE_GROUPS: ChatMode['group'][] = ['对话', '文本', '视觉', '文档']
