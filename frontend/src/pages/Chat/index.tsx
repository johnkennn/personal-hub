import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Space, Typography, Upload, message as antMessage } from 'antd'
import {
  ClearOutlined,
  PaperClipOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { UploadFile } from 'antd/es/upload/interface'

import { runSkillStream } from '../../api/aiTools'
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
  DISCLAIMERS,
  routeChatIntent,
  type RouteOverride,
  type SkillSlug,
} from '../../services/chatRouter'
import {
  clearChatMessages,
  loadChatMessages,
  saveChatMessages,
  type ChatHit,
  type ChatMessage,
} from '../../utils/chatStorage'
import styles from './Chat.module.css'

/** 附件白名单（轻量：前端先拦；后端上传落地后再双检） */
const ACCEPT_EXT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.mp4',
  '.webm',
  '.mov',
]
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_DOC_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 20 * 1024 * 1024

type PendingFile = {
  id: string
  file: File
  kind: 'image' | 'doc' | 'video' | 'text'
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function classifyFile(file: File): PendingFile['kind'] | 'reject' {
  const name = file.name.toLowerCase()
  const type = file.type
  if (type.startsWith('video/') || /\.(mp4|webm|mov)$/.test(name)) return 'video'
  if (type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/.test(name)) return 'image'
  if (/\.(txt|md)$/.test(name) || type === 'text/plain' || type === 'text/markdown') {
    return 'text'
  }
  if (
    type === 'application/pdf' ||
    /\.(pdf|docx?|xlsx?|pptx?)$/.test(name)
  ) {
    return 'doc'
  }
  return 'reject'
}

function validateFile(file: File): string | null {
  const kind = classifyFile(file)
  if (kind === 'reject') {
    return '暂不支持该文件类型。可用：图片、PDF、Office、文本；视频即将支持处理。'
  }
  if (kind === 'image' && file.size > MAX_IMAGE_BYTES) return '图片请不超过 5MB'
  if (kind === 'doc' && file.size > MAX_DOC_BYTES) return '文档请不超过 10MB'
  if (kind === 'video' && file.size > MAX_VIDEO_BYTES) return '视频请不超过 20MB'
  if (kind === 'text' && file.size > 2 * 1024 * 1024) return '文本请不超过 2MB'
  return null
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

function draftCopywritingFallback(raw: string): string {
  const brief = raw.replace(/\s+/g, ' ').trim()
  return [
    '【商品描述草稿】（本地兜底）',
    '',
    `根据：「${brief.slice(0, 180)}${brief.length > 180 ? '…' : ''}」`,
    '',
    '标题建议：一款贴近真实需求的好物。',
    '正文：把核心卖点说清楚——好用、好懂、好下手。',
  ].join('\n')
}

function draftTranslateFallback(raw: string): string {
  return `【译文草稿】（本地兜底）\n\n${raw.slice(0, 240)}`
}

function draftResumeFallback(raw: string): string {
  return [
    DISCLAIMERS.resume,
    '',
    '【简历优化演示】',
    '· 建议用量化结果改写经历（数字、范围、成果）',
    '· 按目标岗位调整关键词',
    '· 删掉空泛形容词',
    '',
    `原文摘录：${raw.slice(0, 200)}${raw.length > 200 ? '…' : ''}`,
  ].join('\n')
}

function draftContractFallback(raw: string): string {
  return [
    DISCLAIMERS.contract,
    '',
    '【风险提示草稿·演示】',
    '· 请核对违约金、管辖、自动续费、数据与隐私条款',
    '· 关键义务是否对等、终止条件是否清晰',
    '',
    `片段摘录：${raw.slice(0, 200)}${raw.length > 200 ? '…' : ''}`,
  ].join('\n')
}

function draftSummaryFallback(raw: string): string {
  return [
    '【内容总结·演示】',
    '（完整文档解析稍后接入；当前按你粘贴的文字提炼）',
    '',
    '要点：',
    `· ${raw.slice(0, 120)}${raw.length > 120 ? '…' : ''}`,
  ].join('\n')
}

async function streamSkillReply(
  slug: SkillSlug,
  content: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  fallback: (raw: string) => string,
) {
  const assistantId = uid()
  setMessages((prev) => [
    ...prev,
    { id: assistantId, role: 'assistant', text: '' },
  ])

  const useApi = slug === 'copywriting' || slug === 'translate' || slug === 'resume'

  async function typeLocal(full: string) {
    let i = 0
    while (i < full.length) {
      const end = Math.min(full.length, i + 6)
      const chunk = full.slice(i, end)
      i = end
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: m.text + chunk } : m,
        ),
      )
      await new Promise((r) => setTimeout(r, 12))
    }
  }

  if (!useApi) {
    await typeLocal(fallback(content))
    return
  }

  try {
    await runSkillStream(slug, content, {
      onDelta: (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, text: m.text + chunk } : m,
          ),
        )
      },
      onDone: () => undefined,
    })
  } catch {
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, text: '' } : m)),
    )
    await typeLocal(fallback(content))
  }
}

export function ChatPage() {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages())
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<PendingFile[]>([])

  usePageMeta({
    title: '聊天',
    description: `${SITE_BRAND} 统一对话：搜产品、翻译、文案、简历与文档助手。`,
  })

  useEffect(() => {
    saveChatMessages(messages)
  }, [messages])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, busy])

  function resetChat() {
    clearChatMessages()
    setMessages(loadChatMessages())
    setDraft('')
    setPending([])
  }

  function onPickFile(file: File) {
    const err = validateFile(file)
    if (err) {
      antMessage.warning(err)
      return Upload.LIST_IGNORE
    }
    const kind = classifyFile(file) as PendingFile['kind']
    if (kind === 'video') {
      antMessage.info('已添加视频。视频理解优先级较低，当前仅保存于本会话，处理能力即将支持。')
    }
    setPending((prev) => [
      ...prev,
      { id: uid(), file, kind },
    ])
    return false
  }

  async function send(text: string, override?: RouteOverride) {
    const content = text.trim()
    if ((!content && pending.length === 0) || busy) return

    const fileNote =
      pending.length > 0
        ? `\n\n（附件 ${pending.length} 个：${pending.map((p) => p.file.name).join('、')}；仅本会话，关闭标签即消失）`
        : ''

    const displayUser = (content || '（仅发送了附件）') + fileNote
    setDraft('')
    const filesSnapshot = pending
    setPending([])
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: displayUser }])
    setBusy(true)

    try {
      // 仅附件、无文字 → 追问用途
      if (!content && filesSnapshot.length > 0) {
        const hasVideo = filesSnapshot.some((f) => f.kind === 'video')
        const hasImage = filesSnapshot.some((f) => f.kind === 'image')
        const hasDoc = filesSnapshot.some((f) => f.kind === 'doc' || f.kind === 'text')
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: hasVideo
              ? '已收到视频（本会话暂存）。视频理解即将支持。若还有文档/图片，可说明用途；或补充文字需求。'
              : '已收到附件（仅存本标签页，关闭即消失）。请选择要我做什么：',
            options: hasImage
              ? [
                  { id: 'summary', label: '描述 / 总结图片内容' },
                  { id: 'copywriting', label: '根据图写文案' },
                ]
              : hasDoc
                ? [
                    { id: 'summary', label: '总结提炼' },
                    { id: 'contract', label: '合同风险提示' },
                    { id: 'translate', label: '翻译' },
                  ]
                : [
                    { id: 'summary', label: '总结提炼' },
                    { id: 'copywriting', label: '写文案' },
                  ],
          },
        ])
        return
      }

      const route = routeChatIntent(content, override)

      if (route.kind === 'clarify') {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: route.text,
            options: route.options,
          },
        ])
        return
      }

      if (route.kind === 'smalltalk') {
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: 'assistant', text: route.text },
        ])
        return
      }

      if (route.kind === 'section') {
        const map = {
          deals: {
            text: '可以打开「限时优惠」查看近期活动。',
            to: ROUTES.DEALS,
            label: '打开限时优惠',
          },
          articles: {
            text: '可以打开「AI评测」浏览体验与对比。',
            to: ROUTES.ARTICLES,
            label: '打开AI评测',
          },
          tools: {
            text: '可以去「AI导览」按分类浏览。',
            to: ROUTES.TOOLS,
            label: '打开AI导览',
          },
          discover: {
            text: '发现页汇总了热门产品与精选评测。',
            to: ROUTES.DISCOVER,
            label: '去发现',
          },
          about: {
            text: '关于页有模块说明与联系方式。',
            to: ROUTES.ABOUT,
            label: '打开关于',
          },
        }[route.section]
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: map.text,
            actions: [{ label: map.label, to: map.to }],
          },
        ])
        window.setTimeout(() => navigate(map.to), 650)
        return
      }

      if (route.kind === 'search') {
        const result = await searchCatalog(route.query)
        if (countSearchHits(result) > 0) {
          const toolN = result.tools.length
          const reviewN = result.reviews.length
          const parts = [
            toolN ? `${toolN} 个产品` : '',
            reviewN ? `${reviewN} 篇评测` : '',
          ].filter(Boolean)
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              text: `找到与「${route.query}」相关的 ${parts.join('、')}，点击下方条目可打开：`,
              hits: hitsFromCatalog(result),
              actions: [
                { label: '打开AI导览', to: ROUTES.TOOLS },
                { label: '打开AI评测', to: ROUTES.ARTICLES },
              ],
            },
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              text: `没有找到与「${route.query}」匹配的产品或评测。可以换个词，或说明你是要翻译 / 写文案等。`,
              actions: [
                { label: '打开AI导览', to: ROUTES.TOOLS },
                { label: '打开AI评测', to: ROUTES.ARTICLES },
              ],
              options: [
                { id: 'copywriting', label: '改写文案' },
                { id: 'translate', label: '翻译这段' },
              ],
            },
          ])
        }
        return
      }

      if (route.kind === 'skill') {
        const fallback =
          route.slug === 'copywriting'
            ? draftCopywritingFallback
            : route.slug === 'translate'
              ? draftTranslateFallback
              : route.slug === 'resume'
                ? draftResumeFallback
                : route.slug === 'contract'
                  ? draftContractFallback
                  : draftSummaryFallback
        await streamSkillReply(route.slug, route.prompt, setMessages, fallback)
      }
    } finally {
      setBusy(false)
    }
  }

  function onPickOption(optionId: string) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const fromLast =
      lastUser?.text.replace(/\n\n（附件[\s\S]*$/, '').trim() || ''
    const prompt = draft.trim() || fromLast || '请根据我刚才的说明继续'
    void send(prompt, optionId as RouteOverride)
  }

  const uploadFileList: UploadFile[] = pending.map((p) => ({
    uid: p.id,
    name: p.file.name,
    status: 'done',
  }))

  return (
    <div className={styles.layout}>
      <div className={styles.shell}>
        <header className={styles.top}>
          <div className={styles.topRow}>
            <div className={styles.topLeft}>
              <div>
                <Typography.Title level={4} className={styles.title}>
                  聊天
                </Typography.Title>
                <Typography.Paragraph className={styles.sub} type="secondary">
                  统一对话 · 搜产品 / 办事 · 附件仅本会话
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
                {m.options?.length ? (
                  <Space wrap size={[8, 8]} className={styles.actions}>
                    {m.options.map((o) => (
                      <Button
                        key={o.id}
                        size="small"
                        type="default"
                        disabled={busy}
                        onClick={() => onPickOption(o.id)}
                      >
                        {o.label}
                      </Button>
                    ))}
                  </Space>
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
                <p className={styles.typing}>处理中…</p>
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
          <Upload
            beforeUpload={onPickFile}
            fileList={uploadFileList}
            onRemove={(f) => {
              setPending((prev) => prev.filter((p) => p.id !== f.uid))
            }}
            accept={ACCEPT_EXT.join(',')}
            multiple
            maxCount={5}
          >
            <Button
              type="text"
              icon={<PaperClipOutlined />}
              disabled={busy}
              aria-label="添加附件"
            />
          </Upload>
          <Input.TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="说需求，或点左侧回形针上传文件…（Shift+Enter 换行）"
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
            disabled={!draft.trim() && pending.length === 0}
          >
            发送
          </Button>
        </form>
      </div>
    </div>
  )
}
