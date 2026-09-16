# Personal Hub → 小智AI

仓库工程名仍为 `personal-hub`。

**产品：** [小智AI](docs/product/prd-outline.md) — 默认入口「小智」统一对话（搜产品/评测 + 大模型办事），AI 导览浏览外部产品。  
**阶段：** P0 壳已就绪，**P1 持续打磨**（见 [roadmap.md](docs/product/roadmap.md)）。

**工程：** 在现有 React + Spring Boot + MySQL 上演进，不整体重构；部署见 [docs/deploy/README.md](docs/deploy/README.md)。

## 学习目标

完整互联网项目流程：React、Spring Boot、MySQL、Linux、Nginx、CI/CD，以及 LLM 网关 / 配额 / 流式等 AI 应用能力。

## 目录

| 路径 | 说明 |
|------|------|
| `frontend/` | React（Vite）前端；默认页为小智 `/` |
| `backend/` | Spring Boot 后端 |
| `docs/product/prd-outline.md` | **产品需求大纲（准绳）** |
| `docs/product/roadmap.md` | 分期路线图（P0–P3） |
| `docs/architecture/tech-v1.0.0.md` | 技术方案与 AI / 视觉约定 |
| `docs/deploy/README.md` | 无 Docker 部署与运维 |

## 文档原则

1. 产品以 `prd-outline.md` 为准。  
2. 先改大纲 → 再改路线图 / 技术方案 → 再动代码。  
3. 前台文案只写用户收益，不写排期与技术黑话。  
4. 旧创作者 / 展映 PRD 已删除，不再分叉。
