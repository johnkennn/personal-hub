import type { Article } from '../types/article'
import type { Project } from '../types/project'

const now = Date.now()

function daysAgo(days: number) {
  return new Date(now - days * 86400000).toISOString()
}

function article(
  id: number,
  title: string,
  content: string,
  published: boolean,
  days: number,
): Article {
  return {
    id,
    title,
    content,
    published,
    createdAt: daysAgo(days + 2),
    updatedAt: daysAgo(days),
  }
}

function project(
  id: number,
  name: string,
  description: string,
  published: boolean,
  days: number,
  techStack = 'React,Spring Boot',
): Project {
  return {
    id,
    name,
    description,
    techStack,
    repoUrl: null,
    demoUrl: null,
    published,
    createdAt: daysAgo(days + 3),
    updatedAt: daysAgo(days),
  }
}

/** 创作台假数据：后端 Studio API 就绪后替换 */
export const MOCK_ARTICLE_DRAFTS: Article[] = [
  article(9001, '全栈部署笔记：Nginx 反代与 systemd', '记录从 jar + MySQL 到公网可访问的踩坑。', false, 1),
  article(9002, '草稿：JWT 多用户演进思路', '从 AdminUser 到 User + Profile 的迁移策略。', false, 3),
  article(9003, '草稿：关注动态 Feed 设计', '按时间合并关注对象的已发布内容。', false, 4),
  article(9004, '草稿：软删除与回收站', 'deleted_at 与定期清理任务。', false, 5),
  article(9005, '草稿：头像本地上传方案', 'StorageService + Nginx /media。', false, 6),
  article(9006, '草稿：评论分页与限流', '详情页轻社交的后端要点。', false, 7),
]

export const MOCK_ARTICLE_PUBLISHED: Article[] = [
  article(9101, 'Personal Hub 开源说明', '面向创作者的多模块内容平台原型。', true, 4),
  article(9102, '深色主题与 Ant Design 定制', '用 Design Token 做出工作室气质。', true, 8),
  article(9103, '为什么账号与资料要拆表', 'users 与 user_profiles 的关注点分离。', true, 9),
  article(9104, '创作台信息架构', '草稿箱与已发布的状态机。', true, 11),
  article(9105, '公网部署清单摘要', '安全组、systemd、同源 API。', true, 12),
  article(9106, 'BCrypt 与注册流程', 'encode / matches 与错误提示策略。', true, 14),
]

export const MOCK_PROJECT_DRAFTS: Project[] = [
  project(9201, 'Hub Analytics（草稿）', '创作者主页访问量看板。', false, 2),
  project(9202, 'Suggestion Box（草稿）', '用户建议收集模块。', false, 4),
  project(9203, 'Media Pipeline（草稿）', '图片压缩与对象存储适配。', false, 5),
  project(9204, 'Notify Center（草稿）', '点赞评论通知中心雏形。', false, 8),
  project(9205, 'Search Lite（草稿）', '标题模糊搜索。', false, 9),
]

export const MOCK_PROJECT_PUBLISHED: Project[] = [
  project(
    9301,
    'Personal Hub',
    '多作者内容平台：文章 / 项目模块，深色工作室风 UI。',
    true,
    1,
    'React,TypeScript,Spring Boot,MySQL,Nginx',
  ),
  project(9302, 'Deploy Cookbook', '无 Docker 场景下的 ECS 部署清单。', true, 7, 'Linux,Nginx,systemd'),
  project(9303, 'Auth Starter', 'JWT 注册登录与 Profile 示例。', true, 10, 'Spring Security,JWT'),
  project(9304, 'Studio Shell', '创作台路由与列表交互原型。', true, 13, 'React Router,Ant Design'),
  project(9305, 'Brand Landing', '首页 Hero 与精选内容流。', true, 15, 'Framer Motion'),
]

export type AdminContentItem = {
  id: number
  module: 'ARTICLE' | 'PROJECT'
  title: string
  author: string
  status: 'DRAFT' | 'PUBLISHED'
  updatedAt: string
}

export const MOCK_ADMIN_CONTENTS: AdminContentItem[] = [
  {
    id: 1,
    module: 'ARTICLE',
    title: 'Personal Hub 开源说明',
    author: 'alice',
    status: 'PUBLISHED',
    updatedAt: daysAgo(4),
  },
  {
    id: 2,
    module: 'ARTICLE',
    title: 'JWT 多用户演进思路',
    author: 'bob',
    status: 'DRAFT',
    updatedAt: daysAgo(3),
  },
  {
    id: 3,
    module: 'PROJECT',
    title: 'Personal Hub',
    author: 'zzx',
    status: 'PUBLISHED',
    updatedAt: daysAgo(1),
  },
  {
    id: 4,
    module: 'PROJECT',
    title: 'Hub Analytics',
    author: 'alice',
    status: 'DRAFT',
    updatedAt: daysAgo(2),
  },
  {
    id: 5,
    module: 'ARTICLE',
    title: '深色主题定制',
    author: 'zzx',
    status: 'PUBLISHED',
    updatedAt: daysAgo(8),
  },
  {
    id: 6,
    module: 'ARTICLE',
    title: '评论系统设计',
    author: 'bob',
    status: 'DRAFT',
    updatedAt: daysAgo(6),
  },
  {
    id: 7,
    module: 'PROJECT',
    title: 'Deploy Cookbook',
    author: 'alice',
    status: 'PUBLISHED',
    updatedAt: daysAgo(7),
  },
  {
    id: 8,
    module: 'PROJECT',
    title: 'Media Pipeline',
    author: 'bob',
    status: 'DRAFT',
    updatedAt: daysAgo(5),
  },
  {
    id: 9,
    module: 'ARTICLE',
    title: '关注 Feed 草案',
    author: 'zzx',
    status: 'DRAFT',
    updatedAt: daysAgo(4),
  },
  {
    id: 10,
    module: 'ARTICLE',
    title: 'BCrypt 实践',
    author: 'alice',
    status: 'PUBLISHED',
    updatedAt: daysAgo(14),
  },
  {
    id: 11,
    module: 'PROJECT',
    title: 'Studio Shell',
    author: 'zzx',
    status: 'PUBLISHED',
    updatedAt: daysAgo(13),
  },
  {
    id: 12,
    module: 'PROJECT',
    title: 'Suggestion Box',
    author: 'alice',
    status: 'DRAFT',
    updatedAt: daysAgo(4),
  },
]
