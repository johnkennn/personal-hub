export type DemoActivity = {
  id: string
  title: string
  desc: string
  href: string
  createdAt: string
  read: boolean
}

const KEY = 'personal_hub_activities'
const EVENT = 'personal-hub-activity-changed'

function notify() {
  window.dispatchEvent(new Event(EVENT))
}

export function subscribeActivityChange(listener: () => void) {
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

function seed(): DemoActivity[] {
  const now = Date.now()
  return [
    {
      id: 'seed-1',
      title: 'Alice 发布了新文章',
      desc: '从个人博客到多作者创作平台',
      href: '/articles/101',
      createdAt: new Date(now - 3600_000).toISOString(),
      read: false,
    },
    {
      id: 'seed-2',
      title: '有人关注了演示创作者',
      desc: '去主页看看作品集',
      href: '/u/1',
      createdAt: new Date(now - 7200_000).toISOString(),
      read: false,
    },
    {
      id: 'seed-3',
      title: '项目更新',
      desc: 'Personal Hub 仓库有新动态（演示）',
      href: '/projects/201',
      createdAt: new Date(now - 86400_000).toISOString(),
      read: true,
    },
  ]
}

export function loadActivities(): DemoActivity[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const initial = seed()
      localStorage.setItem(KEY, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw) as DemoActivity[]
    return Array.isArray(parsed) ? parsed : seed()
  } catch {
    return seed()
  }
}

function save(list: DemoActivity[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 40)))
  notify()
}

export function unreadActivityCount() {
  return loadActivities().filter((a) => !a.read).length
}

export function markAllActivitiesRead() {
  save(loadActivities().map((a) => ({ ...a, read: true })))
}

export function markActivityRead(id: string) {
  save(loadActivities().map((a) => (a.id === id ? { ...a, read: true } : a)))
}

export function pushActivity(input: Omit<DemoActivity, 'id' | 'createdAt' | 'read'>) {
  const item: DemoActivity = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  }
  save([item, ...loadActivities()])
  return item
}
