import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Space, Tooltip, Typography, Upload, message as antMessage } from 'antd'
import {
  ClearOutlined,
  CopyOutlined,
  DownOutlined,
  PlusOutlined,
  RedoOutlined,
  SendOutlined,
  StopOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type { UploadFile } from 'antd/es/upload/interface'

import { runSkillStream } from '../../api/aiTools'
import { uploadChatAttachment } from '../../api/chatAttachments'
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
  /** 已上传到服务器临时目录时的公开路径 */
  serverUrl?: string | null
  expiresAt?: string | null
  uploadStatus: 'uploading' | 'ready' | 'local' | 'failed'
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
    '（后端接入文档解析后，将优先总结临时附件；当前按文字提炼）',
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
  attachmentUrls?: string[],
  signal?: AbortSignal,
) {
  const assistantId = uid()
  setMessages((prev) => [
    ...prev,
    { id: assistantId, role: 'assistant', text: '' },
  ])

  const useApi =
    slug === 'copywriting' ||
    slug === 'translate' ||
    slug === 'resume' ||
    slug === 'summary'

  async function typeLocal(full: string) {
    let i = 0
    while (i < full.length) {
      if (signal?.aborted) return
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
    await runSkillStream(
      slug,
      content,
      {
        signal,
        onDelta: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk } : m,
            ),
          )
        },
        onDone: () => undefined,
      },
      attachmentUrls,
    )
  } catch (err) {
    if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: m.text.trim() ? m.text : '（已停止）' }
            : m,
        ),
      )
      return
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, text: '' } : m)),
    )
    await typeLocal(fallback(content))
  }
}

function stripAttachmentNote(text: string) {
  return text.replace(/\n\n（[\s\S]*$/, '').trim()
}

async function copyText(text: string) {
  const value = text.trim()
  if (!value) {
    antMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(value)
    antMessage.success('已复制')
  } catch {
    antMessage.error('复制失败')
  }
}

export function ChatPage() {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  /** 最近一次已上传到服务器的临时附件，供点「总结提炼」时带上 */
  const lastAttachmentUrlsRef = useRef<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const stickToBottomRef = useRef(true)
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages())
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<PendingFile[]>([])
  const [showJumpBottom, setShowJumpBottom] = useState(false)
  const [showJumpTop, setShowJumpTop] = useState(false)

  usePageMeta({
    title: '聊天',
    description: `${SITE_BRAND} 聊天：搜产品、翻译、写文案、总结。`,
  })

  useEffect(() => {
    saveChatMessages(messages)
  }, [messages])

  useEffect(() => {
    const el = listRef.current
    if (!el || !stickToBottomRef.current) return
    el.scrollTop = el.scrollHeight
  }, [messages, busy])

  function syncJumpButtons(el: HTMLDivElement) {
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearTop = el.scrollTop < 48
    const nearBottom = dist < 96
    stickToBottomRef.current = nearBottom
    setShowJumpTop(!nearTop)
    setShowJumpBottom(!nearBottom)
  }

  function onListScroll() {
    const el = listRef.current
    if (!el) return
    syncJumpButtons(el)
  }

  function jumpToBottom() {
    const el = listRef.current
    if (!el) return
    stickToBottomRef.current = true
    setShowJumpBottom(false)
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  function jumpToTop() {
    const el = listRef.current
    if (!el) return
    stickToBottomRef.current = false
    setShowJumpTop(false)
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetChat() {
    abortRef.current?.abort()
    abortRef.current = null
    clearChatMessages()
    setMessages(loadChatMessages())
    setDraft('')
    setPending([])
    lastAttachmentUrlsRef.current = []
    setBusy(false)
  }

  function stopGenerating() {
    abortRef.current?.abort()
    abortRef.current = null
    setBusy(false)
    antMessage.info('已停止生成')
  }

  function onPickFile(file: File) {
    const err = validateFile(file)
    if (err) {
      antMessage.warning(err)
      return Upload.LIST_IGNORE
    }
    const kind = classifyFile(file) as PendingFile['kind']
    if (kind === 'video') {
      antMessage.info('已添加视频（仅本会话暂存，处理能力即将支持）。')
    }
    const id = uid()
    // 视频暂不上传服务端；其它类型异步上传，失败则降级本会话
    const initial: PendingFile = {
      id,
      file,
      kind,
      uploadStatus: kind === 'video' ? 'local' : 'uploading',
    }
    setPending((prev) => [...prev, initial])

    if (kind !== 'video') {
      void uploadChatAttachment(file)
        .then((res) => {
          const data = res.data.data
          setPending((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    serverUrl: data.url,
                    expiresAt: data.expiresAt,
                    uploadStatus: 'ready',
                  }
                : p,
            ),
          )
        })
        .catch(() => {
          setPending((prev) =>
            prev.map((p) => (p.id === id ? { ...p, uploadStatus: 'local' } : p)),
          )
          antMessage.info(`${file.name} 暂存于本会话（临时上传接口未就绪或失败）`)
        })
    }
    return false
  }

  async function send(
    text: string,
    override?: RouteOverride,
    opts?: { regenerate?: boolean },
  ) {
    const content = text.trim()
    if ((!content && pending.length === 0 && !opts?.regenerate) || busy) return
    if (pending.some((p) => p.uploadStatus === 'uploading')) {
      antMessage.warning('附件正在上传，请稍候再发送')
      return
    }

    const uploaded = pending.filter((p) => p.uploadStatus === 'ready' && p.serverUrl)
    const localOnly = pending.filter((p) => p.uploadStatus !== 'ready')
    let fileNote = ''
    if (!opts?.regenerate && pending.length > 0) {
      const parts: string[] = []
      if (uploaded.length > 0) {
        parts.push(
          `临时附件 ${uploaded.length} 个：${uploaded
            .map((p) => `${p.file.name}（${p.serverUrl}）`)
            .join('、')}`,
        )
      }
      if (localOnly.length > 0) {
        parts.push(
          `本会话附件 ${localOnly.length} 个：${localOnly.map((p) => p.file.name).join('、')}（关闭标签即消失）`,
        )
      }
      fileNote = `\n\n（${parts.join('；')}）`
    }

    const displayUser = (content || '（仅发送了附件）') + fileNote
    if (!opts?.regenerate) {
      setDraft('')
    }
    const filesSnapshot = opts?.regenerate ? [] : pending
    const attachmentUrls = opts?.regenerate
      ? lastAttachmentUrlsRef.current
      : filesSnapshot
          .filter((p) => p.uploadStatus === 'ready' && p.serverUrl)
          .map((p) => p.serverUrl as string)
    if (!opts?.regenerate && attachmentUrls.length > 0) {
      lastAttachmentUrlsRef.current = attachmentUrls
    }
    if (!opts?.regenerate) {
      setPending([])
      setMessages((prev) => [...prev, { id: uid(), role: 'user', text: displayUser }])
    }

    const controller = new AbortController()
    abortRef.current = controller
    setBusy(true)
    stickToBottomRef.current = true

    try {
      const aborted = () => controller.signal.aborted

      // 仅附件、无文字 → 追问用途
      if (!content && filesSnapshot.length > 0) {
        if (aborted()) return
        const hasVideo = filesSnapshot.some((f) => f.kind === 'video')
        const hasImage = filesSnapshot.some((f) => f.kind === 'image')
        const hasDoc = filesSnapshot.some((f) => f.kind === 'doc' || f.kind === 'text')
        const anyServer = filesSnapshot.some((f) => f.uploadStatus === 'ready')
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: hasVideo
              ? '已收到视频（本会话暂存）。视频理解即将支持。若还有文档/图片，可说明用途；或补充文字需求。'
              : anyServer
                ? '已收到附件（已暂存服务器，过期后自动删除）。请选择要我做什么：'
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
      if (aborted()) return

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
        if (aborted()) return
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
        const urlsForSkill =
          route.slug === 'summary'
            ? attachmentUrls.length > 0
              ? attachmentUrls
              : lastAttachmentUrlsRef.current
            : undefined
        const prompt =
          route.slug === 'summary' &&
          (!route.prompt.trim() || route.prompt === '请根据我刚才的说明继续') &&
          urlsForSkill &&
          urlsForSkill.length > 0
            ? '请总结附件要点'
            : route.prompt
        await streamSkillReply(
          route.slug,
          prompt,
          setMessages,
          fallback,
          urlsForSkill,
          controller.signal,
        )
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
      setBusy(false)
    }
  }

  function onRetry(assistantId: string) {
    if (busy) return
    const idx = messages.findIndex((m) => m.id === assistantId)
    if (idx <= 0) return
    let userIdx = idx - 1
    while (userIdx >= 0 && messages[userIdx].role !== 'user') userIdx -= 1
    if (userIdx < 0) return
    const userRaw = messages[userIdx].text
    const prompt = stripAttachmentNote(userRaw) || userRaw
    if (!prompt.trim() || prompt.startsWith('（仅发送了附件）')) {
      antMessage.info('这条没有可重试的文字内容，请重新说明需求')
      return
    }
    setMessages((prev) => prev.slice(0, idx))
    void send(prompt, undefined, { regenerate: true })
  }

  function onPickOption(optionId: string) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const fromLast = stripAttachmentNote(lastUser?.text || '')
    const prompt = draft.trim() || fromLast || '请根据我刚才的说明继续'
    void send(prompt, optionId as RouteOverride)
  }

  const uploadFileList: UploadFile[] = pending.map((p) => ({
    uid: p.id,
    name:
      p.uploadStatus === 'uploading'
        ? `${p.file.name}（上传中…）`
        : p.uploadStatus === 'ready'
          ? `${p.file.name}（已暂存）`
          : p.file.name,
    status: p.uploadStatus === 'uploading' ? 'uploading' : 'done',
  }))

  const isEmptyChat = messages.length === 0

  const composer = (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault()
        if (busy) return
        void send(draft)
      }}
    >
      {pending.length > 0 ? (
        <ul className={styles.attachChips}>
          {pending.map((p) => (
            <li key={p.id} className={styles.attachChip}>
              <span className={styles.attachChipName}>
                {p.uploadStatus === 'uploading'
                  ? `${p.file.name}（上传中…）`
                  : p.uploadStatus === 'ready'
                    ? `${p.file.name}（已暂存）`
                    : p.uploadStatus === 'failed'
                      ? `${p.file.name}（失败）`
                      : p.file.name}
              </span>
              <button
                type="button"
                className={styles.attachChipRemove}
                aria-label={`移除 ${p.file.name}`}
                disabled={busy}
                onClick={() =>
                  setPending((prev) => prev.filter((x) => x.id !== p.id))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={styles.composerBar}>
        <Upload
          beforeUpload={onPickFile}
          fileList={uploadFileList}
          showUploadList={false}
          accept={ACCEPT_EXT.join(',')}
          multiple
          maxCount={5}
        >
          <Tooltip title="添加附件">
            <Button
              type="text"
              className={styles.composerIconBtn}
              icon={<PlusOutlined />}
              disabled={busy}
              aria-label="添加附件"
            />
          </Tooltip>
        </Upload>
        <Input.TextArea
          className={styles.composerInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="说需求，或上传文件…"
          autoSize={{ minRows: 1, maxRows: 4 }}
          allowClear
          disabled={busy}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault()
              if (!busy) void send(draft)
            }
          }}
        />
        {busy ? (
          <Tooltip title="停止生成">
            <Button
              type="text"
              danger
              className={styles.composerSendBtn}
              icon={<StopOutlined />}
              aria-label="停止生成"
              onClick={stopGenerating}
            />
          </Tooltip>
        ) : (
          <Tooltip title="发送">
            <Button
              type="text"
              htmlType="submit"
              className={styles.composerSendBtn}
              icon={<SendOutlined />}
              aria-label="发送"
              disabled={!draft.trim() && pending.length === 0}
            />
          </Tooltip>
        )}
      </div>
    </form>
  )

  return (
    <div className={styles.layout}>
      <div className={styles.shell}>
        <header className={styles.top}>
          <div className={styles.topRow}>
            <div className={styles.topLeft}>
              <Typography.Title level={4} className={styles.title}>
                聊天
              </Typography.Title>
            </div>
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={resetChat}
              disabled={busy || isEmptyChat}
            >
              清空
            </Button>
          </div>
        </header>

        {isEmptyChat ? (
          <div className={styles.emptyStage}>
            <p className={styles.emptyHint}>请尽情咨询吩咐我～</p>
            {composer}
          </div>
        ) : (
          <>
            <div
              className={styles.listWrap}
              ref={listRef}
              onScroll={onListScroll}
            >
              <div className={styles.list}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    className={m.role === 'user' ? styles.rowUser : styles.rowAssistant}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={
                        m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant
                      }
                    >
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
                                {h.meta ? (
                                  <span className={styles.hitMeta}>{h.meta}</span>
                                ) : null}
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
                      {m.text.trim() ? (
                        <div
                          className={
                            m.role === 'user'
                              ? styles.msgToolsUser
                              : styles.msgToolsAssistant
                          }
                        >
                          <Tooltip title="复制">
                            <Button
                              type="text"
                              size="small"
                              icon={<CopyOutlined />}
                              aria-label="复制"
                              onClick={() => void copyText(m.text)}
                            />
                          </Tooltip>
                          {m.role === 'assistant' ? (
                            <Tooltip title="重新生成">
                              <Button
                                type="text"
                                size="small"
                                icon={<RedoOutlined />}
                                aria-label="重新生成"
                                disabled={busy}
                                onClick={() => onRetry(m.id)}
                              />
                            </Tooltip>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
                {busy && messages[messages.length - 1]?.role !== 'assistant' ? (
                  <div className={styles.rowAssistant}>
                    <div className={styles.bubbleAssistant}>
                      <p className={styles.typing}>处理中…</p>
                    </div>
                  </div>
                ) : null}
              </div>
              {showJumpTop || showJumpBottom ? (
                <div className={styles.jumpStack}>
                  {showJumpTop ? (
                    <Tooltip title="回到顶部">
                      <Button
                        className={styles.jumpBtn}
                        type="text"
                        shape="circle"
                        size="small"
                        icon={<UpOutlined />}
                        aria-label="回到顶部"
                        onClick={jumpToTop}
                      />
                    </Tooltip>
                  ) : null}
                  {showJumpBottom ? (
                    <Tooltip title="回到底部">
                      <Button
                        className={styles.jumpBtn}
                        type="text"
                        shape="circle"
                        size="small"
                        icon={<DownOutlined />}
                        aria-label="回到底部"
                        onClick={jumpToBottom}
                      />
                    </Tooltip>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={styles.bottomDock}>
              <p className={styles.composerTip}>
                我也可能会犯错哦，重要信息请务必自行核查，也可以去AI导览寻找或在这里搜索专业AI工具～
              </p>
              {composer}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
