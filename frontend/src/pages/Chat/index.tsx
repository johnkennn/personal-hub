import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Space, Tag, Tooltip, Typography, Upload, message as antMessage } from 'antd'
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
  chatRouteFromLlm,
  looksLikeImageQuestion,
  routeChatIntent,
  routeChatIntentConfident,
  type RouteOverride,
} from '../../services/chatRouter'
import { fetchChatRoute } from '../../api/chatRoute'
import {
  clearChatMessages,
  loadChatMessages,
  saveChatMessages,
  type ChatAttachment,
  type ChatHit,
  type ChatMessage,
} from '../../utils/chatStorage'
import { copyToClipboard } from '../../utils/clipboard'
import { resolveMediaUrl } from '../../utils/mediaUrl'
import { isLoggedIn, subscribeAuthChange } from '../../utils/authStorage'
import { ensureLoggedIn } from '../../utils/requireLogin'
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
    return '暂不支持该文件类型。可用：图片（需识图模型）、PDF、Office、文本；视频即将支持。'
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

async function streamSkillReply(
  content: string,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  attachmentUrls?: string[],
  signal?: AbortSignal,
  onQuota?: (info: { remainingQuota: number; dailyQuota: number }) => void,
) {
  const assistantId = uid()
  setMessages((prev) => [
    ...prev,
    { id: assistantId, role: 'assistant', text: '' },
  ])

  try {
    await runSkillStream(
      'chat',
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
        onDone: (info) => {
          if (
            info &&
            Number.isFinite(info.remainingQuota) &&
            info.remainingQuota >= 0 &&
            Number.isFinite(info.dailyQuota) &&
            info.dailyQuota > 0
          ) {
            onQuota?.(info)
          }
        },
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
    const reason =
      err instanceof Error && err.message.trim()
        ? err.message.trim()
        : '调用模型失败，请稍后重试'
    const status = (err as { status?: number })?.status
    const quotaExceeded =
      status === 429 || /额度|今日.*用完|quota/i.test(reason)

    const softReason =
      quotaExceeded && !isLoggedIn()
        ? '今日试用额度用完啦～登录后每天可聊 30 次哦'
        : quotaExceeded
          ? '今日额度用完啦，明天再来找小智，或稍后再试～'
          : reason

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              text: m.text.trim()
                ? `${m.text}\n\n（${softReason}）`
                : softReason,
            }
          : m,
      ),
    )

    // 未登录额度：只弹确认框，避免再出一条 toast 叠两层
    if (quotaExceeded && !isLoggedIn()) {
      void ensureLoggedIn({
        title: '今日试用额度已用完',
        content:
          '未登录每天可试用 3 次。登录后每日额度提升至 30 次，要去登录吗？',
      })
    } else if (quotaExceeded && isLoggedIn()) {
      antMessage.warning('今日登录额度已用完（每日 30 次），明天再来找小智～')
      onQuota?.({ remainingQuota: 0, dailyQuota: 30 })
    } else {
      antMessage.error(reason)
    }
  }
}

function stripAttachmentNote(text: string) {
  return text.replace(/\n\n（[\s\S]*$/, '').trim()
}

/** 从气泡文案里还原 /media/chat-temp/...（旧消息 / 重新生成） */
function extractAttachmentUrlsFromUserText(text: string): string[] {
  const found = text.match(/\/media\/chat-temp\/[^\s）)\]]+/g)
  if (!found?.length) return []
  return [...new Set(found.map((u) => u.replace(/[，,。.]+$/, '')))]
}

function kindFromFileName(name: string): ChatAttachment['kind'] {
  const n = name.toLowerCase()
  if (/\.(jpe?g|png|webp|gif)$/.test(n)) return 'image'
  if (/\.(mp4|webm|mov)$/.test(n)) return 'video'
  if (/\.(txt|md)$/.test(n)) return 'text'
  return 'doc'
}

/** 优先用结构化 attachments；旧气泡从文案解析文件名+路径 */
function resolveMessageAttachments(m: ChatMessage): ChatAttachment[] {
  if (m.attachments?.length) return m.attachments
  const note = m.text.match(/\n\n（([\s\S]*)）\s*$/)
  if (!note) return []
  const body = note[1]
  const out: ChatAttachment[] = []
  const re = /([^（、；]+?)\s*（(\/media\/chat-temp\/[^）]+)）/g
  let match: RegExpExecArray | null
  while ((match = re.exec(body)) !== null) {
    const name = match[1].replace(/^临时附件\s*\d+\s*个：/, '').replace(/^本会话附件\s*\d+\s*个：/, '').trim()
    const url = match[2].trim()
    if (name && url) {
      out.push({ name, url, kind: kindFromFileName(name) })
    }
  }
  if (out.length) return out
  // 仅有路径时
  for (const url of extractAttachmentUrlsFromUserText(m.text)) {
    const name = url.split('/').pop() || '附件'
    out.push({ name, url, kind: kindFromFileName(name) })
  }
  return out
}

function getMessageAttachmentUrls(m: ChatMessage): string[] {
  const fromStruct = (m.attachments ?? [])
    .map((a) => a.url)
    .filter((u): u is string => Boolean(u && u.startsWith('/media/')))
  if (fromStruct.length) return [...new Set(fromStruct)]
  return extractAttachmentUrlsFromUserText(m.text)
}

async function copyText(text: string) {
  const value = text.trim()
  if (!value) {
    antMessage.warning('没有可复制的内容')
    return
  }
  const ok = await copyToClipboard(value)
  if (ok) {
    antMessage.success('已复制')
  } else {
    antMessage.error('复制失败：请手动长按选择文本')
  }
}

export function ChatPage() {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  /** 最近一次已上传到服务器的临时附件 URL，供选项 / 重新生成复用 */
  const lastAttachmentUrlsRef = useRef<string[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const stickToBottomRef = useRef(true)
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatMessages())
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<PendingFile[]>([])
  const [showJumpBottom, setShowJumpBottom] = useState(false)
  const [showJumpTop, setShowJumpTop] = useState(false)
  const [loggedIn, setLoggedIn] = useState(isLoggedIn)
  const [quota, setQuota] = useState<{ remaining: number; daily: number } | null>(
    null,
  )

  usePageMeta({
    title: '小智',
    description: `${SITE_BRAND}：搜产品、评测，或直接和大模型聊。`,
  })

  useEffect(() => {
    return subscribeAuthChange(() => {
      setLoggedIn(isLoggedIn())
      setQuota(null)
    })
  }, [])

  useEffect(() => {
    saveChatMessages(messages)
  }, [messages])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
    // 程序化滚底不一定触发 onScroll，这里补一次按钮显隐
    syncJumpButtons(el)
  }, [messages, busy])

  function syncJumpButtons(el: HTMLDivElement) {
    const canScroll = el.scrollHeight > el.clientHeight + 8
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    const nearTop = el.scrollTop < 40
    const nearBottom = dist < 80
    stickToBottomRef.current = !canScroll || nearBottom
    setShowJumpTop(canScroll && !nearTop)
    setShowJumpBottom(canScroll && !nearBottom)
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
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    window.setTimeout(() => {
      if (listRef.current) syncJumpButtons(listRef.current)
    }, 320)
  }

  function jumpToTop() {
    const el = listRef.current
    if (!el) return
    stickToBottomRef.current = false
    el.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => {
      if (listRef.current) syncJumpButtons(listRef.current)
    }, 320)
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
    opts?: { regenerate?: boolean; attachmentUrls?: string[] },
  ) {
    const content = text.trim()
    if ((!content && pending.length === 0 && !opts?.regenerate) || busy) return
    if (pending.some((p) => p.uploadStatus === 'uploading')) {
      antMessage.warning('附件正在上传，请稍候再发送')
      return
    }

    const messageAttachments: ChatAttachment[] = opts?.regenerate
      ? []
      : pending.map((p) => ({
          name: p.file.name,
          url: p.serverUrl ?? null,
          kind: p.kind,
        }))

    const displayUser = content || (messageAttachments.length > 0 ? '（仅发送了附件）' : '')
    if (!opts?.regenerate) {
      setDraft('')
    }
    const filesSnapshot = opts?.regenerate ? [] : pending
    const fromPending = filesSnapshot
      .filter((p) => p.uploadStatus === 'ready' && p.serverUrl)
      .map((p) => p.serverUrl as string)
    const attachmentUrls = opts?.regenerate
      ? opts.attachmentUrls?.length
        ? opts.attachmentUrls
        : lastAttachmentUrlsRef.current
      : fromPending
    if (attachmentUrls.length > 0) {
      lastAttachmentUrlsRef.current = attachmentUrls
    }
    if (!opts?.regenerate) {
      setPending([])
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'user',
          text: displayUser,
          ...(messageAttachments.length > 0 ? { attachments: messageAttachments } : {}),
        },
      ])
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
        const anyServer = filesSnapshot.some((f) => f.uploadStatus === 'ready')
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            text: hasVideo
              ? '已收到视频（本会话暂存）。视频理解即将支持～若还有文档/图片，可说明用途；或补充文字需求。'
              : anyServer
                ? '已收到附件（已暂存服务器，过期后自动删除）。想让小智做什么呢？'
                : '已收到附件（仅存本标签页，关闭即消失）。想让小智做什么呢？',
            options: [
              { id: 'chat', label: '大模型' },
            ],
          },
        ])
        return
      }

      let route = routeChatIntentConfident(content, override)
      if (!route) {
        try {
          const llm = await fetchChatRoute(content, controller.signal)
          if (aborted()) return
          route = chatRouteFromLlm(llm, content)
        } catch {
          if (aborted()) return
          route = routeChatIntent(content, override)
        }
      }
      if (aborted()) return

      // 已上传图片：问「图里是什么」或模型仍返回 clarify → 直接走 AI 聊天识图，不弹选项
      const hasReadyImage =
        filesSnapshot.some((f) => f.kind === 'image' && f.uploadStatus === 'ready') ||
        (opts?.regenerate === true &&
          lastAttachmentUrlsRef.current.some((u) => /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u)))
      if (
        hasReadyImage &&
        content &&
        (route.kind === 'clarify' || looksLikeImageQuestion(content))
      ) {
        route = { kind: 'skill', slug: 'chat', prompt: content }
      }

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
            text: '小智带你去「限时优惠」看看近期活动～',
            to: ROUTES.DEALS,
            label: '打开限时优惠',
          },
          articles: {
            text: '去「AI评测」看看真实体验与对比吧～',
            to: ROUTES.ARTICLES,
            label: '打开AI评测',
          },
          tools: {
            text: '「AI导览」可以按分类慢慢逛～',
            to: ROUTES.TOOLS,
            label: '打开AI导览',
          },
          discover: {
            text: '发现页汇总了热门产品与精选评测，小智觉得值得逛逛～',
            to: ROUTES.DISCOVER,
            label: '去发现',
          },
          about: {
            text: '关于页有模块说明与联系方式，需要找人可以去那里～',
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
              text: `没有找到与「${route.query}」匹配的产品或评测。可以换个词，或直接提问让小智帮你处理～`,
              actions: [
                { label: '打开AI导览', to: ROUTES.TOOLS },
                { label: '打开AI评测', to: ROUTES.ARTICLES },
              ],
              options: [{ id: 'chat', label: '大模型' }],
            },
          ])
        }
        return
      }

      if (route.kind === 'skill') {
        const urlsForSkill =
          attachmentUrls.length > 0
            ? attachmentUrls
            : lastAttachmentUrlsRef.current.length > 0
              ? lastAttachmentUrlsRef.current
              : undefined
        const prompt =
          (!route.prompt.trim() || route.prompt === '请根据我刚才的说明继续') &&
          urlsForSkill &&
          urlsForSkill.length > 0
            ? '请根据附件内容回答或处理我的需求'
            : route.prompt
        await streamSkillReply(
          prompt,
          setMessages,
          urlsForSkill,
          controller.signal,
          (info) =>
            setQuota({
              remaining: info.remainingQuota,
              daily: info.dailyQuota,
            }),
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
    const userMsg = messages[userIdx]
    const urlsFromBubble = getMessageAttachmentUrls(userMsg)
    const stripped = stripAttachmentNote(userRaw) || userRaw
    const prompt =
      !stripped.trim() || stripped.startsWith('（仅发送了附件）')
        ? urlsFromBubble.length > 0
          ? '请根据附件内容回答或处理我的需求'
          : ''
        : stripped
    if (!prompt.trim()) {
      antMessage.info('这条没有可重试的文字内容，请重新说明需求')
      return
    }
    if (urlsFromBubble.length > 0) {
      lastAttachmentUrlsRef.current = urlsFromBubble
    }
    setMessages((prev) => prev.slice(0, idx))
    void send(prompt, undefined, {
      regenerate: true,
      attachmentUrls:
        urlsFromBubble.length > 0 ? urlsFromBubble : lastAttachmentUrlsRef.current,
    })
  }

  function onPickOption(optionId: string) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const fromLast = stripAttachmentNote(lastUser?.text || '')
    const prompt = draft.trim() || fromLast || '请根据我刚才的说明继续'
    const urlsFromBubble = lastUser ? getMessageAttachmentUrls(lastUser) : []
    if (urlsFromBubble.length > 0) {
      lastAttachmentUrlsRef.current = urlsFromBubble
    }
    const reuseAttachments =
      urlsFromBubble.length > 0 || lastAttachmentUrlsRef.current.length > 0
    // 去掉「请选择方向」那条助手消息，避免堆在对话里
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === 'assistant' && last.options && last.options.length > 0) {
        return prev.slice(0, -1)
      }
      return prev
    })
    void send(prompt, optionId as RouteOverride, {
      regenerate: reuseAttachments,
      attachmentUrls: reuseAttachments
        ? urlsFromBubble.length > 0
          ? urlsFromBubble
          : lastAttachmentUrlsRef.current
        : undefined,
    })
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
                小智
              </Typography.Title>
              <Tooltip
                title={
                  loggedIn
                    ? '登录用户每日可调用大模型的次数'
                    : '未登录每日 3 次；登录后提升至 30 次'
                }
              >
                <Tag className={styles.quotaTag} color={quota && quota.remaining <= 0 ? 'error' : 'cyan'}>
                  {quota
                    ? `今日剩余 ${quota.remaining}/${quota.daily}`
                    : loggedIn
                      ? '今日额度 30 次'
                      : '访客今日 3 次 · 登录 30 次'}
                </Tag>
              </Tooltip>
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
            <p className={styles.emptyHint}>有事尽管吩咐小智～</p>
            <p className={styles.emptyQuotaHint}>
              {loggedIn
                ? quota
                  ? `今日大模型还剩 ${quota.remaining} 次`
                  : '登录用户每日可聊 30 次'
                : '访客每日 3 次 · 登录后提升至 30 次'}
            </p>
            {composer}
          </div>
        ) : (
          <>
            <div className={styles.listPane}>
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
                        {(() => {
                          const visibleText = stripAttachmentNote(m.text)
                          const atts = resolveMessageAttachments(m)
                          return (
                            <>
                              {visibleText ? (
                                <p className={styles.bubbleText}>{visibleText}</p>
                              ) : null}
                              {atts.length > 0 ? (
                                <ul className={styles.msgAttachList} aria-label="附件">
                                  {atts.map((a, i) => {
                                    const src = resolveMediaUrl(a.url ?? undefined)
                                    const key = `${a.name}-${a.url ?? i}`
                                    if (a.kind === 'image' && src) {
                                      return (
                                        <li key={key} className={styles.msgAttachImage}>
                                          <a href={src} target="_blank" rel="noreferrer">
                                            <img src={src} alt={a.name} loading="lazy" />
                                          </a>
                                          <span className={styles.msgAttachName}>{a.name}</span>
                                        </li>
                                      )
                                    }
                                    return (
                                      <li key={key} className={styles.msgAttachFile}>
                                        <span className={styles.msgAttachKind}>
                                          {a.kind === 'video'
                                            ? '视频'
                                            : a.kind === 'text'
                                              ? '文本'
                                              : '文档'}
                                        </span>
                                        <span className={styles.msgAttachName}>{a.name}</span>
                                        {!a.url ? (
                                          <span className={styles.msgAttachHint}>仅本页</span>
                                        ) : null}
                                      </li>
                                    )
                                  })}
                                </ul>
                              ) : null}
                            </>
                          )
                        })()}
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
                        {(stripAttachmentNote(m.text).trim() ||
                          resolveMessageAttachments(m).length > 0) ? (
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
                                onClick={() =>
                                  void copyText(stripAttachmentNote(m.text) || m.text)
                                }
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
