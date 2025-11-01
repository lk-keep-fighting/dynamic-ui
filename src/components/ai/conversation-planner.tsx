"use client";

import { useMemo, useState } from "react";
import { ConversationMessage } from "@/lib/ai/interpreter";
import { BusinessAppRuntimePayload } from "@/lib/schema";
import { DynamicUIRenderer } from "@/components/dynamic/dynamic-ui-renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { componentCatalog } from "@/lib/component-catalog";
import { toast } from "sonner";
import {
  RequirementIntakeForm,
  PlannerIntakeValues,
  plannerIntakeFields,
} from "@/components/ai/planner-intake-form";

const suggestions = [
  "我们是一家B2B SaaS公司，需要一个销售订单管理控制台，包含订单列表、关键指标和快速创建/更新订单的能力。",
  "请为人力资源部门生成一套员工绩效管理界面，需要查看绩效分布、更新评级并制定改进计划。",
  "构建一个仓储库存监控的后台，需要展示库存水位、补货计划和调拨操作。",
];

export function ConversationPlanner() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      content: "你好，我是智能界面规划助手，请描述你的业务场景和数据需求。",
    },
  ]);
  const [input, setInput] = useState("");
  const [runtime, setRuntime] = useState<BusinessAppRuntimePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingForm, setPendingForm] = useState<"intake" | null>(null);
  const [intakeValues, setIntakeValues] = useState<PlannerIntakeValues | null>(null);

  const hasPendingForm = Boolean(pendingForm);
  const hasIntakeValues = Boolean(intakeValues);

  const latestSummary = useMemo(() => {
    if (!runtime) return "";
    const entityCount = runtime.schema.entities.length;
    const operationCount = runtime.schema.operations.length;
    const patternCount = runtime.schema.patterns.length;
    return `已生成 ${runtime.schema.name}：包含 ${entityCount} 个数据实体、${operationCount} 个操作、${patternCount} 套交互范式。`;
  }, [runtime]);

  async function handleSend(message?: string) {
    if (hasPendingForm) {
      toast.info("请先填写信息补充表单");
      return;
    }
    if (isLoading) return;

    const content = (message ?? input).trim();
    if (!content) return;

    const nextMessages: ConversationMessage[] = [
      ...messages,
      { role: "user", content },
    ];
    setInput("");

    if (!hasIntakeValues) {
      const assistantFollowUp: ConversationMessage = {
        role: "assistant",
        content:
          "收到你的需求。为了更精准地生成界面，请补充下方表单中的业务模型、核心实体、关键操作以及样本数据等信息。",
      };
      setMessages([...nextMessages, assistantFollowUp]);
      setPendingForm("intake");
      return;
    }

    setMessages(nextMessages);
    await sendConversation(nextMessages);
  }

  async function handleIntakeSubmit(values: PlannerIntakeValues) {
    if (isLoading) return;
    const normalized = normalizeIntakeValues(values);
    const summaryMessage = buildIntakeSummary(normalized, Boolean(intakeValues));
    const nextMessages: ConversationMessage[] = [
      ...messages,
      {
        role: "user",
        content: summaryMessage,
      },
    ];

    setIntakeValues(normalized);
    setPendingForm(null);
    setMessages(nextMessages);

    await sendConversation(nextMessages);
  }

  async function sendConversation(conversation: ConversationMessage[]) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: conversation }),
      });
      if (!response.ok) {
        throw new Error(`请求失败：${response.status}`);
      }
      const payload: BusinessAppRuntimePayload = await response.json();
      setRuntime(payload);
      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content:
          payload.schema.description ??
          `已生成 ${payload.schema.name}，可以继续补充更多需求进行优化。`,
      };
      setMessages([...conversation, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast.error("生成界面设计失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditIntake() {
    if (hasPendingForm || isLoading || !intakeValues) return;
    const assistantMessage: ConversationMessage = {
      role: "assistant",
      content: "当然，请更新下方表单中的信息，我们会重新规划界面。",
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setPendingForm("intake");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>业务需求对话</CardTitle>
            <CardDescription>描述你的业务场景，AI 将生成对应的数据模型与交互界面。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className="rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={message.role === "user" ? "default" : "secondary"}>
                      {message.role === "user" ? "业务方" : "AI"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {message.role === "user" ? "输入" : "回复"}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground/90">{message.content}</p>
                </div>
              ))}
              {pendingForm === "intake" ? (
                <div className="rounded-lg border-2 border-primary/30 bg-background p-4 shadow-sm">
                  <div className="mb-3 space-y-1">
                    <p className="text-sm font-medium text-primary">补充业务信息</p>
                    <p className="text-xs text-muted-foreground">AI 将结合这些结构化信息生成更贴合的界面。</p>
                  </div>
                  <RequirementIntakeForm
                    defaultValues={intakeValues ?? undefined}
                    onSubmit={handleIntakeSubmit}
                  />
                </div>
              ) : null}
            </div>
            <Separator />
            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="例如：我们是一家SaaS企业，需要统一管理客户成功流程..."
                className="min-h-[120px]"
                disabled={isLoading || hasPendingForm}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => handleSend()} disabled={isLoading || hasPendingForm}>
                  {isLoading
                    ? "AI 正在规划..."
                    : hasPendingForm
                      ? "等待表单补充"
                      : "发送需求"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInput("")}
                  disabled={isLoading || hasPendingForm || input.length === 0}
                >
                  清空
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {intakeValues ? (
          <Card>
            <CardHeader>
              <CardTitle>业务需求摘要</CardTitle>
              <CardDescription>这些信息会随对话提交，帮助 AI 理解业务上下文。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {plannerIntakeFields.map((field) => {
                  const fieldValue = intakeValues[field.id];
                  if (!fieldValue) return null;
                  return (
                    <div key={field.id} className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {field.label}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                        {fieldValue}
                      </p>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={handleEditIntake}
                disabled={hasPendingForm || isLoading}
              >
                {hasPendingForm ? "表单填写中" : "调整补充信息"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>快速示例</CardTitle>
            <CardDescription>点击下方示例快速体验端到端生成流程。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                className="h-auto justify-start whitespace-normal text-left"
                onClick={() => handleSend(suggestion)}
                disabled={isLoading || hasPendingForm}
              >
                {suggestion}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>组件知识库</CardTitle>
            <CardDescription>AI 会基于这些组件组合交互范式。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {componentCatalog.map((component) => (
              <div key={component.id} className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{component.name}</h4>
                  <Badge variant="outline">{component.id}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{component.description}</p>
                <p className="mt-2 text-xs">
                  <span className="font-medium text-muted-foreground">适用：</span>
                  {component.bestFor.join("、")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>
              {runtime
                ? latestSummary
                : "提交业务需求后，这里会自动生成数据模型与交互界面。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {runtime ? (
              <DynamicUIRenderer runtime={runtime} />
            ) : (
              <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
                暂无结果，请先描述业务场景。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function normalizeIntakeValues(values: PlannerIntakeValues): PlannerIntakeValues {
  const interactionPreference = values.interactionPreference?.trim();
  return {
    appName: values.appName.trim(),
    businessModel: values.businessModel.trim(),
    keyEntities: values.keyEntities.trim(),
    primaryActions: values.primaryActions.trim(),
    dataExamples: values.dataExamples.trim(),
    interactionPreference: interactionPreference && interactionPreference.length > 0 ? interactionPreference : undefined,
  };
}

function buildIntakeSummary(values: PlannerIntakeValues, isUpdate: boolean) {
  const header = isUpdate
    ? "以下是我更新后的业务结构化补充信息："
    : "以下是我补充的业务结构化信息：";
  const lines = plannerIntakeFields
    .map((field) => {
      const fieldValue = values[field.id];
      if (!fieldValue) return null;
      return `- ${field.label}：${fieldValue}`;
    })
    .filter((line): line is string => Boolean(line));
  return [header, ...lines].join("\n");
}
