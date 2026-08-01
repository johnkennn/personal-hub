export type DemoCreator = {
  id: number
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  links?: string
}

export type PublicArticle = {
  id: number
  title: string
  content: string
  published: boolean
  createdAt: string
  updatedAt: string
  authorId: number
  authorName: string
  coverTone?: string
}

export type PublicProject = {
  id: number
  name: string
  description: string
  techStack: string | null
  repoUrl: string | null
  demoUrl: string | null
  published: boolean
  createdAt: string
  updatedAt: string
  authorId: number
  authorName: string
}

const now = Date.now()

function daysAgo(days: number) {
  return new Date(now - days * 86400000).toISOString()
}

export const DEMO_CREATORS: DemoCreator[] = [
  {
    id: 1,
    username: 'alice',
    displayName: 'Alice Chen',
    bio: '全栈工程师，喜欢把想法做成可上线的小产品。Personal Hub 早期创作者。',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=alice&backgroundColor=1a2e24',
    links: 'https://github.com/johnkennn',
  },
  {
    id: 2,
    username: 'bob',
    displayName: 'Bob Lin',
    bio: '关注工程化与部署体验，正在用 Personal Hub 记录踩坑笔记。',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=bob&backgroundColor=1a2e24',
  },
  {
    id: 3,
    username: 'zzx',
    displayName: 'ZZX',
    bio: '产品与前端方向；把 Personal Hub 当作作品主场与学习日志。',
    avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=zzx&backgroundColor=1a2e24',
  },
]

export const DEMO_ARTICLES: PublicArticle[] = [
  {
    id: 101,
    title: '从个人博客到多作者创作平台',
    content: `## 为什么要做成平台

Personal Hub 的目标不是又一个博客模板，而是让创作者把**文章与项目**放在同一主场。

- 草稿打磨 → 一键发布
- 需要修改时先下架再改
- 多作者 + 关注 + 轻社交

> 访客先被内容吸引，再留下互动。

\`\`\`text
访客 → 阅读 → 关注作者 → 注册创作
\`\`\`
`,
    published: true,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    authorId: 1,
    authorName: 'Alice Chen',
    coverTone: 'moss',
  },
  {
    id: 102,
    title: '无 Docker 场景下的 ECS 部署清单',
    content:
      '公司禁用 Docker 时，依然可以用 jar + systemd + Nginx + MySQL 把全栈站点跑起来。关键是环境变量引号、反代路径与首次 ddl-auto。\n\n本文整理了一份可复用的上线检查表，适合演示与小流量生产。',
    published: true,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    authorId: 2,
    authorName: 'Bob Lin',
  },
  {
    id: 103,
    title: '创作台信息架构：草稿与已发布',
    content:
      '已发布不可直接编辑——这是故意的产品约束。修改路径是：下架 → 草稿编辑 → 再发布。批量发布与批量下架让运营节奏更清楚。',
    published: true,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
    authorId: 3,
    authorName: 'ZZX',
  },
  {
    id: 104,
    title: '深色工作室风 UI 的取舍',
    content:
      '用苔绿色强调与墨色底，配合克制动效，避免「又一个紫色 Dashboard」。品牌名要在首屏成立，Hero 不做信息堆砌。',
    published: true,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(9),
    authorId: 3,
    authorName: 'ZZX',
  },
  {
    id: 105,
    title: 'JWT 多用户演进：从 AdminUser 到 User',
    content:
      '早期单管理员模型适合原型，开放注册后需要 User + Profile 拆分。角色字段为后续管理员治理预留。',
    published: true,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(11),
    authorId: 1,
    authorName: 'Alice Chen',
  },
  {
    id: 106,
    title: '关注动态为什么值得做',
    content:
      '发现页「最新」解决冷启动；「关注动态」解决留存。两者都在首页用 Tab 切换，演示时故事完整。',
    published: true,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    authorId: 2,
    authorName: 'Bob Lin',
  },
  {
    id: 107,
    title: '软删除：创作工具里的后悔药',
    content:
      '批量误删很常见。软删除对外表现为删除，对内可审计、可恢复，也避免社交引用变成孤儿数据。',
    published: true,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(14),
    authorId: 1,
    authorName: 'Alice Chen',
  },
]

export const DEMO_PROJECTS: PublicProject[] = [
  {
    id: 201,
    name: 'Personal Hub',
    description: '多作者内容平台：文章 / 项目模块，深色工作室风，创作台与轻社交。',
    techStack: 'React,TypeScript,Spring Boot,MySQL,Nginx',
    repoUrl: 'https://github.com/johnkennn/personal-hub',
    demoUrl: null,
    published: true,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    authorId: 3,
    authorName: 'ZZX',
  },
  {
    id: 202,
    name: 'Deploy Cookbook',
    description: '无 Docker 场景的 ECS 部署清单与脚本备忘。',
    techStack: 'Linux,Nginx,systemd',
    repoUrl: null,
    demoUrl: null,
    published: true,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    authorId: 2,
    authorName: 'Bob Lin',
  },
  {
    id: 203,
    name: 'Auth Starter',
    description: 'JWT 注册登录与 Profile 示例工程切片。',
    techStack: 'Spring Security,JWT',
    repoUrl: null,
    demoUrl: null,
    published: true,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
    authorId: 1,
    authorName: 'Alice Chen',
  },
  {
    id: 204,
    name: 'Studio Shell',
    description: '创作台路由、草稿发布状态机与批量操作原型。',
    techStack: 'React Router,Ant Design',
    repoUrl: null,
    demoUrl: null,
    published: true,
    createdAt: daysAgo(11),
    updatedAt: daysAgo(11),
    authorId: 3,
    authorName: 'ZZX',
  },
  {
    id: 205,
    name: 'Suggestion Box',
    description: '用户建议收集：多条提交，后续接管理端查看。',
    techStack: 'React,localStorage',
    repoUrl: null,
    demoUrl: null,
    published: true,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    authorId: 1,
    authorName: 'Alice Chen',
  },
  {
    id: 206,
    name: 'Feed Lite',
    description: '最新与关注动态双 Tab 的发现页实验。',
    techStack: 'Framer Motion,Ant Design',
    repoUrl: null,
    demoUrl: null,
    published: true,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    authorId: 2,
    authorName: 'Bob Lin',
  },
]

export function getDemoCreator(id: number | string) {
  const n = Number(id)
  return DEMO_CREATORS.find((c) => c.id === n) ?? null
}

export function getDemoArticlesByAuthor(authorId: number) {
  return DEMO_ARTICLES.filter((a) => a.authorId === authorId)
}

export function getDemoProjectsByAuthor(authorId: number) {
  return DEMO_PROJECTS.filter((p) => p.authorId === authorId)
}
