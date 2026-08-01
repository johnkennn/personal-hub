import { getUsername, isLoggedIn } from './authStorage'

const LIKES_KEY = 'personal_hub_likes'
const COMMENTS_KEY = 'personal_hub_comments'
const FOLLOWS_KEY = 'personal_hub_follows'
const SOCIAL_EVENT = 'personal-hub-social-changed'

export type ContentKind = 'article' | 'project'

export type DemoComment = {
  id: string
  targetKey: string
  author: string
  content: string
  createdAt: string
}

type LikesMap = Record<string, string[]> // targetKey -> usernames
type FollowsMap = Record<string, number[]> // myUsername -> followeeIds

function notify() {
  window.dispatchEvent(new Event(SOCIAL_EVENT))
}

export function subscribeSocialChange(listener: () => void) {
  window.addEventListener(SOCIAL_EVENT, listener)
  return () => window.removeEventListener(SOCIAL_EVENT, listener)
}

function targetKey(kind: ContentKind, id: number | string) {
  return `${kind}:${id}`
}

function readLikes(): LikesMap {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || '{}') as LikesMap
  } catch {
    return {}
  }
}

function writeLikes(map: LikesMap) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(map))
  notify()
}

function readComments(): DemoComment[] {
  try {
    const raw = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]') as DemoComment[]
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeComments(list: DemoComment[]) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(list))
  notify()
}

function readFollows(): FollowsMap {
  try {
    return JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '{}') as FollowsMap
  } catch {
    return {}
  }
}

function writeFollows(map: FollowsMap) {
  localStorage.setItem(FOLLOWS_KEY, JSON.stringify(map))
  notify()
}

function currentUser() {
  return getUsername()
}

export function getLikeCount(kind: ContentKind, id: number | string) {
  const key = targetKey(kind, id)
  return (readLikes()[key] ?? []).length
}

export function isLikedByMe(kind: ContentKind, id: number | string) {
  const user = currentUser()
  if (!user) return false
  return (readLikes()[targetKey(kind, id)] ?? []).includes(user)
}

export function toggleLike(kind: ContentKind, id: number | string): { liked: boolean; count: number } {
  if (!isLoggedIn()) throw new Error('NEED_LOGIN')
  const user = currentUser()!
  const key = targetKey(kind, id)
  const map = readLikes()
  const set = new Set(map[key] ?? [])
  if (set.has(user)) set.delete(user)
  else set.add(user)
  map[key] = [...set]
  writeLikes(map)
  return { liked: set.has(user), count: set.size }
}

export function listComments(kind: ContentKind, id: number | string) {
  const key = targetKey(kind, id)
  return readComments()
    .filter((c) => c.targetKey === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function addComment(kind: ContentKind, id: number | string, content: string) {
  if (!isLoggedIn()) throw new Error('NEED_LOGIN')
  const author = currentUser()!
  const item: DemoComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    targetKey: targetKey(kind, id),
    author,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  }
  writeComments([item, ...readComments()])
  return item
}

export function removeComment(commentId: string) {
  const user = currentUser()
  writeComments(
    readComments().filter((c) => {
      if (c.id !== commentId) return true
      return c.author !== user
    }),
  )
}

export function getFollowingIds(username?: string | null): number[] {
  const u = username ?? currentUser()
  if (!u) return []
  return readFollows()[u] ?? []
}

export function isFollowing(followeeId: number) {
  return getFollowingIds().includes(followeeId)
}

export function toggleFollow(followeeId: number): boolean {
  if (!isLoggedIn()) throw new Error('NEED_LOGIN')
  const user = currentUser()!
  const map = readFollows()
  const set = new Set(map[user] ?? [])
  if (set.has(followeeId)) set.delete(followeeId)
  else set.add(followeeId)
  map[user] = [...set]
  writeFollows(map)
  return set.has(followeeId)
}

/** 演示：粉丝数 = 有多少本地用户关注了该 id（简化） */
export function getFollowerCount(creatorId: number) {
  const map = readFollows()
  return Object.values(map).filter((ids) => ids.includes(creatorId)).length
}

export function getFollowingCount(username?: string | null) {
  return getFollowingIds(username).length
}
