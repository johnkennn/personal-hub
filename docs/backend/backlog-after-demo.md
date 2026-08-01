# 后端待办清单（演示后接入）

| 项 | 说明 |
|----|------|
| 文档目的 | 前端演示版已用 mock / localStorage 撑起完整体验；演示结束后按本清单逐步接真后端 |
| 对应产品 | [prd-v1.0.0.md](../product/prd-v1.0.0.md) |
| 技术参考 | [tech-v1.0.0.md](../architecture/tech-v1.0.0.md) |
| 状态 | 演示前冻结 API 契约时可再细化为 OpenAPI；当前按里程碑学习顺序排列 |

> **原则：** 每接一项，删掉或短路对应前端 mock（`mocks/`、`*Storage.ts` 演示开关），避免双轨长期并存。

---

## 0. 演示版前端已「假实现」、后端需真做

| 前端演示能力 | 后端应对接口 / 能力 | 优先级 |
|--------------|---------------------|--------|
| 公开文章/项目列表与详情（API 失败时 mock 兜底） | `GET` 已发布列表分页、详情；仅 `PUBLISHED` 且未软删 | P0 |
| 创作者公开主页 `/u/:id` | 公开 Profile + 已发布作品列表 + 关注/粉丝数 | P0 |
| 关注 / 取关、关注列表、粉丝列表 | Follow 关系表 + CRUD；禁止关注自己 | P0 |
| 首页「最新 / 关注动态」 | 最新 Feed；关注对象已发布内容时间序 Feed | P0 |
| 详情点赞 / 取消赞、赞数 | Like 表；幂等；未登录只读 | P0 |
| 详情评论列表 / 发表 / 删自己的 | Comment CRUD；分页；鉴权 | P0 |
| 标题搜索 | 标题模糊查询（DB `LIKE` 即可，不做搜索引擎） | P1 |
| 创作台草稿/发布/批量发布下架删除 | 按作者隔离的状态机 API；批量接口 | P0 |
| 已发布不可编辑（前端已弱化入口） | **后端强制**：`PUBLISHED` 拒绝 PUT | P0 |
| 我的建议 | `Suggestion` 实体：用户多条提交、列表、删除自己的；管理员可查看 | P1 |
| 管理员内容治理 | 全站内容列表筛选；强制发布/下架/删除；后续用户禁用 | P1 |
| 角色 ADMIN 演示开关 | 真实 `users.role`；去掉 `setDemoRole` | P1 |
| 资料昵称/简介/外链 | 已有雏形：完善校验与空字段策略 | P0 |
| 头像 / 内容配图 | 本地上传 + Nginx `/media`；类型与大小校验 | P1 |
| Markdown 正文存储与安全渲染 | 存原文；服务端可选消毒；列表摘要截断 | P1 |
| 最热 / 排序 Feed | `orderBy=latest\|hot`（赞数或冗余计数） | P1 |
| 通知中心 | 赞/评/关注事件入库；未读数；已读；可选 SSE/轮询 | P2 |
| 创作台列表持久状态 | 已由 FE localStorage 演示；接 `/api/me/*` 后拆除 | P0 |
| 阅读进度 / 快捷键 | 纯前端即可，后端无强制项 | — |

---

## 1. 学习向实施顺序（建议）

按「能演示闭环」优先，不必一次写完。每完成一块可打 tag（如 `be-m1-auth`）。

### B1 — 账号与资料（在现有 User/Profile 上收尾）

- [ ] 注册限流、密码强度与错误码统一
- [ ] 登录返回 `role`（`AUTHOR` / `ADMIN`），前端去掉演示切角色
- [ ] `GET/PUT /api/me/profile` 与公开 `GET /api/users/{id}/profile`
- [ ] 头像上传 `POST /api/me/avatar`（multipart）
- [ ] （可选）禁用用户 `DISABLED` 时拒绝登录（已有字段则补管理接口）

### B2 — 关注关系

- [ ] 表 `follows(follower_id, followee_id, created_at)` 唯一约束
- [ ] `POST/DELETE /api/users/{id}/follow`
- [ ] `GET /api/users/{id}/followers`、`/following`（分页）
- [ ] 主页返回 `followerCount` / `followingCount`

### B3 — 内容状态机（文章）

- [ ] Article：`status` 或 `published` + `deleted_at`；`author_id`
- [ ] 作者侧：`/api/me/articles/drafts|published`；新建默认草稿
- [ ] 发布 / 下架 / 删除（软删）；**批量** publish / unpublish / delete
- [ ] 公开：`GET /api/articles`、`GET /api/articles/{id}`（仅已发布）
- [ ] 管理：`GET /api/admin/articles` + 强制下架/删除
- [ ] 已发布禁止更新正文（必须先下架）

### B4 — 内容状态机（项目）

- [ ] 与文章对称的 Project API 与校验
- [ ] 字段：name、description、techStack、repoUrl、demoUrl、封面

### B5 — 媒体

- [ ] 通用上传服务（头像、文章/项目封面或插图）
- [ ] 存储路径、文件名策略、Nginx 静态映射
- [ ] 删除内容时是否级联删文件（可后置）

### B6 — 轻社交

- [ ] `likes(user_id, target_type, target_id)` 唯一；计数查询或冗余字段
- [ ] `comments`：内容、作者、时间、软删；作者删自己的；管理员删任意
- [ ] 未登录只读赞数与评论列表

### B7 — 发现与搜索

- [ ] 首页最新混合流或分类型最新
- [ ] `GET /api/feed/following` 关注动态
- [ ] `GET /api/search?q=` 标题搜索（文章+项目）
- [ ] 公开列表 `sort=latest|hot`（hot 依赖赞数）

### B7.1 — 通知（可后置于社交之后）

- [ ] 通知表：`type, actor_id, target, read_at`
- [ ] `GET /api/me/notifications`；`POST .../read` / 全部已读
- [ ] 点赞、评论、被关注时写入（异步即可）

### B8 — 建议箱与管理端

- [ ] `suggestions`：登录用户 CRUD 自己的；管理员列表全部
- [ ] 管理员：用户列表、禁用；评论治理；仪表概览（可后置）

### B9 — 工程与上线

- [ ] Flyway/Liquibase 迁移替代临时 `ddl-auto`
- [ ] 统一 `ApiResponse`、全局异常、校验注解
- [ ] 注册/登录/上传限流
- [ ] 生产配置：JWT 密钥、CORS、日志、健康检查
- [ ] 清理废弃 `AdminUser` / 旧单管理员路径
- [ ] 软删定期物理清理任务（可后置）

---

## 2. 建议的 API 草图（接入时对照前端）

```
Auth     POST /api/auth/register | login
Me       GET|PUT /api/me/profile
         POST /api/me/avatar
Users    GET /api/users/{id}/profile
         POST|DELETE /api/users/{id}/follow
         GET /api/users/{id}/followers|following
         GET /api/users/{id}/articles|projects   # 已发布
Articles 公开 GET；作者 /api/me/articles/**；admin /api/admin/articles/**
Projects 同上
Social   POST|DELETE /api/contents/{type}/{id}/like
         GET|POST /api/contents/{type}/{id}/comments
         DELETE /api/comments/{id}
Feed     GET /api/feed/latest | /api/feed/following
Search   GET /api/search?q=
Suggest  GET|POST /api/me/suggestions；DELETE /api/me/suggestions/{id}
Admin    /api/admin/**（内容、用户、建议）
```

具体路径可在接入第一项时定稿；**不要**为迁就旧「单管理员博客」API 长期分叉。

---

## 3. 前端 mock 拆除对照

| 前端位置 | 何时删除 / 替换 |
|----------|-----------------|
| `src/mocks/studioMock.ts` | Studio / Admin 接 `/api/me/*`、`/api/admin/*` 后 |
| `src/mocks/publicDemo.ts`（若存在） | 公开列表/详情/主页接真 API 且稳定后 |
| `src/utils/suggestionStorage.ts` | 建议箱 API 就绪后 |
| `src/utils/socialStorage.ts`（若存在） | 赞/评/关注 API 就绪后 |
| `src/utils/activityStorage.ts` | 通知 API 就绪后 |
| `src/utils/studioStorage.ts` | Studio `/api/me/*` 就绪后 |
| `authStorage.setDemoRole` | 登录响应带真实 `role` 后 |
| 列表「API 失败用 mock」兜底 | 生产可改为明确错误态；演示服可保留开关 |
| 前端 Markdown（`marked`） | 可保留；后端负责存原文与可选消毒 |

---

## 4. 验收口诀（每块做完自测）

1. 两个账号互不可见草稿，已发布彼此可见  
2. A 关注 B 后，关注动态出现 B 的新发布  
3. 已发布内容 PUT 返回 4xx；下架后可改再发  
4. 未登录不能赞/评/关；能看数量与评论  
5. 管理员可下架任意用户内容  

---

## 5. 演示版前端增强（持续迭代）

详见 [../product/demo-frontend-pack.md](../product/demo-frontend-pack.md)。  
核心：公开 mock 兜底、主页关注、赞评、搜索、Markdown、最热、通知铃、创作台本地持久化——**无库也能演示完整故事**。
