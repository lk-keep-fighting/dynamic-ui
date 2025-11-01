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

  const latestSummary = useMemo(() => {
    if (!runtime) return "";
    const entityCount = runtime.schema.entities.length;
    const operationCount = runtime.schema.operations.length;
    const patternCount = runtime.schema.patterns.length;
    return `已生成 ${runtime.schema.name}：包含 ${entityCount} 个数据实体、${operationCount} 个操作、${patternCount} 套交互范式。`;
  }, [runtime]);

  async function handleSend(message?: string) {
    const content = (message ?? input).trim();
    if (!content) return;

    const nextMessages: ConversationMessage[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: nextMessages }),
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
      setMessages([...nextMessages, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast.error("生成界面设计失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
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
            </div>
            <Separator />
            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="例如：我们是一家SaaS企业，需要统一管理客户成功流程..."
                className="min-h-[120px]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => handleSend()} disabled={isLoading}>
                  {isLoading ? "AI 正在规划..." : "发送需求"}
                </Button>
                <Button variant="outline" onClick={() => setInput("")} disabled={isLoading || input.length === 0}>
                  清空
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
                disabled={isLoading}
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
