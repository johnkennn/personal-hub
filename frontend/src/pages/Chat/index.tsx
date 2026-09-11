import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Space, Typography } from 'antd'
import { ClearOutlined, MenuOutlined, SendOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

import { runAiTool } from '../../api/aiTools'
import { usePageMeta } from '../../hooks/usePageMeta'
import {
  articleDetailPath,
  ROUTES,
  SITE_BRAND,
} from '../../router/paths'
import {
  countSearchHits,
  searchCatalog,
  type CatalogSearchResult,
} from '../../services/globalSearch'
import {
  clearChatMessages,
  loadChatMessages,
  loadChatMode,
  saveChatMessages,
  saveChatMode,
  type ChatHit,
  type ChatMessage,
} from '../../utils/chatStorage'
import {
  CHAT_MODE_GROUPS,
  CHAT_MODES,
  getChatMode,
  type ChatModeId,
} from './chatModes'
import styles from './Chat.module.css'

type IntentResult = {
  text: string
  actions?: { label: string; to: string }[]
  hits?: ChatHit[]
  autoNavigate?: string
}

/** 去掉「搜索/找一下」等口语，留下关键词 */
function extractSearchQuery(raw: string): string {
  let s = raw.trim()
  s = s.replace(
    /^(请|帮我|麻烦你?)?(搜索|搜一下|搜下|搜搜|查找|找一下|找下|查一下|检索一下|检索|搜)(一下|下)?[:：\s]*/i,
    '',
  )
  s = s.replace(/相关的?(评测|测评|文章|工具|产品|ai)?$/i, '')
  s = s.replace(/(的)?(评测|测评|文章)$/i, '')
  return s.replace(/\s+/g, ' ').trim()
}

function hitsFromCatalog(result: CatalogSearchResult): ChatHit[] {
  const tools: ChatHit[] = result.tools.map((t) => ({
    kind: 'tool',
    title: t.title,
    to: t.href,
    meta: t.hint ?? t.category,
  }))
  const reviews: ChatHit[] = result.reviews.map((r) => ({
    kind: 'review',
    title: r.title,
    to: articleDetailPath(r.id),
    meta: r.authorName ? `作者 ${r.authorName}` : 'AI评测',
  }))
  return [...tools, ...reviews]
}

function formatSearchReply(keyword: string, result: CatalogSearchResult): IntentResult {
  const hits = hitsFromCatalog(result)
  const toolN = result.tools.length
  const reviewN = result.reviews.length
  const parts = [
    toolN ? `${toolN} 个产品` : '',
    reviewN ? `${reviewN} 篇评测` : '',
  ].filter(Boolean)
  return {
    text: `找到与「${keyword}」相关的 ${parts.join('、')}，点击下方条目可打开：`,
    hits,
    actions: [
      { label: '打开AI导航', to: ROUTES.TOOLS },
      { label: '打开AI评测', to: ROUTES.ARTICLES },
    ],
  }
}

async function replyInChatMode(input: string): Promise<IntentResult> {
  const q = input.trim().toLowerCase()
  const raw = input.trim()

  if (!raw) {
    return { text: '可以再说具体一点，例如「搜豆包」或切换到左侧技能模式办事。' }
  }

  if (/你好|您好|嗨|hi\b|hello|早上好|晚上好|下午好/.test(q)) {
    return {
      text: '你好！可以直接搜产品或评测，也可以说说想找的 AI。写文案、翻译等请用左侧技能模式。',
    }
  }

  if (/谢谢|感谢|多谢/.test(q)) {
    return { text: '不客气。还有需要随时叫我。' }
  }

  if (/你是谁|你叫什么|介绍一下你|什么助手/.test(q)) {
    return {
      text: `我是 ${SITE_BRAND} 聊天检索助手：负责问答、站内导流，以及模糊搜索已收录的产品与评测。专业技能请在左侧切换模式。`,
    }
  }

  if (/翻译|简历|画图|生图|识图|视频|合同|总结|摘要|word|excel|ppt|pdf/.test(q)) {
    return {
      text: '这类任务请切换到左侧对应技能模式（文案 / 翻译 / 简历 / 图像 / 识别 / 内容总结 / 合同等）。',
    }
  }

  if (/商品描述|写文案|生成描述|卖点文案/.test(q)) {
    return {
      text: '请切换到左侧「文案写作」模式，在输入框里直接描述卖点、受众与语气即可生成。',
    }
  }

  const keyword = extractSearchQuery(raw)
  const explicitSearch = /搜索|搜一下|搜下|查找|找一下|检索|有没有|相关/.test(q)
  const sectionOnly =
    /^(评测|测评|优惠|折扣|导航|发现|关于|联系)(页|列表)?$/.test(keyword.toLowerCase()) ||
    /^(打开|去|看看)?(ai)?(评测|测评|优惠|导航|发现|关于)$/.test(q)

  if (keyword && !sectionOnly && (explicitSearch || keyword.length >= 2)) {
    const result = await searchCatalog(keyword)
    if (countSearchHits(result) > 0) {
      return formatSearchReply(keyword, result)
    }
    if (explicitSearch) {
      return {
        text: `没有找到与「${keyword}」匹配的产品或评测。可以换个词再试，或去导航 / 评测浏览。`,
        actions: [
          { label: '打开AI导航', to: ROUTES.TOOLS },
          { label: '打开AI评测', to: ROUTES.ARTICLES },
        ],
      }
    }
  }

  if (/优惠|折扣|便宜|促销|限时/.test(q)) {
    return {
      text: '可以打开「限时优惠」查看近期活动。',
      actions: [{ label: '打开限时优惠', to: ROUTES.DEALS }],
      autoNavigate: ROUTES.DEALS,
    }
  }

  if (/评测|测评|体验帖/.test(q) && (sectionOnly || keyword.length < 2)) {
    return {
      text: '可以打开「AI评测」浏览体验与对比；也可以说「搜某某评测」做模糊搜索。',
      actions: [{ label: '打开AI评测', to: ROUTES.ARTICLES }],
      autoNavigate: ROUTES.ARTICLES,
    }
  }

  if (
    /导航|分类|找工具|找产品|推荐.*ai|哪个ai|浏览.*产品/.test(q) &&
    !explicitSearch &&
    (sectionOnly || /导航|分类/.test(q))
  ) {
    return {
      text: '可以去「AI导航」按分类浏览；也可以直接说产品名让我帮你搜。',
      actions: [{ label: '打开AI导航', to: ROUTES.TOOLS }],
      autoNavigate: ROUTES.TOOLS,
    }
  }

  if (/发现|热门|精选/.test(q)) {
    return {
      text: '发现页汇总了热门产品与精选评测。',
      actions: [{ label: '去发现', to: ROUTES.DISCOVER }],
      autoNavigate: ROUTES.DISCOVER,
    }
  }

  if (/关于|联系|客服|管理员|电话/.test(q)) {
    return {
      text: '关于页有模块说明与管理员联系方式。',
      actions: [{ label: '打开关于', to: ROUTES.ABOUT }],
      autoNavigate: ROUTES.ABOUT,
    }
  }

  if (keyword.length >= 2) {
    const result = await searchCatalog(keyword)
    if (countSearchHits(result) > 0) {
      return formatSearchReply(keyword, result)
    }
  }

  return {
    text: `关于「${raw}」：可以说「搜 + 关键词」找产品或评测；或切换左侧技能办事。真模型问答稍后接入。`,
    actions: [
      { label: '打开AI导航', to: ROUTES.TOOLS },
      { label: '打开AI评测', to: ROUTES.ARTICLES },
    ],
  }
}

function draftCopywritingFallback(raw: string): string {
  const brief = raw.replace(/\s+/g, ' ').trim()
  return [
    '【商品描述草稿】（本地兜底稿，后端暂不可用）',
    '',
    `根据你提供的信息：「${brief.slice(0, 180)}${brief.length > 180 ? '…' : ''}」`,
    '',
    '标题建议：一款贴近真实需求的好物，细节看得见。',
    '',
    '正文：',
    '它把核心卖点说清楚——好用、好懂、好下手。无论你是日常自用还是送礼，都能快速看懂亮点与适用场景。',
    '',
    '需要我改成更短/更正式/更口语，直接继续说即可。',
  ].join('\n')
}

async function replyInSkillMode(mode: ChatModeId, input: string): Promise<IntentResult> {
  const m = getChatMode(mode)
  const raw = input.trim()
  if (!raw) {
    return { text: '请输入内容后再发送。' }
  }

  if (!m.ready) {
    return {
      text: `「${m.label}」即将开放，当前还不能处理请求。你可以先回「聊天检索」搜产品，或换已开放的技能。`,
    }
  }

  if (mode === 'copywriting') {
    try {
      const res = await runAiTool('copywriting', raw)
      const data = res.data.data
      const quotaHint =
        data.remainingQuota >= 0
          ? `\n\n（今日剩余额度 ${data.remainingQuota}/${data.dailyQuota}）`
          : ''
      return { text: `${data.text}${quotaHint}` }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        ''
      if (msg) {
        return { text: msg }
      }
      return { text: draftCopywritingFallback(raw) }
    }
  }

  return { text: '已收到。' }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ChatPage() {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<ChatModeId>(() => loadChatMode())
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages(loadChatMode()))
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentMode = useMemo(() => getChatMode(mode), [mode])

  usePageMeta({
    title: currentMode.label,
    description: '聊天检索与技能：搜产品/评测，或用文案、视觉与文档助手。',
  })

  useEffect(() => {
    saveChatMessages(mode, messages)
  }, [mode, messages])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, busy, mode])

  function switchMode(next: ChatModeId) {
    if (next === mode) return
    saveChatMode(next)
    setMode(next)
    setMessages(loadChatMessages(next))
    setDraft('')
    setSidebarOpen(false)
  }

  function resetChat() {
    clearChatMessages(mode)
    setMessages(loadChatMessages(mode))
    setDraft('')
  }

  async function send(text: string) {
    const content = text.trim()
    if (!content || busy) return

    setDraft('')
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: content }])
    setBusy(true)

    try {
      const intent =
        mode === 'chat'
          ? await replyInChatMode(content)
          : await replyInSkillMode(mode, content)

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          text: intent.text,
          actions: intent.actions,
          hits: intent.hits,
        },
      ])

      if (intent.autoNavigate) {
        window.setTimeout(() => navigate(intent.autoNavigate!), 650)
      }
    } finally {
      setBusy(false)
    }
  }

  const grouped = useMemo(() => {
    return CHAT_MODE_GROUPS.map((group) => ({
      group,
      items: CHAT_MODES.filter((m) => m.group === group),
    }))
  }, [])

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ph-scroll ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHead}>
          <Typography.Text className={styles.sidebarTitle}>模式</Typography.Text>
        </div>
        {grouped.map(({ group, items }) => (
          <div key={group} className={styles.modeGroup}>
            <div className={styles.modeGroupLabel}>{group}</div>
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${styles.modeItem} ${mode === m.id ? styles.modeItemActive : ''}`}
                onClick={() => switchMode(m.id)}
              >
                <span className={styles.modeLabel}>{m.label}</span>
                <span className={styles.modeBlurb}>
                  {m.ready ? m.blurb : '即将开放'}
                </span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className={styles.sidebarMask}
          aria-label="关闭模式菜单"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className={styles.shell}>
        <header className={styles.top}>
          <div className={styles.topRow}>
            <div className={styles.topLeft}>
              <Button
                type="text"
                className={styles.menuBtn}
                icon={<MenuOutlined />}
                aria-label="模式"
                onClick={() => setSidebarOpen((v) => !v)}
              />
              <div>
                <Typography.Title level={4} className={styles.title}>
                  {currentMode.label}
                </Typography.Title>
                <Typography.Paragraph className={styles.sub} type="secondary">
                  {mode === 'chat'
                    ? '问答、导流，也可模糊搜产品与评测。'
                    : currentMode.blurb}
                </Typography.Paragraph>
              </div>
            </div>
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={resetChat}
              disabled={busy || messages.length <= 1}
            >
              清空
            </Button>
          </div>
        </header>

        <div className={`${styles.list} ph-scroll`} ref={listRef}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              className={m.role === 'user' ? styles.rowUser : styles.rowAssistant}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}>
                <p className={styles.bubbleText}>{m.text}</p>
                {m.hits?.length ? (
                  <ul className={styles.hitList}>
                    {m.hits.map((h) => (
                      <li key={`${h.kind}-${h.to}-${h.title}`}>
                        <Link to={h.to} className={styles.hitLink}>
                          <span className={styles.hitKind}>
                            {h.kind === 'tool' ? '产品' : '评测'}
                          </span>
                          <span className={styles.hitTitle}>{h.title}</span>
                          {h.meta ? <span className={styles.hitMeta}>{h.meta}</span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {m.actions?.length ? (
                  <Space wrap size={[8, 8]} className={styles.actions}>
                    {m.actions.map((a) => (
                      <Link key={a.to + a.label} to={a.to}>
                        <Button size="small">{a.label}</Button>
                      </Link>
                    ))}
                  </Space>
                ) : null}
              </div>
            </motion.div>
          ))}
          {busy ? (
            <div className={styles.rowAssistant}>
              <div className={styles.bubbleAssistant}>
                <p className={styles.typing}>
                  {mode === 'chat' ? '正在检索…' : '正在思考…'}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <form
          className={styles.composer}
          onSubmit={(e) => {
            e.preventDefault()
            void send(draft)
          }}
        >
          <Input.TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={currentMode.placeholder}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                void send(draft)
              }
            }}
          />
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={busy}
            disabled={!draft.trim()}
          >
            发送
          </Button>
        </form>
      </div>
    </div>
  )
}
