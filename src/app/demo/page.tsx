"use client";

import { useState } from "react";
import { DynamicUIRenderer } from "@/components/dynamic/dynamic-ui-renderer";
import {
  hrPerformanceRuntime,
  inventoryConsoleRuntime,
  salesConsoleRuntime,
} from "@/data/samples";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const scenarios = [
  {
    id: "sales",
    label: "销售订单工作台",
    description: "包含订单列表、指标看板与操作表单的综合场景。",
    runtime: salesConsoleRuntime,
  },
  {
    id: "inventory",
    label: "仓储库存监控",
    description: "针对库存安全与补货流程的中台界面。",
    runtime: inventoryConsoleRuntime,
  },
  {
    id: "hr",
    label: "员工绩效管理",
    description: "帮助HR追踪绩效、制定改进计划的工作台。",
    runtime: hrPerformanceRuntime,
  },
];

export default function DemoPage() {
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0]?.id ?? "sales");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>动态界面生成 Demo</CardTitle>
          <CardDescription>
            选择不同业务场景，查看如何基于 Schema 与真实数据自动拼装界面组件。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={scenarioId} onValueChange={setScenarioId} className="space-y-6">
            <TabsList className="flex-wrap justify-start">
              {scenarios.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {scenarios.map((item) => (
              <TabsContent key={item.id} value={item.id} className="space-y-6">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>{item.runtime.schema.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DynamicUIRenderer runtime={item.runtime} key={item.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
