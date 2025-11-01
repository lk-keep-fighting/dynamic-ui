import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const featureList = [
  {
    title: "Schema 驱动",
    description:
      "通过业务数据模型与操作描述，自动推导表格、表单、指标等组合，保持中后台一致性。",
  },
  {
    title: "组件知识库",
    description:
      "内置常见中台组件（数据表格、统计卡、操作抽屉、时间线等），支持AI语义选型。",
  },
  {
    title: "多交互范式",
    description:
      "支持集合工作台、详情仪表板、流程控制台、指标看板等典型布局模式。",
  },
  {
    title: "AI 对话接入",
    description:
      "以自然语言描述业务需求，AI 自动生成 Schema、Operation、Pattern 并渲染 UI。",
  },
];

const steps = [
  {
    title: "描述业务目标",
    detail: "通过对话输入实体、关键字段、流程动作和使用人群。",
  },
  {
    title: "AI 生成 Schema",
    detail: "AI 将需求转换为数据模型、操作 Schema 和交互范式定义。",
  },
  {
    title: "动态拼装界面",
    detail: "系统根据 Schema 选择最合适的组件组合并渲染。",
  },
  {
    title: "实时交互",
    detail: "可传入真实数据，表单操作自动触发 API 或业务逻辑。",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge variant="outline" className="bg-white/80">
              AI Dynamic UI / React + Shadcn + Next.js
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">
              AI 驱动的动态界面演示工程
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              通过 Schema、Operations 与交互模式定义，将业务对话即时转化为中后台界面。
              本项目展示如何在 React / Next.js + Shadcn + Supabase 技术栈下构建动态 UI 引擎。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/demo">查看 Schema → UI Demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/chat">体验对话式生成</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">预制组件</CardTitle>
                <CardDescription>针对中后台常见场景封装</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">8+</p>
                <p className="text-xs text-muted-foreground">表格 / 表单 / 工具栏 / 时间线等</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">交互范式</CardTitle>
                <CardDescription>支持多种布局组合</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">4</p>
                <p className="text-xs text-muted-foreground">工作台 / 仪表板 / 流程 / 分析</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {featureList.map((feature) => (
          <Card key={feature.title} className="border-dashed">
            <CardHeader>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl border bg-card/60 p-8">
        <h2 className="text-2xl font-semibold">从对话到界面，仅需四步</h2>
        <p className="text-sm text-muted-foreground">
          流程可以重复执行，支持持续对话迭代 Schema。
        </p>
        <Separator className="my-6" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader className="pb-2">
                <CardDescription>Step {index + 1}</CardDescription>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border p-8">
        <h2 className="text-2xl font-semibold">快速开始</h2>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li>1. 在 <code>.env.local</code> 中配置 Supabase 与 OpenAI（可选）。</li>
          <li>2. 使用 <code>npm run dev</code> 启动项目。</li>
          <li>3. 访问 <Link className="underline" href="/demo">/demo</Link> 查看 Schema 驱动的界面。</li>
          <li>4. 访问 <Link className="underline" href="/chat">/chat</Link> 与 AI 对话生成新的界面。</li>
        </ol>
      </section>
    </div>
  );
}
