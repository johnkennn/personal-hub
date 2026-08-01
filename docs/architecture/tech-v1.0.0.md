# Personal Hub 全栈技术文档 V1.0.0

| 项 | 说明 |
|----|------|
| 对应产品 | [prd-v1.0.0.md](../product/prd-v1.0.0.md) |
| 状态 | Confirmed |
| 部署形态 | 无 Docker：Nginx + Spring Boot jar + MySQL（延续现网） |

---

## 1. 架构总览

```
浏览器 / 手机
    │
    ▼
Nginx
    ├─ /           → 前端 SPA（Vite 构建产物）
    ├─ /api/       → Spring Boot :8080
    └─ /media/     → 本地上传目录（静态）

Spring Boot
    ├─ Auth（注册 / 登录 / JWT）
    ├─ User / Profile / Avatar
    ├─ Follow（关注 / 粉丝）
    ├─ Article / Project（分表 + 共用状态机）
    ├─ Media（本地存储）
    ├─ Like / Comment
    └─ Admin

MySQL 8 + Flyway
```

---

## 2. 技术选型（已确认）

### 前端

| 类别 | 选型 |
|------|------|
| 框架 | React + TypeScript + Vite（现有） |
| UI | **Ant Design 5**（深色主题定制） |
| 动效 | Framer Motion |
| 路由 | React Router |
| HTTP | Axios + JWT 拦截器 |
| 正文 | **Markdown**（编辑器推荐 `@uiw/react-md-editor` 或等价） |
| 上传 | Ant Design Upload + 自研上传 API |
| 样式 | Ant Design 主题 Token + CSS Module；首页可适当自定义 |

### 后端

| 类别 | 选型 |
|------|------|
| 框架 | Spring Boot（现有 4.x 路线） |
| 安全 | Spring Security + JWT；扩展多用户与角色 |
| 持久化 | Spring Data JPA + MySQL |
| 迁移 | **Flyway**（生产 `ddl-auto: validate`） |
| 校验 | Bean Validation |
| 文件 | `StorageService` + **LocalStorage**（磁盘目录）；接口预留 OSS |
| API | 统一 `ApiResponse` |
| 文档 | SpringDoc OpenAPI（建议） |
| 限流 | 注册 / 登录 / 评论 / 上传 IP 限流 |

### 决策摘要（产品确认）

| 决策 | 结论 |
|------|------|
| 注册 | 开放注册 + 限流 |
| 评论 | 仅登录 |
| 正文 | Markdown |
| UI | Ant Design 5 |
| 图片 | 本地 + Nginx `/media/` |
| 删除 | **软删除**（见下） |
| 关注 | V1.0.0 必做 |

---

## 3. 软删除实现约定

- 内容表、评论表等需对外「消失」的实体：使用 `deleted_at DATETIME NULL`。  
- 所有默认查询：`deleted_at IS NULL`。  
- 业务「删除」= 设置 `deleted_at = now()`，不 `DELETE FROM`。  
- 点赞记录：内容软删后读接口不再暴露；可级联保留或定期清理。  
- 可选：`PurgeJob` 清理 N 天前软删数据（V1.0.0 可先留接口与配置项）。

**后端必须拒绝：** 对 `PUBLISHED` 的更新正文/标题接口；仅允许 `unpublish`、`softDelete`、批量接口。

---

## 4. 领域模型

### 4.1 用户

```
users
  id, username, email, password_hash
  role: AUTHOR | ADMIN
  status: ACTIVE | DISABLED
  created_at, updated_at

user_profiles
  user_id PK/FK
  nickname, bio, avatar_url, links_json
```

### 4.2 关注

```
user_follows
  id
  follower_id   -- 关注者
  followee_id   -- 被关注者
  created_at
  UNIQUE(follower_id, followee_id)
  CHECK follower_id <> followee_id
```

查询：粉丝列表、关注列表、计数；关注动态 = 关注的人的已发布内容按时间合并分页。

### 4.3 内容（方案 A：分表 + 模板）

```
articles / projects 公共字段：
  id, user_id
  status: DRAFT | PUBLISHED
  published_at
  deleted_at
  created_at, updated_at
  -- 各模块特有字段（title/content 或 name/description/tech_stack/...）
```

服务层抽象：`publish` / `unpublish` / `softDelete` / `batchSoftDelete` / `batchUnpublish`，先校验归属与状态。

### 4.4 媒体

```
media_assets
  id, user_id, url, mime, size_bytes
  biz_type: AVATAR | ARTICLE | PROJECT
  biz_id (nullable until attached)
  created_at
```

磁盘路径示例：`/var/www/personal-hub-media/{yyyy}/{mm}/{uuid}.ext`  
Nginx：`location /media/ { alias ...; }`

### 4.5 社交

```
content_likes
  user_id, target_type, target_id
  UNIQUE(user_id, target_type, target_id)

comments
  id, user_id, target_type, target_id
  body, deleted_at, created_at
```

`target_type`: `ARTICLE` | `PROJECT`（枚举可扩展）。

---

## 5. API 分组草图

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Me / Profile

- `GET/PATCH /api/me/profile`
- `POST /api/me/avatar`

### Follow

- `POST /api/me/following/{userId}` 关注  
- `DELETE /api/me/following/{userId}` 取关  
- `GET /api/users/{id}/followers`  
- `GET /api/users/{id}/following`  
- `GET /api/me/feed/following` 关注的人的已发布动态（分页）

### Public Content

- `GET /api/articles` `GET /api/articles/{id}`
- `GET /api/projects` `GET /api/projects/{id}`
- `GET /api/users/{id}/profile` + 已发布列表

### Creator Content（以文章为例，项目对称）

- `GET /api/me/articles?status=DRAFT|PUBLISHED`
- `POST /api/me/articles`
- `PUT /api/me/articles/{id}`（仅 DRAFT 且未删除）
- `POST /api/me/articles/{id}/publish`
- `POST /api/me/articles/{id}/unpublish`
- `DELETE /api/me/articles/{id}`（软删）
- `POST /api/me/articles/batch-delete`
- `POST /api/me/articles/batch-unpublish`

### Media / Social / Admin

- `POST /api/media/upload`
- `POST /api/likes/toggle` `GET /api/likes/summary`
- `GET/POST /api/comments` `DELETE /api/comments/{id}`
- Admin：禁用用户、强制下架、删评论

**鉴权原则：** `/api/me/**` 必须登录；写操作校验 `resource.userId == currentUserId`（ADMIN 治理例外）；公开读仅 `PUBLISHED AND deleted_at IS NULL`。

---

## 6. 前端信息架构

```
/                         发现首页（最新 / 关注动态）
/articles                 公开文章
/projects                 公开项目
/u/:userId                创作者主页（含关注按钮、粉丝/关注列表入口）
/login  /register

/studio                   创作台概览
/studio/articles/drafts
/studio/articles/published
/studio/articles/new
/studio/articles/:id/edit   # 仅草稿
/studio/projects/...        # 对称

/admin                    治理（ADMIN）
```

目录建议：`features/auth|profile|follow|article|project|social|studio|admin` + `shared`。

---

## 7. 安全

- BCrypt 密码；JWT 过期与密钥来自环境变量  
- 上传白名单与大小限制；随机文件名；禁止执行权限  
- Markdown 渲染消毒（XSS）  
- 注册/登录/评论/上传限流  
- 已发布更新接口直接 403/业务错误  

---

## 8. 与现网演进

1. 保留 Nginx + jar + MySQL 部署方式。  
2. 引入 Flyway；停止依赖生产 `ddl-auto=update`。  
3. 将原 `AdminUser` 迁移为 `users.role=ADMIN`，历史文章/项目挂到该用户且 `PUBLISHED`。  
4. 前端按里程碑替换页面；创作台与公开站共用 Design Token。  
5. 媒体目录权限与磁盘监控写入部署文档。  

开发期可清库；上正式 V1.0.0 前对现网数据执行备份 + 迁移脚本。

---

## 9. 非功能

| 项 | 目标 |
|----|------|
| 移动端 | 主路径全通 |
| 列表 | 统一分页 |
| 图片 | 限制分辨率/大小，避免 2G 机磁盘暴涨 |
| 扩展 | 新模块复制分表 + 枚举 + Studio 路由 |

---

## 10. 实施里程碑（与 PRD 对齐）

| 里程碑 | 工程重点 |
|--------|----------|
| M0 | Ant Design 深色主题、布局壳、路由 |
| M1 | User 模型、注册登录、Profile、头像上传 API |
| M2 | `user_follows` + 列表/计数 API + 前端关注按钮 |
| M3 | Article 状态机与 Studio |
| M4 | Project 对称 |
| M5 | Media 本地存储 + Nginx |
| M6 | Like/Comment |
| M7 | 首页 Feed + Following Feed + 动效/自适应 |
| M8 | Admin + Flyway + 迁移 + 部署文档更新 |

下一步工程从 **M0** 开始。
