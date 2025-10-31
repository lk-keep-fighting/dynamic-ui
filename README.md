# AI 动态界面 Demo

一个基于 **Next.js 14 + React + Shadcn UI + Supabase** 的动态界面演示项目。系统能够通过 AI（或内置规则）解析业务对话，自动生成业务数据模型（Schema）、操作描述（Operations）与交互范式（Patterns），并将这些结构化定义即时拼装为可交互的中后台界面。

> 目标：提供一个端到端示例，展示如何将“业务需求 → Schema → 组件组合 → 交互界面”这一链路自动化。

## 功能一览

- **React + Shadcn UI 动态组件渲染**：数据表格、统计卡片、表单、抽屉、时间线、标签页等常见中后台组件可根据 Schema 自动实例化。
- **交互范式库**：内置 `collection-hub`、`detail-dashboard`、`workflow-console`、`analytics-summary` 等多种布局模式。
- **Schema & Operation 定义**：以 TypeScript 类型描述业务实体、字段、关系与操作，支持自动生成表格列、表单校验与操作入口。
- **AI 接入（可选）**：
  - 若配置 `OPENAI_API_KEY`，通过 OpenAI Responses API 生成符合 JSON Schema 的业务定义。
  - 无外部依赖时使用本地 Mock 解析器，根据关键词匹配预制场景。
- **Supabase 集成（可选）**：若配置 Supabase，可将对话与生成结果存储到 `ai_ui_sessions` 表中，便于后续分析与追踪。
- **演示场景**：销售订单、仓储库存、员工绩效三个典型中后台业务，展示 Schema 驱动的多范式界面。

## 快速开始

```bash
npm install
npm run dev
```

访问以下页面体验：

- `http://localhost:3000/` - 项目概览与功能介绍
- `http://localhost:3000/demo` - 选择预置 Schema，查看动态界面渲染效果
- `http://localhost:3000/chat` - 与 AI（或 Mock）对话，实时生成界面

## 可选配置

创建 `.env.local` 并根据需要添加：

```bash
# OpenAI（可选）
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini # 可选，默认 gpt-4o-mini

# Supabase（可选，用于记录对话与生成结果）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

如果启用 Supabase，建议创建 `ai_ui_sessions` 表结构：

```sql
create table if not exists ai_ui_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  messages jsonb,
  runtime jsonb
);
```

## 核心目录结构

```
src/
  app/
    api/ai/plan/route.ts    # 对话转 Schema 的 API（支持 OpenAI / Mock）
    demo/page.tsx           # Schema → UI 演示场景
    chat/page.tsx           # 对话式界面生成
    page.tsx                # 项目首页
  components/
    ai/conversation-planner.tsx     # 对话 + 结果展示
    dynamic/dynamic-ui-renderer.tsx # 根据 UI Block 渲染页面
    dynamic/operation-form.tsx      # 动态表单与操作触发器
    ui/*                            # Shadcn 组件库
  data/samples.ts                  # 预置业务 Schema 与数据
  lib/
    schema.ts                      # 业务数据模型与类型定义
    ui-blocks.ts                   # 根据 Schema 构建 UI Blocks
    ai/interpreter.ts              # AI / Mock 解析器
    supabase/*                     # Supabase 客户端及日志记录
```

## 技术要点

- **动态表单生成**：利用 `react-hook-form` + `zod`，根据 Operation 参数推导校验规则与控件类型。
- **组件知识库**：`component-catalog.ts` 描述每个 UI 组件的用途、适用场景与输入参数，便于 AI 做语义选型。
- **交互范式**：`ui-blocks.ts` 中的 `buildUI` 函数将业务模式转换为渲染用的 `UIBlock` 列表，涵盖指标卡、表格、详情、时间线、表单等组合。
- **AI Fallback**：`interpretConversation` 自动判断是否存在 `OPENAI_API_KEY`，没有则回退到 Mock 方案，保持演示可用性。

## 后续扩展方向

- 引入权限控制、字段级展示策略等更复杂的规则。
- 扩充组件库（图表、看板、流程图）与交互范式。
- 将 AI 生成的 Schema 与实际后端（如 Supabase）数据表结构联动，形成真正的低代码 CRUD 体验。

欢迎探索、扩展或集成到自身的中后台项目中。若有任何反馈，欢迎提交 issue！
