-- Bulk seed: tools / articles / deals (idempotent via markers + slug checks)
SET NAMES utf8mb4;
START TRANSACTION;

-- ===== Tools =====
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "claude", "Claude", 1,
  "Anthropic 对话助手，长文理解与稳健写作口碑好。", "Claude 适合长文档阅读、严谨写作与多轮改稿，上下文窗口大，表达克制清晰。",
  "需要长文处理、英文写作或偏谨慎回答风格的用户。", "免费 + Pro", "https://claude.ai",
  "[\"claude\", \"anthropic\"]", "[\"长文\", \"写作\"]",
  "[\"长文摘要\", \"邮件与报告改写\", \"头脑风暴\", \"代码解释\"]", "[\"长上下文\", \"表达稳\", \"适合深度改稿\"]", "[\"部分地区访问需自行解决\", \"免费额度有限\"]",
  1, 96, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="claude");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "kimi", "Kimi", 1,
  "月之暗面出品，擅长长文本与资料梳理。", "Kimi 以长文本与资料阅读见长，适合投喂长文档后提问、提炼与对比。",
  "学生、研究员、需要读长材料的职场人。", "免费 + 会员", "https://kimi.moonshot.cn",
  "[\"kimi\", \"月之暗面\", \"moonshot\"]", "[\"长文本\", \"中文\"]",
  "[\"长文档问答\", \"资料对比\", \"学习笔记\", \"报告提纲\"]", "[\"长文本友好\", \"中文体验好\", \"适合资料型任务\"]", "[\"复杂专业判断仍需人工复核\", \"高峰期可能排队\"]",
  1, 93, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="kimi");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "perplexity", "Perplexity", 1,
  "带引用的问答引擎，适合检索式研究。", "Perplexity 把搜索与生成结合起来，回答常附来源链接，适合快速调研。",
  "需要可追溯资料来源的研究员、分析师与内容创作者。", "免费 + Pro", "https://www.perplexity.ai",
  "[\"perplexity\", \"搜索\", \"引用\"]", "[\"检索\", \"引用\"]",
  "[\"快速调研\", \"竞品信息收集\", \"新闻要点\", \"带着来源的问答\"]", "[\"引用来源清晰\", \"调研效率高\"]", "[\"中文结果质量因主题而异\", \"深度分析仍需自己读原文\"]",
  1, 88, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="perplexity");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "grok", "Grok", 1,
  "xAI 对话助手，风格更直、偏实时话题。", "Grok 强调实时与直白风格，适合追热点、轻松对话与快速头脑风暴。",
  "关注时效信息、喜欢轻松对话风格的用户。", "随 X Premium", "https://grok.x.ai",
  "[\"grok\", \"xai\"]", "[\"实时\", \"对话\"]",
  "[\"热点讨论\", \"轻松问答\", \"创意头脑风暴\"]", "[\"风格鲜明\", \"偏实时\"]", "[\"严肃场景表达需把关\", \"可用性依赖账号体系\"]",
  0, 72, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="grok");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "copilot", "Microsoft Copilot", 1,
  "微软助手，嵌在 Edge / Microsoft 365 工作流。", "Copilot 可在浏览与 Office 场景里辅助写作、总结与表格思路。",
  "微软生态用户、办公文档重度使用者。", "免费 + Microsoft 365", "https://copilot.microsoft.com",
  "[\"copilot\", \"微软\", \"office\"]", "[\"办公\", \"浏览器\"]",
  "[\"网页总结\", \"Word/Excel 辅助\", \"邮件草稿\", \"会议纪要思路\"]", "[\"贴合 Office\", \"上手快\"]", "[\"高级能力常绑订阅\", \"复杂表需人工校验\"]",
  0, 82, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="copilot");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "poe", "Poe", 1,
  "多模型聚合聊天，方便在一个入口切换模型。", "Poe 聚合多家模型，适合对比回答风格、按任务切换不同模型。",
  "想对比多模型、又不想装一堆 App 的用户。", "免费额度 + 订阅", "https://poe.com",
  "[\"poe\", \"多模型\"]", "[\"聚合\", \"对比\"]",
  "[\"多模型对比\", \"灵感收集\", \"轻度写作\"]", "[\"一站多用\", \"切换方便\"]", "[\"深度能力取决于底层模型\", \"订阅结构需留意\"]",
  0, 68, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="poe");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "character-ai", "Character.AI", 1,
  "角色扮演向对话平台，适合创意与娱乐互动。", "Character.AI 以角色对话见长，适合故事共创、语言练习与娱乐向互动。",
  "喜欢角色扮演、叙事共创或口语练习的用户。", "免费 + 订阅", "https://character.ai",
  "[\"character\", \"角色\"]", "[\"角色扮演\", \"娱乐\"]",
  "[\"角色对话\", \"故事共创\", \"语言练习\"]", "[\"角色丰富\", \"互动感强\"]", "[\"不适合严肃办公\", \"内容质量参差\"]",
  0, 55, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="character-ai");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "tongyi-tingwu", "通义听悟", 5,
  "阿里会议转写与纪要工具，适合录音整理。", "通义听悟面向会议与课程录音：转写、摘要、待办提取，减少会后整理成本。",
  "会议多、需要录音纪要的职场人与学生。", "免费额度 + 付费", "https://tingwu.aliyun.com",
  "[\"听悟\", \"转写\", \"会议\"]", "[\"会议\", \"转写\"]",
  "[\"会议转写\", \"课程笔记\", \"待办提取\", \"发言人区分\"]", "[\"会后整理快\", \"中文转写场景实用\"]", "[\"嘈杂环境准确率下降\", \"隐私需自行评估\"]",
  0, 74, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="tongyi-tingwu");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "iflytek-xinghuo", "讯飞星火", 1,
  "科大讯飞对话产品，偏中文语音与办公。", "星火结合讯飞语音优势，适合中文对话、办公写作与部分行业场景。",
  "需要中文语音/办公辅助的政企与个人用户。", "免费 + 付费", "https://xinghuo.xfyun.cn",
  "[\"星火\", \"讯飞\"]", "[\"中文\", \"语音\"]",
  "[\"中文写作\", \"语音相关场景\", \"办公问答\"]", "[\"中文与语音基因\", \"政企场景可见\"]", "[\"消费级体验因入口而异\", \"需关注套餐\"]",
  0, 70, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="iflytek-xinghuo");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "github-copilot", "GitHub Copilot", 2,
  "编辑器内代码补全，适合日常开发加速。", "GitHub Copilot 在 IDE 中提供行级/块级补全与聊天辅助，贴合日常编码节奏。",
  "使用 VS Code / JetBrains 的开发者。", "订阅制", "https://github.com/features/copilot",
  "[\"copilot\", \"github\", \"补全\"]", "[\"IDE\", \"补全\"]",
  "[\"行级补全\", \"函数草稿\", \"测试样板\", \"注释生成\"]", "[\"补全跟手\", \"生态成熟\"]", "[\"复杂架构仍需人主导\", \"企业合规要评估\"]",
  1, 94, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="github-copilot");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "windsurf", "Windsurf", 2,
  "AI 编程 IDE，强调代理式改代码。", "Windsurf 面向开发者提供编辑器内 AI 协作与代理改码。",
  "希望在 IDE 里完成多文件修改的开发者。", "免费额度 + Pro", "https://windsurf.com",
  "[\"windsurf\", \"codeium\", \"编程\"]", "[\"IDE\", \"代理\"]",
  "[\"多文件修改\", \"重构\", \"解释仓库\", \"生成样板\"]", "[\"代理改码效率高\", \"上手快\"]", "[\"大型仓库上下文需管理\", \"结果需 review\"]",
  1, 90, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="windsurf");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "trae", "Trae", 2,
  "字节系 AI 编程工具，面向写码与改项目。", "Trae 定位 AI 编程助手，适合在真实项目中解释代码、补功能和修 bug。",
  "国内开发者、希望中文编程助手的工程师。", "免费额度 + 付费", "https://www.trae.ai",
  "[\"trae\", \"编程\", \"字节\"]", "[\"IDE\", \"中文\"]",
  "[\"写功能\", \"修 bug\", \"读项目\", \"生成测试\"]", "[\"中文场景友好\", \"贴合写码\"]", "[\"产品迭代快\", \"企业落地需评估\"]",
  1, 91, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="trae");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "tabnine", "Tabnine", 2,
  "偏隐私可选的代码补全工具。", "Tabnine 提供代码补全，并强调可私有化/隐私向部署选项。",
  "在意代码隐私的团队与个人开发者。", "免费 + Pro", "https://www.tabnine.com",
  "[\"tabnine\", \"补全\", \"隐私\"]", "[\"补全\", \"隐私\"]",
  "[\"代码补全\", \"团队模型\", \"本地/私有选项\"]", "[\"隐私选项清晰\", \"补全稳定\"]", "[\"复杂推理不如大上下文代理\", \"需配置\"]",
  0, 66, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="tabnine");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "replit-agent", "Replit Agent", 2,
  "浏览器里从想法到可运行应用的 AI 编程。", "Replit Agent 可在云端环境里生成与迭代应用，适合快速原型与教学演示。",
  "原型开发者、学生、想少配环境的创作者。", "免费额度 + 订阅", "https://replit.com",
  "[\"replit\", \"agent\", \"原型\"]", "[\"云端\", \"原型\"]",
  "[\"快速搭应用\", \"教学演示\", \"小工具开发\"]", "[\"环境免配置\", \"出活快\"]", "[\"复杂生产系统需迁移\", \"额度与性能受限\"]",
  0, 73, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="replit-agent");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "amazon-q", "Amazon Q Developer", 2,
  "亚马逊面向开发者的 AI 助手。", "Amazon Q Developer 可辅助 AWS 相关开发、代码解释与改造建议。",
  "AWS 栈开发者与云上应用维护者。", "免费额度 + Pro", "https://aws.amazon.com/q/developer/",
  "[\"amazon-q\", \"aws\"]", "[\"云\", \"编程\"]",
  "[\"AWS 开发辅助\", \"代码解释\", \"改造建议\"]", "[\"贴合 AWS\", \"企业向\"]", "[\"非 AWS 场景优势一般\", \"需账号体系\"]",
  0, 64, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="amazon-q");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "codeium", "Codeium", 2,
  "高性价比代码补全与聊天。", "Codeium 提供补全与聊天，个人档性价比高，适合日常编码加速。",
  "想要免费/低成本补全的开发者。", "免费 + 团队版", "https://codeium.com",
  "[\"codeium\", \"补全\"]", "[\"免费\", \"补全\"]",
  "[\"补全\", \"简单重构建议\", \"注释\"]", "[\"个人免费友好\", \"速度快\"]", "[\"深度代理能力有限\", \"企业功能看版本\"]",
  0, 71, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="codeium");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "v0", "v0", 2,
  "Vercel 的 UI 生成工具，适合前端界面草稿。", "v0 可根据描述生成界面代码草稿，适合快速出页面原型再精修。",
  "前端/产品同学做 UI 原型时。", "免费额度 + 付费", "https://v0.dev",
  "[\"v0\", \"vercel\", \"ui\"]", "[\"前端\", \"原型\"]",
  "[\"页面草稿\", \"组件生成\", \"设计落地\"]", "[\"出界面快\", \"和现代前端栈契合\"]", "[\"复杂交互需手改\", \"设计一致性要打磨\"]",
  1, 86, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="v0");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "bolt", "Bolt.new", 2,
  "浏览器内全栈应用生成与迭代。", "Bolt.new 可在浏览器里生成可运行全栈应用原型，适合周末项目与演示。",
  "独立开发者、黑客马拉松、快速验证想法的人。", "免费额度 + 订阅", "https://bolt.new",
  "[\"bolt\", \"全栈\", \"原型\"]", "[\"全栈\", \"浏览器\"]",
  "[\"MVP 生成\", \"演示应用\", \"快速迭代\"]", "[\"从想法到可点\"]", "[\"生产级质量需重构\", \"依赖托管额度\"]",
  0, 80, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="bolt");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "lovable", "Lovable", 2,
  "对话式搭建应用，偏产品原型。", "Lovable 用对话推动应用搭建，适合非重度工程师快速做出可演示产品。",
  "产品经理、设计师、独立创业者。", "订阅制", "https://lovable.dev",
  "[\"lovable\", \"应用生成\"]", "[\"原型\", \"对话搭建\"]",
  "[\"产品原型\", \"落地页\", \"内部工具草稿\"]", "[\"对话式搭建顺\"]", "[\"复杂业务逻辑有限\", \"导出/迁移需确认\"]",
  0, 77, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="lovable");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "stable-diffusion", "Stable Diffusion", 3,
  "开源扩散模型生态，可本地或云端出图。", "Stable Diffusion 是开源图像生成生态核心，可搭配 ComfyUI/WebUI 做可控出图。",
  "需要可控出图、模型微调或本地部署的创作者。", "开源免费 + 云费用", "https://stability.ai",
  "[\"sd\", \"stable diffusion\", \"开源\"]", "[\"开源\", \"可控\"]",
  "[\"概念图\", \"模型微调\", \"本地出图\", \"工作流节点\"]", "[\"可控性强\", \"生态大\"]", "[\"学习曲线陡\", \"显卡/云成本\"]",
  1, 89, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="stable-diffusion");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "dalle", "DALL·E", 3,
  "OpenAI 图像生成，入口常在 ChatGPT。", "DALL·E 适合在对话里直接出图、改图，和 ChatGPT 工作流结合紧密。",
  "已经在用 ChatGPT、需要随手配图的用户。", "随 ChatGPT 套餐", "https://openai.com/dall-e-3",
  "[\"dalle\", \"openai\", \"画图\"]", "[\"对话出图\"]",
  "[\"配图\", \"海报草稿\", \"概念图\"]", "[\"对话里直接出\", \"上手简单\"]", "[\"精细控图弱于专用工作流\", \"额度受限\"]",
  0, 76, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="dalle");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "ideogram", "Ideogram", 3,
  "擅长图中文字的生成式画图工具。", "Ideogram 在海报、Logo 草稿等需要可读文字的图像上表现突出。",
  "做海报、封面、含文字视觉的设计/运营。", "免费额度 + 付费", "https://ideogram.ai",
  "[\"ideogram\", \"文字\", \"海报\"]", "[\"文字渲染\", \"设计\"]",
  "[\"海报\", \"封面\", \"Logo 草稿\", \"活动视觉\"]", "[\"图内文字可读性较好\"]", "[\"品牌精修仍需设计软件\"]",
  1, 84, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="ideogram");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "flux", "FLUX", 3,
  "Black Forest Labs 图像模型，细节与真实感受关注。", "FLUX 系列在出图中以细节与真实感口碑兴起，适合高质量静帧。",
  "追求画质的设计师与商业视觉创作者。", "API / 平台订阅", "https://blackforestlabs.ai",
  "[\"flux\", \"bfl\", \"画图\"]", "[\"画质\", \"API\"]",
  "[\"产品图\", \"人像概念\", \"广告静帧\"]", "[\"画质口碑好\"]", "[\"工作流需搭配平台\", \"成本看调用量\"]",
  1, 87, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="flux");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "leonardo", "Leonardo.AI", 3,
  "面向游戏/设计资产的图像平台。", "Leonardo 提供模型与资源管理工作流，适合游戏资产、概念与批量出图。",
  "游戏/内容团队、需要批量视觉资产的创作者。", "免费额度 + 订阅", "https://leonardo.ai",
  "[\"leonardo\", \"游戏\", \"资产\"]", "[\"游戏\", \"批量\"]",
  "[\"游戏资产\", \"概念图\", \"批量生成\"]", "[\"面向资产生产\"]", "[\"风格管控需训练/挑选模型\"]",
  0, 69, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="leonardo");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "canva-ai", "Canva AI", 3,
  "设计工具内的 AI，适合快速平面设计。", "Canva Magic Studio 等能力嵌在熟悉的设计画布里，适合社媒图与海报快制。",
  "运营、市场、不懂专业设计软件的用户。", "免费 + Pro", "https://www.canva.com",
  "[\"canva\", \"设计\", \"海报\"]", "[\"设计\", \"运营\"]",
  "[\"社媒图\", \"海报\", \"演示文稿配图\"]", "[\"门槛低\", \"模板多\"]", "[\"高度定制弱于专业工具\"]",
  0, 75, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="canva-ai");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "firefly", "Adobe Firefly", 3,
  "Adobe 生态内的生成式图像与设计辅助。", "Firefly 与 Photoshop/Express 等结合，适合品牌安全向的商业设计辅助。",
  "Adobe 订阅用户、品牌设计团队。", "随 Adobe 套餐", "https://www.adobe.com/products/firefly.html",
  "[\"firefly\", \"adobe\"]", "[\"商业\", \"设计\"]",
  "[\"商业图草稿\", \"PS 生成式填充\", \"社媒视觉\"]", "[\"商业授权更清晰\", \"贴合 Adobe\"]", "[\"创意上限受模型与积分影响\"]",
  0, 79, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="firefly");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "pika", "Pika", 4,
  "文生/图生视频工具，适合短镜头实验。", "Pika 面向短视频镜头生成与改造，适合创意短片与社媒动态视觉。",
  "短视频创作者、广告预演、视觉实验者。", "免费额度 + 订阅", "https://pika.art",
  "[\"pika\", \"视频\"]", "[\"短视频\", \"生成\"]",
  "[\"文生视频\", \"镜头改造\", \"社媒动态\"]", "[\"出短镜头快\"]", "[\"长叙事与一致性仍难\"]",
  1, 81, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="pika");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "kling", "可灵 AI", 4,
  "快手系视频生成，中文创作者常用。", "可灵面向中文用户的视频生成与创意制作，适合短视频与广告草图。",
  "国内短视频创作者与广告预演团队。", "免费额度 + 付费", "https://klingai.com",
  "[\"可灵\", \"kling\", \"视频\"]", "[\"中文\", \"视频\"]",
  "[\"文生视频\", \"创意短片\", \"广告草图\"]", "[\"中文入口友好\", \"短视频场景贴合\"]", "[\"成片稳定性因提示词而异\", \"积分消耗快\"]",
  1, 85, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="kling");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "luma-dream-machine", "Luma Dream Machine", 4,
  "高质量文生视频，适合电影感短镜头。", "Luma Dream Machine 以运动与光影表现受关注，适合概念预演。",
  "导演/广告/概念预演创作者。", "免费额度 + 付费", "https://lumalabs.ai/dream-machine",
  "[\"luma\", \"dream machine\", \"视频\"]", "[\"电影感\", \"预演\"]",
  "[\"概念镜头\", \"广告预演\", \"氛围片\"]", "[\"运动与质感口碑好\"]", "[\"可控叙事有限\", \"排队/额度\"]",
  0, 78, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="luma-dream-machine");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "sora", "Sora", 4,
  "OpenAI 视频生成，强调时长与连贯性。", "Sora 代表更长、更连贯的视频生成方向，适合高质量概念片（以实际开放地区为准）。",
  "有权限使用的创作者与研究向用户。", "以 OpenAI 套餐为准", "https://openai.com/sora",
  "[\"sora\", \"openai\", \"视频\"]", "[\"长视频\", \"生成\"]",
  "[\"概念片\", \"叙事短片\", \"视觉预演\"]", "[\"连贯性目标高\"]", "[\"可用性与地区限制\", \"成本高\"]",
  0, 83, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="sora");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "capcut-ai", "剪映 AI", 4,
  "剪映内的成片助手，适合短视频剪辑提速。", "剪映 AI 功能覆盖字幕、包装、智能剪辑等，贴合国内短视频发布流。",
  "抖音/短视频创作者与运营。", "免费 + 会员", "https://www.capcut.cn",
  "[\"剪映\", \"capcut\", \"剪辑\"]", "[\"剪辑\", \"短视频\"]",
  "[\"自动字幕\", \"智能包装\", \"粗剪加速\"]", "[\"和发布流一体\", \"中文体验好\"]", "[\"高端调色/特效仍有限\"]",
  1, 88, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="capcut-ai");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "descript", "Descript", 4,
  "以文本编辑音视频著称的创作者工具。", "Descript 把音视频当文档编辑：改字即改时间线，还含录音室与部分生成能力。",
  "播客、教程、口播视频创作者。", "免费额度 + 订阅", "https://www.descript.com",
  "[\"descript\", \"播客\", \"剪辑\"]", "[\"文本剪辑\", \"播客\"]",
  "[\"口播精剪\", \"播客制作\", \"教程视频\"]", "[\"文本编辑时间线很爽\"]", "[\"学习成本\", \"订阅价\"]",
  0, 72, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="descript");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "heygen", "HeyGen", 4,
  "数字人/口播视频生成，适合培训与营销。", "HeyGen 可生成数字人口播视频，适合多语言培训、营销讲解与快速换装讲解。",
  "培训、跨境电商讲解、营销内容团队。", "订阅制", "https://www.heygen.com",
  "[\"heygen\", \"数字人\"]", "[\"数字人\", \"营销\"]",
  "[\"培训视频\", \"多语言口播\", \"产品讲解\"]", "[\"出镜成本低\", \"多语言\"]", "[\"形象自然度需挑选\", \"品牌形象要审核\"]",
  0, 74, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="heygen");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "gamma", "Gamma", 5,
  "AI 生成演示文稿与文档页，适合快速出 PPT。", "Gamma 从提纲生成精美页面，适合汇报草稿与提案初稿。",
  "咨询、销售、学生与需要快速演示的职场人。", "免费额度 + 付费", "https://gamma.app",
  "[\"gamma\", \"ppt\", \"演示\"]", "[\"演示\", \"文档\"]",
  "[\"PPT 初稿\", \"提案\", \"分享页\"]", "[\"出稿快、版式现代\"]", "[\"品牌模板深度定制有限\"]",
  1, 86, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="gamma");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "tome", "Tome", 5,
  "叙事型演示生成工具。", "Tome 强调故事化演示结构，适合讲述型汇报与产品故事。",
  "产品/市场讲述型演示场景。", "免费额度 + 付费", "https://tome.app",
  "[\"tome\", \"演示\"]", "[\"叙事\", \"演示\"]",
  "[\"产品故事\", \"路演稿\", \"讲述型 PPT\"]", "[\"叙事结构清晰\"]", "[\"数据图表精细度一般\"]",
  0, 65, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="tome");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "beautiful-ai", "Beautiful.ai", 5,
  "自动排版的演示文稿工具。", "Beautiful.ai 用智能排版减少对齐烦恼，适合商务演示快速成型。",
  "商务汇报、咨询交付场景。", "订阅制", "https://www.beautiful.ai",
  "[\"beautiful\", \"ppt\"]", "[\"排版\", \"商务\"]",
  "[\"商务 PPT\", \"咨询报告页\"]", "[\"排版省心\"]", "[\"创意自由度受限\", \"价格偏订阅\"]",
  0, 62, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="beautiful-ai");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "jasper", "Jasper", 5,
  "面向营销文案的写作助手。", "Jasper 提供营销向模板与品牌语调，适合广告文案与内容团队批量生产。",
  "市场、增长、内容营销团队。", "订阅制", "https://www.jasper.ai",
  "[\"jasper\", \"营销\", \"文案\"]", "[\"营销\", \"文案\"]",
  "[\"广告文案\", \"落地页\", \"社媒文案\"]", "[\"营销模板全\", \"语调可控\"]", "[\"中文能力看版本\", \"订阅贵\"]",
  0, 67, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="jasper");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "copy-ai", "Copy.ai", 5,
  "营销文案与工作流自动化写作。", "Copy.ai 覆盖短文案到工作流，适合增长团队做多渠道文案草稿。",
  "增长市场、电商运营。", "免费额度 + 付费", "https://www.copy.ai",
  "[\"copy.ai\", \"文案\"]", "[\"增长\", \"文案\"]",
  "[\"广告语\", \"邮件\", \"商品描述\"]", "[\"出短文案快\"]", "[\"长文深度一般\"]",
  0, 63, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="copy-ai");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "grammarly", "Grammarly", 5,
  "英文写作润色与语法检查。", "Grammarly 专注英文语法、清晰度与语气，适合邮件与文档抛光。",
  "英文写作频繁的职场人与学生。", "免费 + Premium", "https://www.grammarly.com",
  "[\"grammarly\", \"英语\", \"润色\"]", "[\"英语\", \"校对\"]",
  "[\"邮件润色\", \"论文语法\", \"语气调整\"]", "[\"英文校对稳\"]", "[\"非英文场景弱\", \"重度依赖订阅\"]",
  0, 70, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="grammarly");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "otter", "Otter.ai", 5,
  "会议录音转写与协作笔记。", "Otter 做会议转写、摘要与协作分享，适合英文会议场景。",
  "英文会议多的远程团队。", "免费额度 + 付费", "https://otter.ai",
  "[\"otter\", \"转写\", \"会议\"]", "[\"会议\", \"英文\"]",
  "[\"英文会议转写\", \"摘要\", \"协作笔记\"]", "[\"会议流顺畅\"]", "[\"中文非主场\", \"隐私评估\"]",
  0, 61, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="otter");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "fireflies", "Fireflies.ai", 5,
  "会议助手：录音、转写、纪要进协作工具。", "Fireflies 可自动加入会议并产出纪要，常与 Notion/Slack 等同步。",
  "会议密集的销售与远程团队。", "免费额度 + 付费", "https://fireflies.ai",
  "[\"fireflies\", \"会议\", \"crm\"]", "[\"会议\", \"销售\"]",
  "[\"自动纪要\", \"行动项\", \"CRM 备注\"]", "[\"自动入会方便\"]", "[\"准确率看口音/环境\", \"合规需审批\"]",
  0, 66, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="fireflies");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "mem", "Mem", 5,
  "AI 笔记，强调自动整理与回忆。", "Mem 把笔记与 AI 检索结合，适合快速记下再回头问自己的知识库。",
  "知识工作者、会议多但懒整理的人。", "订阅制", "https://get.mem.ai",
  "[\"mem\", \"笔记\"]", "[\"笔记\", \"检索\"]",
  "[\"快速记录\", \"回顾提问\", \"知识检索\"]", "[\"减少整理负担\"]", "[\"迁移与导出需确认\"]",
  0, 58, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="mem");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "reflect", "Reflect", 5,
  "日历联动的联网笔记，带 AI 辅助。", "Reflect 结合日历与双向链接笔记，适合日程驱动的知识管理。",
  "注重日程与回顾的个人知识管理用户。", "订阅制", "https://reflect.app",
  "[\"reflect\", \"笔记\", \"日历\"]", "[\"PKM\", \"日历\"]",
  "[\"日程笔记\", \"回顾\", \"双向链接\"]", "[\"和日历结合好\"]", "[\"生态小于 Notion\"]",
  0, 57, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="reflect");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "quillbot", "QuillBot", 5,
  "改写与释义工具，适合学术/英文改述。", "QuillBot 提供释义、语法与摘要，常用于英文改写与降低重复表述。",
  "学生、需要英文改述的内容作者。", "免费 + Premium", "https://quillbot.com",
  "[\"quillbot\", \"改写\"]", "[\"改写\", \"学术\"]",
  "[\"英文释义\", \"语法\", \"摘要\"]", "[\"改写模式多\"]", "[\"滥用学术诚信风险\", \"中文弱\"]",
  0, 56, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="quillbot");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "wordtune", "Wordtune", 5,
  "句子级改写，让表达更清晰自然。", "Wordtune 对选中句子给出多种改写，适合邮件与英文表达打磨。",
  "非母语英文写作者。", "免费 + Premium", "https://www.wordtune.com",
  "[\"wordtune\", \"改写\"]", "[\"句子\", \"英语\"]",
  "[\"邮件句子打磨\", \"语气切换\"]", "[\"改写建议直观\"]", "[\"长文结构能力有限\"]",
  0, 54, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="wordtune");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "photoroom", "PhotoRoom", 3,
  "商品抠图与背景生成，偏电商。", "PhotoRoom 一键去背与场景生成，适合电商主图快速出图。",
  "电商运营、独立站卖家。", "免费额度 + 订阅", "https://www.photoroom.com",
  "[\"photoroom\", \"抠图\", \"电商\"]", "[\"电商\", \"抠图\"]",
  "[\"商品主图\", \"去背\", \"场景背景\"]", "[\"电商向效率高\"]", "[\"品牌大片仍需摄影\"]",
  0, 68, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="photoroom");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "remove-bg", "remove.bg", 3,
  "专注去背的工具，API 友好。", "remove.bg 把去背做到极简，适合批量商品图与证件照场景。",
  "需要稳定去背 API/批量处理的团队。", "免费额度 + 按量", "https://www.remove.bg",
  "[\"remove.bg\", \"去背\"]", "[\"去背\", \"API\"]",
  "[\"批量去背\", \"证件照\", \"商品图\"]", "[\"去背稳、API 清晰\"]", "[\"功能单一\"]",
  0, 60, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="remove-bg");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "elevenlabs", "ElevenLabs", 4,
  "高质量语音合成，适合配音与有声。", "ElevenLabs 以自然语音合成闻名，适合配音、有声书与多语言口播。",
  "内容创作者、培训与有声制作。", "免费额度 + 付费", "https://elevenlabs.io",
  "[\"elevenlabs\", \"tts\", \"配音\"]", "[\"语音\", \"配音\"]",
  "[\"配音\", \"有声书\", \"多语言口播\"]", "[\"音色自然\"]", "[\"声音克隆合规要小心\", \"按字符计费\"]",
  1, 82, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="elevenlabs");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "suno", "Suno", 4,
  "文生音乐，适合BGM与歌曲草稿。", "Suno 可根据描述生成歌曲与伴奏，适合短视频 BGM 与创意音乐草稿。",
  "短视频创作者、音乐爱好者。", "免费额度 + 订阅", "https://suno.com",
  "[\"suno\", \"音乐\", \"bgm\"]", "[\"音乐\", \"生成\"]",
  "[\"BGM\", \"歌曲草稿\", \"创意音乐\"]", "[\"出歌快、趣味强\"]", "[\"商用授权需看清条款\", \"精细编曲有限\"]",
  1, 80, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="suno");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "udio", "Udio", 4,
  "另一款热门 AI 音乐生成工具。", "Udio 同样面向歌曲生成，风格多样，适合音乐灵感与短视频配乐。",
  "音乐创作者与短视频作者。", "免费额度 + 付费", "https://www.udio.com",
  "[\"udio\", \"音乐\"]", "[\"音乐\", \"生成\"]",
  "[\"歌曲草稿\", \"风格探索\", \"配乐\"]", "[\"风格表现力强\"]", "[\"版权与商用需确认\"]",
  0, 76, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="udio");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "manus", "Manus", 5,
  "通用 AI Agent，偏复杂任务自动执行。", "Manus 定位为可执行多步任务的 Agent，适合研究、整理与部分操作流自动化（以产品实际能力为准）。",
  "想尝试 Agent 工作流的早鸟用户。", "邀请/付费以官网为准", "https://manus.im",
  "[\"manus\", \"agent\"]", "[\"Agent\", \"自动化\"]",
  "[\"多步研究\", \"材料整理\", \"任务流\"]", "[\"Agent 方向前沿\"]", "[\"稳定性与权限风险需评估\", \"可用性变化快\"]",
  0, 73, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="manus");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "jimeng", "即梦 AI", 3,
  "字节系图像/视频创意工具，中文创作者常用。", "即梦覆盖文生图与部分视频创意能力，适合国内运营与内容团队快速出视觉。",
  "国内短视频/图文运营与设计师。", "免费额度 + 付费", "https://jimeng.jianying.com",
  "[\"即梦\", \"字节\", \"画图\"]", "[\"中文\", \"视觉\"]",
  "[\"海报\", \"封面\", \"创意视觉\"]", "[\"中文入口顺\", \"和剪映生态近\"]", "[\"商用条款需留意\", \"风格可控性因模式而异\"]",
  0, 79, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="jimeng");
INSERT INTO tool (
  slug, name, category_id, summary, intro, audience, pricing, website_url,
  keywords_json, tags_json, use_cases_json, pros_json, cons_json,
  featured, weight, published, created_at, updated_at, deleted_at
)
SELECT
  "hailuo", "海螺 AI", 1,
  "MiniMax 对话助手，偏创作与多模态。", "海螺提供对话与创作辅助，适合中文写作、角色对话与轻度多模态体验。",
  "内容创作者与喜欢中文对话创作的用户。", "免费 + 会员", "https://hailuoai.com",
  "[\"海螺\", \"minimax\"]", "[\"中文\", \"创作\"]",
  "[\"写作\", \"角色对话\", \"创意灵感\"]", "[\"创作向体验\"]", "[\"专业深度需实测\"]",
  0, 71, 1, NOW(6), NOW(6), NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tool WHERE slug="hailuo");

-- ===== Articles by ADMIN =====
SET @admin_id := (SELECT id FROM users WHERE role='ADMIN' ORDER BY id LIMIT 1);
SET @seed_articles := (SELECT COUNT(*) FROM article WHERE content LIKE '%<!--seed:bulk-v1-->%' AND deleted_at IS NULL);
SET @do_seed_articles := IF(@admin_id IS NULL OR @seed_articles >= 100, 0, 1);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "豆包一周真实体验：值不值得留下？（001）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **豆包** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 豆包；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 0 HOUR), DATE_SUB(NOW(6), INTERVAL 0 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a0 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a0, t.id, 0 FROM tool t
WHERE @a0 IS NOT NULL AND t.slug="doubao" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a0 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a0, t.id, 1 FROM tool t
WHERE @a0 IS NOT NULL AND t.slug="qwen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a0 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "元宝适合谁？三分钟判断要不要用（002）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **元宝** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 元宝；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 1 HOUR), DATE_SUB(NOW(6), INTERVAL 1 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a1 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a1, t.id, 0 FROM tool t
WHERE @a1 IS NOT NULL AND t.slug="yuanbao" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a1 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a1, t.id, 1 FROM tool t
WHERE @a1 IS NOT NULL AND t.slug="chatgpt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a1 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用通义千问完成日常工作的五个场景（003）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **通义千问** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 通义千问；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 2 HOUR), DATE_SUB(NOW(6), INTERVAL 2 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a2 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a2, t.id, 0 FROM tool t
WHERE @a2 IS NOT NULL AND t.slug="qwen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a2 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a2, t.id, 1 FROM tool t
WHERE @a2 IS NOT NULL AND t.slug="runway" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a2 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "DeepSeek上手指南：新手最容易踩的坑（004）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **DeepSeek** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 DeepSeek；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 3 HOUR), DATE_SUB(NOW(6), INTERVAL 3 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a3 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a3, t.id, 0 FROM tool t
WHERE @a3 IS NOT NULL AND t.slug="deepseek" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a3 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "ChatGPT vs 同类：我最终怎么选（005）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **ChatGPT** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 ChatGPT；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 4 HOUR), DATE_SUB(NOW(6), INTERVAL 4 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a4 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a4, t.id, 0 FROM tool t
WHERE @a4 IS NOT NULL AND t.slug="chatgpt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a4 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a4, t.id, 1 FROM tool t
WHERE @a4 IS NOT NULL AND t.slug="perplexity" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a4 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Gemini当主工具一个月后的复盘（006）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Gemini** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Gemini；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 5 HOUR), DATE_SUB(NOW(6), INTERVAL 5 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a5 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a5, t.id, 0 FROM tool t
WHERE @a5 IS NOT NULL AND t.slug="gemini" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a5 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a5, t.id, 1 FROM tool t
WHERE @a5 IS NOT NULL AND t.slug="poe" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a5 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a5, t.id, 2 FROM tool t
WHERE @a5 IS NOT NULL AND t.slug="v0" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a5 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Midjourney免费档够用吗？付费点清单（007）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Midjourney** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Midjourney；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 6 HOUR), DATE_SUB(NOW(6), INTERVAL 6 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a6 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a6, t.id, 0 FROM tool t
WHERE @a6 IS NOT NULL AND t.slug="midjourney" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a6 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Runway在写作场景的表现记录（008）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Runway** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Runway；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 7 HOUR), DATE_SUB(NOW(6), INTERVAL 7 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a7 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a7, t.id, 0 FROM tool t
WHERE @a7 IS NOT NULL AND t.slug="runway" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a7 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a7, t.id, 1 FROM tool t
WHERE @a7 IS NOT NULL AND t.slug="trae" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a7 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Notion AI做总结/提纲的效率实测（009）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Notion AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Notion AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 8 HOUR), DATE_SUB(NOW(6), INTERVAL 8 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a8 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a8, t.id, 0 FROM tool t
WHERE @a8 IS NOT NULL AND t.slug="notion-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a8 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a8, t.id, 1 FROM tool t
WHERE @a8 IS NOT NULL AND t.slug="amazon-q" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a8 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Cursor给团队用的可行性评估（010）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Cursor** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Cursor；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 9 HOUR), DATE_SUB(NOW(6), INTERVAL 9 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a9 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a9, t.id, 0 FROM tool t
WHERE @a9 IS NOT NULL AND t.slug="cursor" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a9 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "文心一言一周真实体验：值不值得留下？（011）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **文心一言** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 文心一言；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 10 HOUR), DATE_SUB(NOW(6), INTERVAL 10 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a10 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a10, t.id, 0 FROM tool t
WHERE @a10 IS NOT NULL AND t.slug="wenxin" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a10 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a10, t.id, 1 FROM tool t
WHERE @a10 IS NOT NULL AND t.slug="dalle" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a10 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a10, t.id, 2 FROM tool t
WHERE @a10 IS NOT NULL AND t.slug="mem" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a10 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Claude适合谁？三分钟判断要不要用（012）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Claude** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「代码解释」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：适合深度改稿\n- 注意：免费额度有限\n\n## 结论\n如果你的需求接近「需要长文处理、英文写作或偏谨慎回答风格的用户。」，可以优先试用 Claude；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://claude.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 11 HOUR), DATE_SUB(NOW(6), INTERVAL 11 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a11 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a11, t.id, 0 FROM tool t
WHERE @a11 IS NOT NULL AND t.slug="claude" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a11 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a11, t.id, 1 FROM tool t
WHERE @a11 IS NOT NULL AND t.slug="leonardo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a11 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Kimi完成日常工作的五个场景（013）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Kimi** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「长文档问答」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：长文本友好\n- 注意：复杂专业判断仍需人工复核\n\n## 结论\n如果你的需求接近「学生、研究员、需要读长材料的职场人。」，可以优先试用 Kimi；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://kimi.moonshot.cn\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 12 HOUR), DATE_SUB(NOW(6), INTERVAL 12 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a12 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a12, t.id, 0 FROM tool t
WHERE @a12 IS NOT NULL AND t.slug="kimi" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a12 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Perplexity上手指南：新手最容易踩的坑（014）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Perplexity** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「竞品信息收集」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：调研效率高\n- 注意：深度分析仍需自己读原文\n\n## 结论\n如果你的需求接近「需要可追溯资料来源的研究员、分析师与内容创作者。」，可以优先试用 Perplexity；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.perplexity.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 13 HOUR), DATE_SUB(NOW(6), INTERVAL 13 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a13 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a13, t.id, 0 FROM tool t
WHERE @a13 IS NOT NULL AND t.slug="perplexity" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a13 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a13, t.id, 1 FROM tool t
WHERE @a13 IS NOT NULL AND t.slug="sora" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a13 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Grok vs 同类：我最终怎么选（015）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Grok** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「创意头脑风暴」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：风格鲜明\n- 注意：严肃场景表达需把关\n\n## 结论\n如果你的需求接近「关注时效信息、喜欢轻松对话风格的用户。」，可以优先试用 Grok；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://grok.x.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 14 HOUR), DATE_SUB(NOW(6), INTERVAL 14 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a14 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a14, t.id, 0 FROM tool t
WHERE @a14 IS NOT NULL AND t.slug="grok" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a14 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a14, t.id, 1 FROM tool t
WHERE @a14 IS NOT NULL AND t.slug="heygen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a14 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Microsoft Copilot当主工具一个月后的复盘（016）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Microsoft Copilot** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「会议纪要思路」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：上手快\n- 注意：复杂表需人工校验\n\n## 结论\n如果你的需求接近「微软生态用户、办公文档重度使用者。」，可以优先试用 Microsoft Copilot；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://copilot.microsoft.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 15 HOUR), DATE_SUB(NOW(6), INTERVAL 15 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a15 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a15, t.id, 0 FROM tool t
WHERE @a15 IS NOT NULL AND t.slug="copilot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a15 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a15, t.id, 1 FROM tool t
WHERE @a15 IS NOT NULL AND t.slug="perplexity" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a15 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Poe免费档够用吗？付费点清单（017）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Poe** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「灵感收集」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：一站多用\n- 注意：深度能力取决于底层模型\n\n## 结论\n如果你的需求接近「想对比多模型、又不想装一堆 App 的用户。」，可以优先试用 Poe；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://poe.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 16 HOUR), DATE_SUB(NOW(6), INTERVAL 16 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a16 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a16, t.id, 0 FROM tool t
WHERE @a16 IS NOT NULL AND t.slug="poe" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a16 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a16, t.id, 1 FROM tool t
WHERE @a16 IS NOT NULL AND t.slug="grammarly" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a16 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Character.AI在写作场景的表现记录（018）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Character.AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「语言练习」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：互动感强\n- 注意：内容质量参差\n\n## 结论\n如果你的需求接近「喜欢角色扮演、叙事共创或口语练习的用户。」，可以优先试用 Character.AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://character.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 17 HOUR), DATE_SUB(NOW(6), INTERVAL 17 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a17 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a17, t.id, 0 FROM tool t
WHERE @a17 IS NOT NULL AND t.slug="character-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a17 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a17, t.id, 1 FROM tool t
WHERE @a17 IS NOT NULL AND t.slug="mem" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a17 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "通义听悟做总结/提纲的效率实测（019）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **通义听悟** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「待办提取」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：会后整理快\n- 注意：嘈杂环境准确率下降\n\n## 结论\n如果你的需求接近「会议多、需要录音纪要的职场人与学生。」，可以优先试用 通义听悟；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://tingwu.aliyun.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 18 HOUR), DATE_SUB(NOW(6), INTERVAL 18 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a18 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a18, t.id, 0 FROM tool t
WHERE @a18 IS NOT NULL AND t.slug="tongyi-tingwu" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a18 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "讯飞星火给团队用的可行性评估（020）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **讯飞星火** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「语音相关场景」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：政企场景可见\n- 注意：需关注套餐\n\n## 结论\n如果你的需求接近「需要中文语音/办公辅助的政企与个人用户。」，可以优先试用 讯飞星火；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://xinghuo.xfyun.cn\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 19 HOUR), DATE_SUB(NOW(6), INTERVAL 19 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a19 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a19, t.id, 0 FROM tool t
WHERE @a19 IS NOT NULL AND t.slug="iflytek-xinghuo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a19 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a19, t.id, 1 FROM tool t
WHERE @a19 IS NOT NULL AND t.slug="elevenlabs" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a19 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "GitHub Copilot一周真实体验：值不值得留下？（021）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **GitHub Copilot** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「行级补全」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：补全跟手\n- 注意：复杂架构仍需人主导\n\n## 结论\n如果你的需求接近「使用 VS Code / JetBrains 的…」，可以优先试用 GitHub Copilot；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://github.com/features/copilot\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 20 HOUR), DATE_SUB(NOW(6), INTERVAL 20 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a20 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a20, t.id, 0 FROM tool t
WHERE @a20 IS NOT NULL AND t.slug="github-copilot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a20 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a20, t.id, 1 FROM tool t
WHERE @a20 IS NOT NULL AND t.slug="manus" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a20 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a20, t.id, 2 FROM tool t
WHERE @a20 IS NOT NULL AND t.slug="kling" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a20 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Windsurf适合谁？三分钟判断要不要用（022）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Windsurf** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「重构」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：上手快\n- 注意：结果需 review\n\n## 结论\n如果你的需求接近「希望在 IDE 里完成多文件修改的开发者。」，可以优先试用 Windsurf；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://windsurf.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 21 HOUR), DATE_SUB(NOW(6), INTERVAL 21 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a21 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a21, t.id, 0 FROM tool t
WHERE @a21 IS NOT NULL AND t.slug="windsurf" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a21 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Trae完成日常工作的五个场景（023）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Trae** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「读项目」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：中文场景友好\n- 注意：产品迭代快\n\n## 结论\n如果你的需求接近「国内开发者、希望中文编程助手的工程师。」，可以优先试用 Trae；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.trae.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 22 HOUR), DATE_SUB(NOW(6), INTERVAL 22 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a22 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a22, t.id, 0 FROM tool t
WHERE @a22 IS NOT NULL AND t.slug="trae" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a22 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a22, t.id, 1 FROM tool t
WHERE @a22 IS NOT NULL AND t.slug="deepseek" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a22 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Tabnine上手指南：新手最容易踩的坑（024）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Tabnine** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「本地/私有选项」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：补全稳定\n- 注意：需配置\n\n## 结论\n如果你的需求接近「在意代码隐私的团队与个人开发者。」，可以优先试用 Tabnine；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.tabnine.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 23 HOUR), DATE_SUB(NOW(6), INTERVAL 23 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a23 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a23, t.id, 0 FROM tool t
WHERE @a23 IS NOT NULL AND t.slug="tabnine" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a23 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a23, t.id, 1 FROM tool t
WHERE @a23 IS NOT NULL AND t.slug="midjourney" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a23 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Replit Agent vs 同类：我最终怎么选（025）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Replit Agent** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「快速搭应用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：环境免配置\n- 注意：复杂生产系统需迁移\n\n## 结论\n如果你的需求接近「原型开发者、学生、想少配环境的创作者。」，可以优先试用 Replit Agent；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://replit.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 24 HOUR), DATE_SUB(NOW(6), INTERVAL 24 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a24 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a24, t.id, 0 FROM tool t
WHERE @a24 IS NOT NULL AND t.slug="replit-agent" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a24 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Amazon Q Developer当主工具一个月后的复盘（026）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Amazon Q Developer** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「代码解释」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：企业向\n- 注意：需账号体系\n\n## 结论\n如果你的需求接近「AWS 栈开发者与云上应用维护者。」，可以优先试用 Amazon Q Developer；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://aws.amazon.com/q/developer/\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 25 HOUR), DATE_SUB(NOW(6), INTERVAL 25 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a25 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a25, t.id, 0 FROM tool t
WHERE @a25 IS NOT NULL AND t.slug="amazon-q" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a25 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a25, t.id, 1 FROM tool t
WHERE @a25 IS NOT NULL AND t.slug="kimi" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a25 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a25, t.id, 2 FROM tool t
WHERE @a25 IS NOT NULL AND t.slug="hailuo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a25 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Codeium免费档够用吗？付费点清单（027）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Codeium** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「注释」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：个人免费友好\n- 注意：深度代理能力有限\n\n## 结论\n如果你的需求接近「想要免费/低成本补全的开发者。」，可以优先试用 Codeium；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://codeium.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 26 HOUR), DATE_SUB(NOW(6), INTERVAL 26 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a26 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a26, t.id, 0 FROM tool t
WHERE @a26 IS NOT NULL AND t.slug="codeium" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a26 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a26, t.id, 1 FROM tool t
WHERE @a26 IS NOT NULL AND t.slug="copilot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a26 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "v0在写作场景的表现记录（028）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **v0** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「页面草稿」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：和现代前端栈契合\n- 注意：设计一致性要打磨\n\n## 结论\n如果你的需求接近「前端/产品同学做 UI 原型时。」，可以优先试用 v0；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://v0.dev\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 27 HOUR), DATE_SUB(NOW(6), INTERVAL 27 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a27 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a27, t.id, 0 FROM tool t
WHERE @a27 IS NOT NULL AND t.slug="v0" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a27 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Bolt.new做总结/提纲的效率实测（029）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Bolt.new** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「演示应用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：从想法到可点\n- 注意：生产级质量需重构\n\n## 结论\n如果你的需求接近「独立开发者、黑客马拉松、快速验证想法的人。」，可以优先试用 Bolt.new；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://bolt.new\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 28 HOUR), DATE_SUB(NOW(6), INTERVAL 28 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a28 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a28, t.id, 0 FROM tool t
WHERE @a28 IS NOT NULL AND t.slug="bolt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a28 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a28, t.id, 1 FROM tool t
WHERE @a28 IS NOT NULL AND t.slug="windsurf" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a28 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Lovable给团队用的可行性评估（030）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Lovable** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「内部工具草稿」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：对话式搭建顺\n- 注意：导出/迁移需确认\n\n## 结论\n如果你的需求接近「产品经理、设计师、独立创业者。」，可以优先试用 Lovable；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://lovable.dev\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 29 HOUR), DATE_SUB(NOW(6), INTERVAL 29 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a29 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a29, t.id, 0 FROM tool t
WHERE @a29 IS NOT NULL AND t.slug="lovable" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a29 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a29, t.id, 1 FROM tool t
WHERE @a29 IS NOT NULL AND t.slug="replit-agent" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a29 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Stable Diffusion一周真实体验：值不值得留下？（031）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Stable Diffusion** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「本地出图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：可控性强\n- 注意：学习曲线陡\n\n## 结论\n如果你的需求接近「需要可控出图、模型微调或本地部署的创作者。」，可以优先试用 Stable Diffusion；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://stability.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 30 HOUR), DATE_SUB(NOW(6), INTERVAL 30 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a30 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a30, t.id, 0 FROM tool t
WHERE @a30 IS NOT NULL AND t.slug="stable-diffusion" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a30 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a30, t.id, 1 FROM tool t
WHERE @a30 IS NOT NULL AND t.slug="replit-agent" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a30 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "DALL·E适合谁？三分钟判断要不要用（032）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **DALL·E** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「海报草稿」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：上手简单\n- 注意：额度受限\n\n## 结论\n如果你的需求接近「已经在用 ChatGPT、需要随手配图的用户。」，可以优先试用 DALL·E；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://openai.com/dall-e-3\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 31 HOUR), DATE_SUB(NOW(6), INTERVAL 31 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a31 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a31, t.id, 0 FROM tool t
WHERE @a31 IS NOT NULL AND t.slug="dalle" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a31 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a31, t.id, 1 FROM tool t
WHERE @a31 IS NOT NULL AND t.slug="stable-diffusion" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a31 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Ideogram完成日常工作的五个场景（033）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Ideogram** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「海报」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：图内文字可读性较好\n- 注意：品牌精修仍需设计软件\n\n## 结论\n如果你的需求接近「做海报、封面、含文字视觉的设计/运营。」，可以优先试用 Ideogram；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://ideogram.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 32 HOUR), DATE_SUB(NOW(6), INTERVAL 32 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a32 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a32, t.id, 0 FROM tool t
WHERE @a32 IS NOT NULL AND t.slug="ideogram" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a32 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a32, t.id, 1 FROM tool t
WHERE @a32 IS NOT NULL AND t.slug="flux" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a32 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "FLUX上手指南：新手最容易踩的坑（034）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **FLUX** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「产品图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：画质口碑好\n- 注意：成本看调用量\n\n## 结论\n如果你的需求接近「追求画质的设计师与商业视觉创作者。」，可以优先试用 FLUX；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://blackforestlabs.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 33 HOUR), DATE_SUB(NOW(6), INTERVAL 33 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a33 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a33, t.id, 0 FROM tool t
WHERE @a33 IS NOT NULL AND t.slug="flux" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a33 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Leonardo.AI vs 同类：我最终怎么选（035）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Leonardo.AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「概念图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：面向资产生产\n- 注意：风格管控需训练/挑选模型\n\n## 结论\n如果你的需求接近「游戏/内容团队、需要批量视觉资产的创作者。」，可以优先试用 Leonardo.AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://leonardo.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 34 HOUR), DATE_SUB(NOW(6), INTERVAL 34 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a34 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a34, t.id, 0 FROM tool t
WHERE @a34 IS NOT NULL AND t.slug="leonardo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a34 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a34, t.id, 1 FROM tool t
WHERE @a34 IS NOT NULL AND t.slug="luma-dream-machine" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a34 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Canva AI当主工具一个月后的复盘（036）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Canva AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「演示文稿配图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：模板多\n- 注意：高度定制弱于专业工具\n\n## 结论\n如果你的需求接近「运营、市场、不懂专业设计软件的用户。」，可以优先试用 Canva AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.canva.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 35 HOUR), DATE_SUB(NOW(6), INTERVAL 35 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a35 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a35, t.id, 0 FROM tool t
WHERE @a35 IS NOT NULL AND t.slug="canva-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a35 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a35, t.id, 1 FROM tool t
WHERE @a35 IS NOT NULL AND t.slug="descript" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a35 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a35, t.id, 2 FROM tool t
WHERE @a35 IS NOT NULL AND t.slug="grammarly" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a35 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Adobe Firefly免费档够用吗？付费点清单（037）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Adobe Firefly** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「商业图草稿」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：商业授权更清晰\n- 注意：创意上限受模型与积分影响\n\n## 结论\n如果你的需求接近「Adobe 订阅用户、品牌设计团队。」，可以优先试用 Adobe Firefly；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.adobe.com/products/firefly.html\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 36 HOUR), DATE_SUB(NOW(6), INTERVAL 36 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a36 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a36, t.id, 0 FROM tool t
WHERE @a36 IS NOT NULL AND t.slug="firefly" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a36 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Pika在写作场景的表现记录（038）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Pika** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「镜头改造」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：出短镜头快\n- 注意：长叙事与一致性仍难\n\n## 结论\n如果你的需求接近「短视频创作者、广告预演、视觉实验者。」，可以优先试用 Pika；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://pika.art\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 37 HOUR), DATE_SUB(NOW(6), INTERVAL 37 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a37 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a37, t.id, 0 FROM tool t
WHERE @a37 IS NOT NULL AND t.slug="pika" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a37 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a37, t.id, 1 FROM tool t
WHERE @a37 IS NOT NULL AND t.slug="copy-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a37 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "可灵 AI做总结/提纲的效率实测（039）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **可灵 AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「广告草图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：中文入口友好\n- 注意：成片稳定性因提示词而异\n\n## 结论\n如果你的需求接近「国内短视频创作者与广告预演团队。」，可以优先试用 可灵 AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://klingai.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 38 HOUR), DATE_SUB(NOW(6), INTERVAL 38 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a38 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a38, t.id, 0 FROM tool t
WHERE @a38 IS NOT NULL AND t.slug="kling" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a38 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a38, t.id, 1 FROM tool t
WHERE @a38 IS NOT NULL AND t.slug="fireflies" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a38 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Luma Dream Machine给团队用的可行性评估（040）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Luma Dream Machine** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「概念镜头」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：运动与质感口碑好\n- 注意：排队/额度\n\n## 结论\n如果你的需求接近「导演/广告/概念预演创作者。」，可以优先试用 Luma Dream Machine；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://lumalabs.ai/dream-machine\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 39 HOUR), DATE_SUB(NOW(6), INTERVAL 39 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a39 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a39, t.id, 0 FROM tool t
WHERE @a39 IS NOT NULL AND t.slug="luma-dream-machine" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a39 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Sora一周真实体验：值不值得留下？（041）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Sora** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「叙事短片」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：连贯性目标高\n- 注意：可用性与地区限制\n\n## 结论\n如果你的需求接近「有权限使用的创作者与研究向用户。」，可以优先试用 Sora；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://openai.com/sora\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 40 HOUR), DATE_SUB(NOW(6), INTERVAL 40 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a40 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a40, t.id, 0 FROM tool t
WHERE @a40 IS NOT NULL AND t.slug="sora" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a40 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a40, t.id, 1 FROM tool t
WHERE @a40 IS NOT NULL AND t.slug="remove-bg" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a40 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a40, t.id, 2 FROM tool t
WHERE @a40 IS NOT NULL AND t.slug="wenxin" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a40 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "剪映 AI适合谁？三分钟判断要不要用（042）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **剪映 AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「粗剪加速」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：中文体验好\n- 注意：高端调色/特效仍有限\n\n## 结论\n如果你的需求接近「抖音/短视频创作者与运营。」，可以优先试用 剪映 AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.capcut.cn\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 41 HOUR), DATE_SUB(NOW(6), INTERVAL 41 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a41 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a41, t.id, 0 FROM tool t
WHERE @a41 IS NOT NULL AND t.slug="capcut-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a41 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a41, t.id, 1 FROM tool t
WHERE @a41 IS NOT NULL AND t.slug="udio" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a41 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Descript完成日常工作的五个场景（043）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Descript** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「口播精剪」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：文本编辑时间线很爽\n- 注意：学习成本\n\n## 结论\n如果你的需求接近「播客、教程、口播视频创作者。」，可以优先试用 Descript；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.descript.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 42 HOUR), DATE_SUB(NOW(6), INTERVAL 42 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a42 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a42, t.id, 0 FROM tool t
WHERE @a42 IS NOT NULL AND t.slug="descript" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a42 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "HeyGen上手指南：新手最容易踩的坑（044）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **HeyGen** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「多语言口播」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：多语言\n- 注意：品牌形象要审核\n\n## 结论\n如果你的需求接近「培训、跨境电商讲解、营销内容团队。」，可以优先试用 HeyGen；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.heygen.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 43 HOUR), DATE_SUB(NOW(6), INTERVAL 43 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a43 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a43, t.id, 0 FROM tool t
WHERE @a43 IS NOT NULL AND t.slug="heygen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a43 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a43, t.id, 1 FROM tool t
WHERE @a43 IS NOT NULL AND t.slug="qwen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a43 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Gamma vs 同类：我最终怎么选（045）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Gamma** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「分享页」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：出稿快、版式现代\n- 注意：品牌模板深度定制有限\n\n## 结论\n如果你的需求接近「咨询、销售、学生与需要快速演示的职场人。」，可以优先试用 Gamma；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://gamma.app\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 44 HOUR), DATE_SUB(NOW(6), INTERVAL 44 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a44 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a44, t.id, 0 FROM tool t
WHERE @a44 IS NOT NULL AND t.slug="gamma" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a44 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a44, t.id, 1 FROM tool t
WHERE @a44 IS NOT NULL AND t.slug="gemini" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a44 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Tome当主工具一个月后的复盘（046）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Tome** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「产品故事」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：叙事结构清晰\n- 注意：数据图表精细度一般\n\n## 结论\n如果你的需求接近「产品/市场讲述型演示场景。」，可以优先试用 Tome；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://tome.app\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 45 HOUR), DATE_SUB(NOW(6), INTERVAL 45 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a45 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a45, t.id, 0 FROM tool t
WHERE @a45 IS NOT NULL AND t.slug="tome" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a45 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a45, t.id, 1 FROM tool t
WHERE @a45 IS NOT NULL AND t.slug="canva-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a45 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Beautiful.ai免费档够用吗？付费点清单（047）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Beautiful.ai** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「商务 PPT」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：排版省心\n- 注意：创意自由度受限\n\n## 结论\n如果你的需求接近「商务汇报、咨询交付场景。」，可以优先试用 Beautiful.ai；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.beautiful.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 46 HOUR), DATE_SUB(NOW(6), INTERVAL 46 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a46 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a46, t.id, 0 FROM tool t
WHERE @a46 IS NOT NULL AND t.slug="beautiful-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a46 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a46, t.id, 1 FROM tool t
WHERE @a46 IS NOT NULL AND t.slug="claude" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a46 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Jasper在写作场景的表现记录（048）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Jasper** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「社媒文案」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：语调可控\n- 注意：订阅贵\n\n## 结论\n如果你的需求接近「市场、增长、内容营销团队。」，可以优先试用 Jasper；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.jasper.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 47 HOUR), DATE_SUB(NOW(6), INTERVAL 47 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a47 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a47, t.id, 0 FROM tool t
WHERE @a47 IS NOT NULL AND t.slug="jasper" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a47 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a47, t.id, 1 FROM tool t
WHERE @a47 IS NOT NULL AND t.slug="grok" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a47 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Copy.ai做总结/提纲的效率实测（049）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Copy.ai** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「广告语」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：出短文案快\n- 注意：长文深度一般\n\n## 结论\n如果你的需求接近「增长市场、电商运营。」，可以优先试用 Copy.ai；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.copy.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 48 HOUR), DATE_SUB(NOW(6), INTERVAL 48 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a48 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a48, t.id, 0 FROM tool t
WHERE @a48 IS NOT NULL AND t.slug="copy-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a48 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Grammarly给团队用的可行性评估（050）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Grammarly** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「论文语法」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：英文校对稳\n- 注意：重度依赖订阅\n\n## 结论\n如果你的需求接近「英文写作频繁的职场人与学生。」，可以优先试用 Grammarly；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.grammarly.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 49 HOUR), DATE_SUB(NOW(6), INTERVAL 49 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a49 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a49, t.id, 0 FROM tool t
WHERE @a49 IS NOT NULL AND t.slug="grammarly" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a49 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a49, t.id, 1 FROM tool t
WHERE @a49 IS NOT NULL AND t.slug="github-copilot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a49 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Otter.ai一周真实体验：值不值得留下？（051）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Otter.ai** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「协作笔记」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：会议流顺畅\n- 注意：中文非主场\n\n## 结论\n如果你的需求接近「英文会议多的远程团队。」，可以优先试用 Otter.ai；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://otter.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 50 HOUR), DATE_SUB(NOW(6), INTERVAL 50 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a50 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a50, t.id, 0 FROM tool t
WHERE @a50 IS NOT NULL AND t.slug="otter" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a50 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a50, t.id, 1 FROM tool t
WHERE @a50 IS NOT NULL AND t.slug="tabnine" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a50 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a50, t.id, 2 FROM tool t
WHERE @a50 IS NOT NULL AND t.slug="udio" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a50 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Fireflies.ai适合谁？三分钟判断要不要用（052）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Fireflies.ai** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「自动纪要」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：自动入会方便\n- 注意：合规需审批\n\n## 结论\n如果你的需求接近「会议密集的销售与远程团队。」，可以优先试用 Fireflies.ai；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://fireflies.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 51 HOUR), DATE_SUB(NOW(6), INTERVAL 51 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a51 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a51, t.id, 0 FROM tool t
WHERE @a51 IS NOT NULL AND t.slug="fireflies" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a51 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Mem完成日常工作的五个场景（053）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Mem** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「回顾提问」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：减少整理负担\n- 注意：迁移与导出需确认\n\n## 结论\n如果你的需求接近「知识工作者、会议多但懒整理的人。」，可以优先试用 Mem；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://get.mem.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 52 HOUR), DATE_SUB(NOW(6), INTERVAL 52 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a52 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a52, t.id, 0 FROM tool t
WHERE @a52 IS NOT NULL AND t.slug="mem" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a52 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a52, t.id, 1 FROM tool t
WHERE @a52 IS NOT NULL AND t.slug="lovable" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a52 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Reflect上手指南：新手最容易踩的坑（054）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Reflect** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「双向链接」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：和日历结合好\n- 注意：生态小于 Notion\n\n## 结论\n如果你的需求接近「注重日程与回顾的个人知识管理用户。」，可以优先试用 Reflect；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://reflect.app\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 53 HOUR), DATE_SUB(NOW(6), INTERVAL 53 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a53 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a53, t.id, 0 FROM tool t
WHERE @a53 IS NOT NULL AND t.slug="reflect" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a53 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a53, t.id, 1 FROM tool t
WHERE @a53 IS NOT NULL AND t.slug="ideogram" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a53 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "QuillBot vs 同类：我最终怎么选（055）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **QuillBot** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「英文释义」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：改写模式多\n- 注意：滥用学术诚信风险\n\n## 结论\n如果你的需求接近「学生、需要英文改述的内容作者。」，可以优先试用 QuillBot；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://quillbot.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 54 HOUR), DATE_SUB(NOW(6), INTERVAL 54 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a54 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a54, t.id, 0 FROM tool t
WHERE @a54 IS NOT NULL AND t.slug="quillbot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a54 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Wordtune当主工具一个月后的复盘（056）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Wordtune** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「语气切换」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：改写建议直观\n- 注意：长文结构能力有限\n\n## 结论\n如果你的需求接近「非母语英文写作者。」，可以优先试用 Wordtune；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.wordtune.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 55 HOUR), DATE_SUB(NOW(6), INTERVAL 55 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a55 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a55, t.id, 0 FROM tool t
WHERE @a55 IS NOT NULL AND t.slug="wordtune" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a55 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a55, t.id, 1 FROM tool t
WHERE @a55 IS NOT NULL AND t.slug="kling" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a55 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a55, t.id, 2 FROM tool t
WHERE @a55 IS NOT NULL AND t.slug="windsurf" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a55 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "PhotoRoom免费档够用吗？付费点清单（057）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **PhotoRoom** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「场景背景」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：电商向效率高\n- 注意：品牌大片仍需摄影\n\n## 结论\n如果你的需求接近「电商运营、独立站卖家。」，可以优先试用 PhotoRoom；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.photoroom.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 56 HOUR), DATE_SUB(NOW(6), INTERVAL 56 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a56 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a56, t.id, 0 FROM tool t
WHERE @a56 IS NOT NULL AND t.slug="photoroom" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a56 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a56, t.id, 1 FROM tool t
WHERE @a56 IS NOT NULL AND t.slug="capcut-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a56 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "remove.bg在写作场景的表现记录（058）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **remove.bg** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「批量去背」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：去背稳、API 清晰\n- 注意：功能单一\n\n## 结论\n如果你的需求接近「需要稳定去背 API/批量处理的团队。」，可以优先试用 remove.bg；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.remove.bg\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 57 HOUR), DATE_SUB(NOW(6), INTERVAL 57 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a57 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a57, t.id, 0 FROM tool t
WHERE @a57 IS NOT NULL AND t.slug="remove-bg" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a57 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "ElevenLabs做总结/提纲的效率实测（059）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **ElevenLabs** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「有声书」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：音色自然\n- 注意：声音克隆合规要小心\n\n## 结论\n如果你的需求接近「内容创作者、培训与有声制作。」，可以优先试用 ElevenLabs；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://elevenlabs.io\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 58 HOUR), DATE_SUB(NOW(6), INTERVAL 58 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a58 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a58, t.id, 0 FROM tool t
WHERE @a58 IS NOT NULL AND t.slug="elevenlabs" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a58 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a58, t.id, 1 FROM tool t
WHERE @a58 IS NOT NULL AND t.slug="jasper" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a58 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Suno给团队用的可行性评估（060）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Suno** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「创意音乐」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：出歌快、趣味强\n- 注意：精细编曲有限\n\n## 结论\n如果你的需求接近「短视频创作者、音乐爱好者。」，可以优先试用 Suno；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://suno.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 59 HOUR), DATE_SUB(NOW(6), INTERVAL 59 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a59 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a59, t.id, 0 FROM tool t
WHERE @a59 IS NOT NULL AND t.slug="suno" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a59 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a59, t.id, 1 FROM tool t
WHERE @a59 IS NOT NULL AND t.slug="otter" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a59 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Udio一周真实体验：值不值得留下？（061）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Udio** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「歌曲草稿」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：风格表现力强\n- 注意：版权与商用需确认\n\n## 结论\n如果你的需求接近「音乐创作者与短视频作者。」，可以优先试用 Udio；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.udio.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 60 HOUR), DATE_SUB(NOW(6), INTERVAL 60 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a60 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a60, t.id, 0 FROM tool t
WHERE @a60 IS NOT NULL AND t.slug="udio" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a60 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a60, t.id, 1 FROM tool t
WHERE @a60 IS NOT NULL AND t.slug="beautiful-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a60 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Manus适合谁？三分钟判断要不要用（062）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Manus** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「材料整理」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：Agent 方向前沿\n- 注意：可用性变化快\n\n## 结论\n如果你的需求接近「想尝试 Agent 工作流的早鸟用户。」，可以优先试用 Manus；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://manus.im\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 61 HOUR), DATE_SUB(NOW(6), INTERVAL 61 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a61 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a61, t.id, 0 FROM tool t
WHERE @a61 IS NOT NULL AND t.slug="manus" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a61 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a61, t.id, 1 FROM tool t
WHERE @a61 IS NOT NULL AND t.slug="photoroom" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a61 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用即梦 AI完成日常工作的五个场景（063）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **即梦 AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「创意视觉」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：中文入口顺\n- 注意：商用条款需留意\n\n## 结论\n如果你的需求接近「国内短视频/图文运营与设计师。」，可以优先试用 即梦 AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://jimeng.jianying.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 62 HOUR), DATE_SUB(NOW(6), INTERVAL 62 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a62 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a62, t.id, 0 FROM tool t
WHERE @a62 IS NOT NULL AND t.slug="jimeng" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a62 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a62, t.id, 1 FROM tool t
WHERE @a62 IS NOT NULL AND t.slug="suno" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a62 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "海螺 AI上手指南：新手最容易踩的坑（064）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **海螺 AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「写作」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：创作向体验\n- 注意：专业深度需实测\n\n## 结论\n如果你的需求接近「内容创作者与喜欢中文对话创作的用户。」，可以优先试用 海螺 AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://hailuoai.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 63 HOUR), DATE_SUB(NOW(6), INTERVAL 63 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a63 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a63, t.id, 0 FROM tool t
WHERE @a63 IS NOT NULL AND t.slug="hailuo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a63 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "豆包 vs 同类：我最终怎么选（065）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **豆包** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 豆包；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 64 HOUR), DATE_SUB(NOW(6), INTERVAL 64 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a64 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a64, t.id, 0 FROM tool t
WHERE @a64 IS NOT NULL AND t.slug="doubao" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a64 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a64, t.id, 1 FROM tool t
WHERE @a64 IS NOT NULL AND t.slug="yuanbao" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a64 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把元宝当主工具一个月后的复盘（066）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **元宝** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 元宝；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 65 HOUR), DATE_SUB(NOW(6), INTERVAL 65 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a65 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a65, t.id, 0 FROM tool t
WHERE @a65 IS NOT NULL AND t.slug="yuanbao" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a65 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a65, t.id, 1 FROM tool t
WHERE @a65 IS NOT NULL AND t.slug="chatgpt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a65 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a65, t.id, 2 FROM tool t
WHERE @a65 IS NOT NULL AND t.slug="runway" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a65 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "通义千问免费档够用吗？付费点清单（067）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **通义千问** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 通义千问；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 66 HOUR), DATE_SUB(NOW(6), INTERVAL 66 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a66 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a66, t.id, 0 FROM tool t
WHERE @a66 IS NOT NULL AND t.slug="qwen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a66 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "DeepSeek在写作场景的表现记录（068）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **DeepSeek** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 DeepSeek；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 67 HOUR), DATE_SUB(NOW(6), INTERVAL 67 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a67 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a67, t.id, 0 FROM tool t
WHERE @a67 IS NOT NULL AND t.slug="deepseek" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a67 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a67, t.id, 1 FROM tool t
WHERE @a67 IS NOT NULL AND t.slug="wenxin" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a67 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "ChatGPT做总结/提纲的效率实测（069）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **ChatGPT** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 ChatGPT；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 68 HOUR), DATE_SUB(NOW(6), INTERVAL 68 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a68 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a68, t.id, 0 FROM tool t
WHERE @a68 IS NOT NULL AND t.slug="chatgpt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a68 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a68, t.id, 1 FROM tool t
WHERE @a68 IS NOT NULL AND t.slug="perplexity" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a68 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Gemini给团队用的可行性评估（070）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Gemini** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Gemini；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 69 HOUR), DATE_SUB(NOW(6), INTERVAL 69 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a69 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a69, t.id, 0 FROM tool t
WHERE @a69 IS NOT NULL AND t.slug="gemini" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a69 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Midjourney一周真实体验：值不值得留下？（071）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Midjourney** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Midjourney；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 70 HOUR), DATE_SUB(NOW(6), INTERVAL 70 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a70 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a70, t.id, 0 FROM tool t
WHERE @a70 IS NOT NULL AND t.slug="midjourney" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a70 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a70, t.id, 1 FROM tool t
WHERE @a70 IS NOT NULL AND t.slug="iflytek-xinghuo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a70 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a70, t.id, 2 FROM tool t
WHERE @a70 IS NOT NULL AND t.slug="ideogram" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a70 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Runway适合谁？三分钟判断要不要用（072）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Runway** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Runway；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 71 HOUR), DATE_SUB(NOW(6), INTERVAL 71 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a71 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a71, t.id, 0 FROM tool t
WHERE @a71 IS NOT NULL AND t.slug="runway" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a71 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a71, t.id, 1 FROM tool t
WHERE @a71 IS NOT NULL AND t.slug="trae" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a71 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Notion AI完成日常工作的五个场景（073）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Notion AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Notion AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 72 HOUR), DATE_SUB(NOW(6), INTERVAL 72 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a72 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a72, t.id, 0 FROM tool t
WHERE @a72 IS NOT NULL AND t.slug="notion-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a72 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Cursor上手指南：新手最容易踩的坑（074）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Cursor** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 Cursor；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 73 HOUR), DATE_SUB(NOW(6), INTERVAL 73 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a73 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a73, t.id, 0 FROM tool t
WHERE @a73 IS NOT NULL AND t.slug="cursor" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a73 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a73, t.id, 1 FROM tool t
WHERE @a73 IS NOT NULL AND t.slug="bolt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a73 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "文心一言 vs 同类：我最终怎么选（075）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **文心一言** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「日常使用」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：体验尚可\n- 注意：需自行评估\n\n## 结论\n如果你的需求接近「通用用户」，可以优先试用 文心一言；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://example.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 74 HOUR), DATE_SUB(NOW(6), INTERVAL 74 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a74 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a74, t.id, 0 FROM tool t
WHERE @a74 IS NOT NULL AND t.slug="wenxin" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a74 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a74, t.id, 1 FROM tool t
WHERE @a74 IS NOT NULL AND t.slug="dalle" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a74 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Claude当主工具一个月后的复盘（076）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Claude** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「代码解释」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：长上下文\n- 注意：免费额度有限\n\n## 结论\n如果你的需求接近「需要长文处理、英文写作或偏谨慎回答风格的用户。」，可以优先试用 Claude；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://claude.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 75 HOUR), DATE_SUB(NOW(6), INTERVAL 75 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a75 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a75, t.id, 0 FROM tool t
WHERE @a75 IS NOT NULL AND t.slug="claude" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a75 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a75, t.id, 1 FROM tool t
WHERE @a75 IS NOT NULL AND t.slug="remove-bg" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a75 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Kimi免费档够用吗？付费点清单（077）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Kimi** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「长文档问答」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：中文体验好\n- 注意：复杂专业判断仍需人工复核\n\n## 结论\n如果你的需求接近「学生、研究员、需要读长材料的职场人。」，可以优先试用 Kimi；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://kimi.moonshot.cn\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 76 HOUR), DATE_SUB(NOW(6), INTERVAL 76 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a76 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a76, t.id, 0 FROM tool t
WHERE @a76 IS NOT NULL AND t.slug="kimi" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a76 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a76, t.id, 1 FROM tool t
WHERE @a76 IS NOT NULL AND t.slug="pika" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a76 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Perplexity在写作场景的表现记录（078）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Perplexity** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「竞品信息收集」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：调研效率高\n- 注意：深度分析仍需自己读原文\n\n## 结论\n如果你的需求接近「需要可追溯资料来源的研究员、分析师与内容创作者。」，可以优先试用 Perplexity；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.perplexity.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 77 HOUR), DATE_SUB(NOW(6), INTERVAL 77 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a77 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a77, t.id, 0 FROM tool t
WHERE @a77 IS NOT NULL AND t.slug="perplexity" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a77 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a77, t.id, 1 FROM tool t
WHERE @a77 IS NOT NULL AND t.slug="sora" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a77 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Grok做总结/提纲的效率实测（079）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Grok** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「热点讨论」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：风格鲜明\n- 注意：严肃场景表达需把关\n\n## 结论\n如果你的需求接近「关注时效信息、喜欢轻松对话风格的用户。」，可以优先试用 Grok；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://grok.x.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 78 HOUR), DATE_SUB(NOW(6), INTERVAL 78 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a78 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a78, t.id, 0 FROM tool t
WHERE @a78 IS NOT NULL AND t.slug="grok" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a78 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Microsoft Copilot给团队用的可行性评估（080）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Microsoft Copilot** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「会议纪要思路」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：上手快\n- 注意：复杂表需人工校验\n\n## 结论\n如果你的需求接近「微软生态用户、办公文档重度使用者。」，可以优先试用 Microsoft Copilot；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://copilot.microsoft.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 79 HOUR), DATE_SUB(NOW(6), INTERVAL 79 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a79 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a79, t.id, 0 FROM tool t
WHERE @a79 IS NOT NULL AND t.slug="copilot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a79 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a79, t.id, 1 FROM tool t
WHERE @a79 IS NOT NULL AND t.slug="beautiful-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a79 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Poe一周真实体验：值不值得留下？（081）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Poe** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「轻度写作」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：一站多用\n- 注意：深度能力取决于底层模型\n\n## 结论\n如果你的需求接近「想对比多模型、又不想装一堆 App 的用户。」，可以优先试用 Poe；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://poe.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 80 HOUR), DATE_SUB(NOW(6), INTERVAL 80 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a80 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a80, t.id, 0 FROM tool t
WHERE @a80 IS NOT NULL AND t.slug="poe" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a80 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a80, t.id, 1 FROM tool t
WHERE @a80 IS NOT NULL AND t.slug="grammarly" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a80 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a80, t.id, 2 FROM tool t
WHERE @a80 IS NOT NULL AND t.slug="tongyi-tingwu" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a80 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Character.AI适合谁？三分钟判断要不要用（082）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Character.AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「角色对话」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：互动感强\n- 注意：内容质量参差\n\n## 结论\n如果你的需求接近「喜欢角色扮演、叙事共创或口语练习的用户。」，可以优先试用 Character.AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://character.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 81 HOUR), DATE_SUB(NOW(6), INTERVAL 81 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a81 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a81, t.id, 0 FROM tool t
WHERE @a81 IS NOT NULL AND t.slug="character-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a81 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用通义听悟完成日常工作的五个场景（083）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **通义听悟** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「待办提取」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：会后整理快\n- 注意：嘈杂环境准确率下降\n\n## 结论\n如果你的需求接近「会议多、需要录音纪要的职场人与学生。」，可以优先试用 通义听悟；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://tingwu.aliyun.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 82 HOUR), DATE_SUB(NOW(6), INTERVAL 82 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a82 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a82, t.id, 0 FROM tool t
WHERE @a82 IS NOT NULL AND t.slug="tongyi-tingwu" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a82 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a82, t.id, 1 FROM tool t
WHERE @a82 IS NOT NULL AND t.slug="wordtune" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a82 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "讯飞星火上手指南：新手最容易踩的坑（084）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **讯飞星火** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「办公问答」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：政企场景可见\n- 注意：需关注套餐\n\n## 结论\n如果你的需求接近「需要中文语音/办公辅助的政企与个人用户。」，可以优先试用 讯飞星火；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://xinghuo.xfyun.cn\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 83 HOUR), DATE_SUB(NOW(6), INTERVAL 83 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a83 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a83, t.id, 0 FROM tool t
WHERE @a83 IS NOT NULL AND t.slug="iflytek-xinghuo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a83 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a83, t.id, 1 FROM tool t
WHERE @a83 IS NOT NULL AND t.slug="elevenlabs" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a83 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "GitHub Copilot vs 同类：我最终怎么选（085）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **GitHub Copilot** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「行级补全」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：补全跟手\n- 注意：复杂架构仍需人主导\n\n## 结论\n如果你的需求接近「使用 VS Code / JetBrains 的…」，可以优先试用 GitHub Copilot；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://github.com/features/copilot\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 84 HOUR), DATE_SUB(NOW(6), INTERVAL 84 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a84 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a84, t.id, 0 FROM tool t
WHERE @a84 IS NOT NULL AND t.slug="github-copilot" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a84 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把Windsurf当主工具一个月后的复盘（086）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Windsurf** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「重构」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：上手快\n- 注意：结果需 review\n\n## 结论\n如果你的需求接近「希望在 IDE 里完成多文件修改的开发者。」，可以优先试用 Windsurf；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://windsurf.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 85 HOUR), DATE_SUB(NOW(6), INTERVAL 85 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a85 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a85, t.id, 0 FROM tool t
WHERE @a85 IS NOT NULL AND t.slug="windsurf" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a85 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a85, t.id, 1 FROM tool t
WHERE @a85 IS NOT NULL AND t.slug="doubao" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a85 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a85, t.id, 2 FROM tool t
WHERE @a85 IS NOT NULL AND t.slug="heygen" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a85 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Trae免费档够用吗？付费点清单（087）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Trae** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「读项目」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：中文场景友好\n- 注意：产品迭代快\n\n## 结论\n如果你的需求接近「国内开发者、希望中文编程助手的工程师。」，可以优先试用 Trae；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.trae.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 86 HOUR), DATE_SUB(NOW(6), INTERVAL 86 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a86 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a86, t.id, 0 FROM tool t
WHERE @a86 IS NOT NULL AND t.slug="trae" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a86 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a86, t.id, 1 FROM tool t
WHERE @a86 IS NOT NULL AND t.slug="deepseek" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a86 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Tabnine在写作场景的表现记录（088）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Tabnine** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「代码补全」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：补全稳定\n- 注意：需配置\n\n## 结论\n如果你的需求接近「在意代码隐私的团队与个人开发者。」，可以优先试用 Tabnine；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.tabnine.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 87 HOUR), DATE_SUB(NOW(6), INTERVAL 87 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a87 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a87, t.id, 0 FROM tool t
WHERE @a87 IS NOT NULL AND t.slug="tabnine" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a87 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Replit Agent做总结/提纲的效率实测（089）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Replit Agent** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「教学演示」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：环境免配置\n- 注意：复杂生产系统需迁移\n\n## 结论\n如果你的需求接近「原型开发者、学生、想少配环境的创作者。」，可以优先试用 Replit Agent；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://replit.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 88 HOUR), DATE_SUB(NOW(6), INTERVAL 88 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a88 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a88, t.id, 0 FROM tool t
WHERE @a88 IS NOT NULL AND t.slug="replit-agent" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a88 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a88, t.id, 1 FROM tool t
WHERE @a88 IS NOT NULL AND t.slug="cursor" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a88 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Amazon Q Developer给团队用的可行性评估（090）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Amazon Q Developer** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「改造建议」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：企业向\n- 注意：需账号体系\n\n## 结论\n如果你的需求接近「AWS 栈开发者与云上应用维护者。」，可以优先试用 Amazon Q Developer；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://aws.amazon.com/q/developer/\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 89 HOUR), DATE_SUB(NOW(6), INTERVAL 89 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a89 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a89, t.id, 0 FROM tool t
WHERE @a89 IS NOT NULL AND t.slug="amazon-q" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a89 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a89, t.id, 1 FROM tool t
WHERE @a89 IS NOT NULL AND t.slug="kimi" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a89 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Codeium一周真实体验：值不值得留下？（091）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Codeium** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「补全」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：个人免费友好\n- 注意：深度代理能力有限\n\n## 结论\n如果你的需求接近「想要免费/低成本补全的开发者。」，可以优先试用 Codeium；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://codeium.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 90 HOUR), DATE_SUB(NOW(6), INTERVAL 90 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a90 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a90, t.id, 0 FROM tool t
WHERE @a90 IS NOT NULL AND t.slug="codeium" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a90 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a90, t.id, 1 FROM tool t
WHERE @a90 IS NOT NULL AND t.slug="chatgpt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a90 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "v0适合谁？三分钟判断要不要用（092）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **v0** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「组件生成」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：和现代前端栈契合\n- 注意：设计一致性要打磨\n\n## 结论\n如果你的需求接近「前端/产品同学做 UI 原型时。」，可以优先试用 v0；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://v0.dev\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 91 HOUR), DATE_SUB(NOW(6), INTERVAL 91 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a91 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a91, t.id, 0 FROM tool t
WHERE @a91 IS NOT NULL AND t.slug="v0" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a91 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a91, t.id, 1 FROM tool t
WHERE @a91 IS NOT NULL AND t.slug="tongyi-tingwu" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a91 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "我用Bolt.new完成日常工作的五个场景（093）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Bolt.new** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「快速迭代」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：从想法到可点\n- 注意：生产级质量需重构\n\n## 结论\n如果你的需求接近「独立开发者、黑客马拉松、快速验证想法的人。」，可以优先试用 Bolt.new；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://bolt.new\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 92 HOUR), DATE_SUB(NOW(6), INTERVAL 92 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a92 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a92, t.id, 0 FROM tool t
WHERE @a92 IS NOT NULL AND t.slug="bolt" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a92 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a92, t.id, 1 FROM tool t
WHERE @a92 IS NOT NULL AND t.slug="windsurf" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a92 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Lovable上手指南：新手最容易踩的坑（094）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Lovable** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「产品原型」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：对话式搭建顺\n- 注意：导出/迁移需确认\n\n## 结论\n如果你的需求接近「产品经理、设计师、独立创业者。」，可以优先试用 Lovable；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://lovable.dev\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 93 HOUR), DATE_SUB(NOW(6), INTERVAL 93 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a93 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a93, t.id, 0 FROM tool t
WHERE @a93 IS NOT NULL AND t.slug="lovable" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a93 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Stable Diffusion vs 同类：我最终怎么选（095）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Stable Diffusion** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「本地出图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：可控性强\n- 注意：学习曲线陡\n\n## 结论\n如果你的需求接近「需要可控出图、模型微调或本地部署的创作者。」，可以优先试用 Stable Diffusion；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://stability.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 94 HOUR), DATE_SUB(NOW(6), INTERVAL 94 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a94 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a94, t.id, 0 FROM tool t
WHERE @a94 IS NOT NULL AND t.slug="stable-diffusion" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a94 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a94, t.id, 1 FROM tool t
WHERE @a94 IS NOT NULL AND t.slug="v0" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a94 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "把DALL·E当主工具一个月后的复盘（096）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **DALL·E** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「概念图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：上手简单\n- 注意：额度受限\n\n## 结论\n如果你的需求接近「已经在用 ChatGPT、需要随手配图的用户。」，可以优先试用 DALL·E；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://openai.com/dall-e-3\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 95 HOUR), DATE_SUB(NOW(6), INTERVAL 95 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a95 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a95, t.id, 0 FROM tool t
WHERE @a95 IS NOT NULL AND t.slug="dalle" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a95 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a95, t.id, 1 FROM tool t
WHERE @a95 IS NOT NULL AND t.slug="stable-diffusion" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a95 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a95, t.id, 2 FROM tool t
WHERE @a95 IS NOT NULL AND t.slug="lovable" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a95 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Ideogram免费档够用吗？付费点清单（097）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Ideogram** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「海报」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：图内文字可读性较好\n- 注意：品牌精修仍需设计软件\n\n## 结论\n如果你的需求接近「做海报、封面、含文字视觉的设计/运营。」，可以优先试用 Ideogram；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://ideogram.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 96 HOUR), DATE_SUB(NOW(6), INTERVAL 96 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a96 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a96, t.id, 0 FROM tool t
WHERE @a96 IS NOT NULL AND t.slug="ideogram" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a96 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "FLUX在写作场景的表现记录（098）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **FLUX** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「人像概念」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：画质口碑好\n- 注意：成本看调用量\n\n## 结论\n如果你的需求接近「追求画质的设计师与商业视觉创作者。」，可以优先试用 FLUX；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://blackforestlabs.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 97 HOUR), DATE_SUB(NOW(6), INTERVAL 97 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a97 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a97, t.id, 0 FROM tool t
WHERE @a97 IS NOT NULL AND t.slug="flux" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a97 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a97, t.id, 1 FROM tool t
WHERE @a97 IS NOT NULL AND t.slug="firefly" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a97 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Leonardo.AI做总结/提纲的效率实测（099）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Leonardo.AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「批量生成」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：面向资产生产\n- 注意：风格管控需训练/挑选模型\n\n## 结论\n如果你的需求接近「游戏/内容团队、需要批量视觉资产的创作者。」，可以优先试用 Leonardo.AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://leonardo.ai\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 98 HOUR), DATE_SUB(NOW(6), INTERVAL 98 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a98 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a98, t.id, 0 FROM tool t
WHERE @a98 IS NOT NULL AND t.slug="leonardo" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a98 AND x.tool_id=t.id);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a98, t.id, 1 FROM tool t
WHERE @a98 IS NOT NULL AND t.slug="luma-dream-machine" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a98 AND x.tool_id=t.id);
INSERT INTO article (title, content, published, author_id, created_at, updated_at, deleted_at, cover_url, related_project_id)
SELECT "Canva AI给团队用的可行性评估（100）", "<!--seed:bulk-v1-->\n## 背景\n我从「站点管理员」视角整理了 **Canva AI** 的近期使用笔记，方便站内导览与评测互相跳转。\n\n## 我怎么用\n主要用来做「社媒图」，并穿插对比同分类产品。\n\n## 体验感受\n- 优点：模板多\n- 注意：高度定制弱于专业工具\n\n## 结论\n如果你的需求接近「运营、市场、不懂专业设计软件的用户。」，可以优先试用 Canva AI；否则建议先看同分类其它产品对比。\n\n> 定价与功能以官网为准：https://www.canva.com\n", 1, @admin_id,
       DATE_SUB(NOW(6), INTERVAL 99 HOUR), DATE_SUB(NOW(6), INTERVAL 99 HOUR), NULL, NULL, NULL
FROM DUAL WHERE @do_seed_articles = 1;
SET @a99 := IF(@do_seed_articles=1, LAST_INSERT_ID(), NULL);
INSERT INTO article_tool (article_id, tool_id, sort_order)
SELECT @a99, t.id, 0 FROM tool t
WHERE @a99 IS NOT NULL AND t.slug="canva-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM article_tool x WHERE x.article_id=@a99 AND x.tool_id=t.id);

-- ===== Deals =====
SET @seed_deals := (SELECT COUNT(*) FROM deal WHERE description LIKE '%<!--seed:bulk-v1-->%' AND deleted_at IS NULL);
SET @do_seed_deals := IF(@seed_deals >= 10, 0, 1);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "豆包会员新客礼", "新用户开通会员可享限时折扣，适合想加深日常问答与写作体验的同学。 <!--seed:bulk-v1-->", "DOUBAO10", "https://www.doubao.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 20 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="doubao" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="豆包会员新客礼" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "ChatGPT Plus 体验季", "部分渠道限时优惠（以支付页为准），适合需要稳定长对话的用户。 <!--seed:bulk-v1-->", NULL, "https://chatgpt.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 23 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="chatgpt" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="ChatGPT Plus 体验季" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Cursor Pro 限时优惠", "开发者订阅限时活动，适合把 AI 写码当作日常主力的工程师。 <!--seed:bulk-v1-->", "CURSORDEV", "https://cursor.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 26 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="cursor" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Cursor Pro 限时优惠" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Midjourney 订阅活动", "图像订阅限时礼遇，适合概念图与视觉探索高频用户。 <!--seed:bulk-v1-->", NULL, "https://www.midjourney.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 29 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="midjourney" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Midjourney 订阅活动" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "可灵创作积分包", "视频生成积分包促销，适合短视频广告预演。 <!--seed:bulk-v1-->", "KLING88", "https://klingai.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 32 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="kling" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="可灵创作积分包" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Gamma 年付更划算", "演示文稿工具年付折扣，适合经常做汇报的职场人。 <!--seed:bulk-v1-->", "GAMMA20", "https://gamma.app",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 35 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="gamma" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Gamma 年付更划算" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Perplexity Pro 月度礼", "检索式问答 Pro 档限时，适合需要引用来源的调研党。 <!--seed:bulk-v1-->", NULL, "https://www.perplexity.ai",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 38 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="perplexity" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Perplexity Pro 月度礼" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "ElevenLabs Creator 优惠", "语音合成 Creator 档活动，适合配音与有声内容。 <!--seed:bulk-v1-->", "VOICE15", "https://elevenlabs.io",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 41 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="elevenlabs" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="ElevenLabs Creator 优惠" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Notion AI 席位促销", "文档内 AI 席位限时，适合知识库团队。 <!--seed:bulk-v1-->", NULL, "https://www.notion.com/product/ai",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 44 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="notion-ai" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Notion AI 席位促销" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "DeepSeek API 体验金", "API 调用体验相关活动（以控制台为准），适合开发者接入。 <!--seed:bulk-v1-->", "DSAPI", "https://www.deepseek.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 47 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="deepseek" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="DeepSeek API 体验金" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Claude Pro 限时", "长文写作向 Pro 档活动，适合深度改稿用户。 <!--seed:bulk-v1-->", NULL, "https://claude.ai",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 50 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="claude" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Claude Pro 限时" AND d.deleted_at IS NULL
);
INSERT INTO deal (tool_id, title, description, promo_code, url, starts_at, ends_at, status, created_at, updated_at, deleted_at)
SELECT t.id, "Suno 音乐积分包", "文生音乐积分促销，适合短视频 BGM。 <!--seed:bulk-v1-->", "SUNO11", "https://suno.com",
       DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 53 DAY), 'ACTIVE', NOW(6), NOW(6), NULL
FROM tool t
WHERE @do_seed_deals=1 AND t.slug="suno" AND t.deleted_at IS NULL
AND NOT EXISTS (
  SELECT 1 FROM deal d WHERE d.title="Suno 音乐积分包" AND d.deleted_at IS NULL
);
COMMIT;

SELECT 'tools' k, COUNT(*) v FROM tool WHERE deleted_at IS NULL
UNION ALL SELECT 'articles', COUNT(*) FROM article WHERE deleted_at IS NULL
UNION ALL SELECT 'seed_articles', COUNT(*) FROM article WHERE content LIKE '%<!--seed:bulk-v1-->%' AND deleted_at IS NULL
UNION ALL SELECT 'deals', COUNT(*) FROM deal WHERE deleted_at IS NULL
UNION ALL SELECT 'seed_deals', COUNT(*) FROM deal WHERE description LIKE '%<!--seed:bulk-v1-->%' AND deleted_at IS NULL;