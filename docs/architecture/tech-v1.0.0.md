# AI Tools Hub — 技术方案

| 项 | 说明 |
|----|------|
| 对应产品 | [prd-outline.md](../product/prd-outline.md) |
| 路线图 | [roadmap.md](../product/roadmap.md) |
| 文档版本 | Tech 0.4（由 Personal Hub tech-v1.0.0 演进） |
| 状态 | **与大纲 0.6 / 路线图 0.5 对齐；P1 统一聊天轻量版已落地** |
| 部署 | 无 Docker：Nginx + Spring Boot jar + MySQL；GitHub Actions CI/CD |
| 工程名 | 仓库 / Maven 包名暂保持 `personal-hub` / `com.zzh.personal_hub` |

> **目标：** 支撑「面向用户的成熟好用」产品——稳定、可运营、可控成本、体验偏成熟 AI 产品。  
> 下文分：现状可复用、目标架构、前端 IA/视觉、AI 约定、新增领域、安全与非功能。

---

## 1. 架构总览

```text
浏览器 / 手机
    │
    ▼
Nginx
    ├─ /           → 前端 SPA（Vite）；默认路由为聊天
    ├─ /api/       → Spring Boot :8080
    └─ /media/     → 本地上传目录

Spring Boot
    ├─ Auth / User / Profile / Media / Admin     ← 已有，复用
    ├─ Article（→ AI评测）/ Like / Comment        ← 复用并扩展
    ├─ Project / Follow / Feed                   ← 降权保留
    ├─ Search / SEO / RateLimit                  ← 复用并扩展 Tool
    └─ 规划：Tool / Deal / AiMiniTool / ClickLog / AiClient / Favorite

MySQL 8 + Flyway
LLM 厂商（可插拔）← 仅服务器持有密钥
```

---

## 2. 技术选型

### 2.1 前端

| 类别 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript + Vite |
| UI | Ant Design 6 + 深色算法；主色青绿 `#2ee6a6`、辅色电蓝 `#3d9eff` |
| 动效 | Framer Motion（入场、卡片悬停；克制使用） |
| 路由 | React Router 7；路径常量 `frontend/src/router/paths.ts` |
| HTTP | Axios + JWT 拦截器 |
| 正文 | Markdown（评测） |
| 样式 | CSS 变量（`index.css`）+ CSS Module + Ant Token |
| 字体 | Orbitron / Syne（展示）+ Noto Sans SC（正文） |

### 2.2 后端

| 类别 | 选型 |
|------|------|
| 框架 | Spring Boot 4.x、Java 21 |
| 安全 | Spring Security + JWT |
| 持久化 | Spring Data JPA + MySQL |
| 迁移 | Flyway（生产 `ddl-auto: validate`） |
| 校验 | Bean Validation |
| 文件 | LocalStorage + Nginx `/media/`；预留 OSS |
| API | 统一 `ApiResponse` |
| 限流 | 已有 IP 限流；扩展到 `/ai-tools/**/run` |
| AI | `AiClient` 接口 + 可插拔实现（通义 / DeepSeek / OpenAI 等） |

### 2.3 运维

| 类别 | 选型 |
|------|------|
| 进程 | systemd `personal-hub` |
| CI | `.github/workflows/ci.yml` 构建前端+后端 |
| CD | `.github/workflows/deploy.yml` SSH 上传 + 健康检查重试 |
| 探活 | `/actuator/health` |

---

## 3. 前端信息架构（以代码为准）

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 统一聊天 | **默认落地**；无侧栏；搜产品/评测 + 办事；`/chat` → `/` |
| `/discover` | 发现 | 热门、精选评测 |
| `/tools` | AI导航 | 分类产品库 |
| `/tools/:slug` | 工具详情 | |
| `/ai-tools/**` | （历史） | 兼容可留，非主路径 |
| `/articles` | AI评测 | |
| `/deals` | 限时优惠 | |
| `/about` | 关于 | |
| `/login` `/register` | 账号 | 成功后进聊天 |
| `/studio/**` | 个人中心 | |
| `/admin/**` | 治理 | Tool 等 |

顶栏顺序：`聊天 | 发现 | AI导航 | AI评测 | 限时优惠 | 关于`（**无顶栏搜索框**）  

**统一聊天（前端）：**

| 模块 | 说明 |
|------|------|
| `pages/Chat` | 单一对话壳；附件回形针；追问按钮 |
| `services/chatRouter.ts` | 规则意图：search / skill / clarify / section；可升级后端或 LLM |
| `utils/chatStorage.ts` | `sessionStorage`（`ai-hub-chat-messages-v2`）；关标签清空 |
| 技能执行 | `runAiToolStream` → `POST /api/ai-tools/{slug}/run/stream` |

内部技能 slug（对用户不可见）：`copywriting` `translate` `resume`；（渐进）`summary` `contract` 等。

目录检索：`searchCatalog()` → `{ tools, reviews }`，由统一聊天调用。  
⌘/Ctrl+K → 回到聊天。  
品牌：`SITE_BRAND = 'AI Tools Hub'`。

---

## 4. 视觉体系（AI 风）

| Token | 约定 |
|-------|------|
| `--ph-bg` | `#05070f` 深空 |
| `--ph-accent` | `#2ee6a6` 青绿 |
| `--ph-accent-2` | `#3d9eff` 电蓝 |
| `--ph-accent-3` | `#7c5cff` 点缀（少用） |
| 氛围 | 固定背景光斑 + 轻网格；顶栏毛玻璃与渐变描边 |
| 卡片 | 半透明深色底 + hover 光边 |
| 原则 | 吸睛但主路径可读；动效服务层级，不堆特效；前台不出现工程黑话 |

新页面必须复用上述变量与 `styles/ui.module.css` 模式，避免另起一套肤色。

---

## 5. AI 应用约定

| 项 | 约定 |
|----|------|
| 双轨 | Tool = AI导航；聊天内办事 = 意图路由 + `AiClient`（slug 仅内部） |
| LLM | `AiClient` 可插拔（mock / openai-compatible）；密钥仅环境变量 |
| 运行 API | `POST /api/ai-tools/{slug}/run` 与 `/run/stream`（SSE）；预留 `/api/chat` 门面 |
| 配额 | `app.ai.quota-enabled`；关闭时不拦请求；`AiRunLog` 仍可记 |
| 文档 / 附件 | 前端白名单；服务端临时文件 + TTL（待加深）；不默认长期存原文 |
| 聊天意图 | 前端 `RuleChatRouter`；低置信 clarify；搜优先于模糊办事；P2+ 可 LLM |
| E1 / E2 / E3 | 语义搜 / 荐工具 / 摘要增强（见 roadmap） |
| 点击 | ClickLog 后 302 |
| 失败体验 | 用户可读错误；可重试 |

---

## 6. 可复用现状（摘要）

以下已在线上跑通，新产品继续用：

- 注册 / 登录 / JWT / Profile / 头像  
- Article 状态机（草稿/发布/下架）+ Studio + Admin  
- 媒体本地存储 + `/media/`  
- 点赞 / 评论、软删除与管理员恢复  
- 搜索、sitemap/robots、限流、Actuator  
- CI/CD  

**软删除约定（仍有效）：** `deleted_at`；默认查询过滤；业务删除不物理删；已发布不可直接改正文。

---

## 7. 新增 / 演进领域模型

### 7.1 Tool（AI导航）

```text
tools
  id, name, slug, category, tags_json
  summary, pros_json, cons_json, pricing_note
  website_url, affiliate_url
  score, weight, pinned, status: DRAFT|PUBLISHED|OFFLINE
  cover_url, deleted_at, created_at, updated_at
```

### 7.2 Deal（限时优惠）

```text
deals
  id, tool_id, title, description, promo_code
  url, starts_at, ends_at, status
  deleted_at, created_at, updated_at
```

### 7.3 AiMiniTool + 用量

```text
ai_mini_tools
  id, slug, name, description
  prompt_template, model, enabled
  guest_daily_quota, user_daily_quota

ai_run_logs
  id, user_id nullable, slug, tokens_or_units, ip, created_at
```

### 7.4 ClickLog / Favorite

```text
click_logs
  id, target_type: TOOL|DEAL, target_id, user_id nullable, ip, created_at

favorites
  user_id, tool_id, created_at
  UNIQUE(user_id, tool_id)
```

### 7.5 Article 扩展（AI评测）

- `content_type`（如 REVIEW）  
- `related_tool_ids`（JSON 或关联表）  
- 保留旧 `related_project_id` 但不作为主路径  

---

## 8. API 草图（增量）

### 公开

- `GET /api/tools` `GET /api/tools/{slug}`  
- `GET /api/deals`  
- `POST /api/ai-tools/{slug}/run`（及 SSE 变体）  
- `GET /api/r/tools/{id}` → 302  
- `GET /api/search`（扩展 tool 命中）  

### 登录用户

- `GET/POST/DELETE /api/me/favorites`  
- `GET /api/me/ai-quota`  

### Admin

- Tool / Deal / AiMiniTool CRUD  
- 点击与用量汇总  
- 既有用户 / 文章 / 软删治理  

鉴权：`/api/me/**`、Admin、写操作需登录；公开读仅上架且未删除。

---

## 9. 安全

- BCrypt；JWT 密钥环境变量  
- 上传白名单与大小限制  
- Markdown XSS 消毒  
- `/run` 与鉴权接口限流；配额强制服务端校验  
- Affiliate 跳转只允许配置过的 URL，防开放重定向  
- LLM 输入做长度与敏感策略限制  

---

## 10. 非功能

| 项 | 目标 |
|----|------|
| 移动端 | 聊天、导航、工具、评测、优惠主路径可用 |
| 性能 | 列表分页；聊天首屏轻量；流式尽快出首 token |
| 可用性 | 空态/加载/错误统一；文案用户向 |
| 可运维 | Flyway、health、日志、Deploy 健康重试 |
| 成本可控 | 配额、关停、用量可查 |

---

## 11. 实施与里程碑（对齐路线图）

| 阶段 | 工程重点 |
|------|----------|
| **P0** | IA、默认聊天、AI 视觉；无顶栏搜索 ✅ |
| **P1** | Tool 域 + Admin + 导航；统一聊天（无侧栏）+ 规则意图 + SSE 文案/翻译/简历；配额开关；发现/搜索接真数据 ✅ 轻量 |
| **P2** | Deal、ClickLog、评测关联、内容总结（文档解析）、`/api/chat` 门面、附件 TTL |
| **P3** | E1/E2/E3、LLM 意图、会员、更多技能 |

遗留创作者里程碑（旧 M0–M8）视为**已完成底座**，不再作为产品主排期。

---

## 12. 文档同步规则

1. 产品方向变更 → 先改 `prd-outline.md`  
2. 排期变更 → 改 `roadmap.md`  
3. 路由 / AI / 数据模型变更 → 改本文并对照 `frontend/src/router/paths.ts`  
4. 部署变更 → `docs/deploy/README.md`  
5. 前台禁止出现本文中的内部阶段名（P0/P1、E1…）
