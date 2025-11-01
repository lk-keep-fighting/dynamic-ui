"use client";

import { useMemo } from "react";
import {
  buildUI,
  collectEntityData,
  UIBlock,
  UIAction,
} from "@/lib/ui-blocks";
import { BusinessAppRuntimePayload, BusinessEntitySchema, BusinessOperationSchema } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OperationExecutor, OperationFormTrigger } from "@/components/dynamic/operation-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type DynamicUIRendererProps = {
  runtime: BusinessAppRuntimePayload;
  blocks?: UIBlock[];
  onExecuteOperation?: OperationExecutor;
};

export function DynamicUIRenderer({ runtime, blocks: providedBlocks, onExecuteOperation }: DynamicUIRendererProps) {
  const blocks = useMemo(() => providedBlocks ?? buildUI(runtime), [providedBlocks, runtime]);
  const operationsById = useMemo(() => {
    return new Map(runtime.schema.operations.map((operation) => [operation.id, operation]));
  }, [runtime.schema.operations]);
  const entitiesById = useMemo(() => {
    return new Map(runtime.schema.entities.map((entity) => [entity.id, entity]));
  }, [runtime.schema.entities]);
  const datasets = useMemo(() => collectEntityData(runtime), [runtime]);

  return (
    <div className="space-y-10">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "header":
            return (
              <HeaderBlock
                key={`header-${index}`}
                title={block.title}
                description={block.description}
                actions={block.actions}
                schemaRuntime={runtime}
                operationsById={operationsById}
                onExecuteOperation={onExecuteOperation}
              />
            );
          case "stat-grid":
            return <StatGridBlock key={`stats-${index}`} metrics={block.metrics} />;
          case "table": {
            const entity = entitiesById.get(block.entity);
            return (
              <TableBlock
                key={`table-${block.entity}-${index}`}
                block={block}
                entity={entity}
                dataset={datasets[block.entity] ?? []}
                operationsById={operationsById}
                runtime={runtime}
                onExecuteOperation={onExecuteOperation}
              />
            );
          }
          case "detail": {
            const entity = entitiesById.get(block.entity);
            return (
              <DetailBlock key={`detail-${index}`} block={block} entity={entity} />
            );
          }
          case "form": {
            const operation = operationsById.get(block.operationId);
            if (!operation) return null;
            return (
              <OperationFormTrigger
                key={`form-${block.operationId}-${index}`}
                operation={operation}
                schema={runtime.schema}
                onExecute={onExecuteOperation}
                triggerLabel={block.triggerLabel}
                variant={block.variant}
              />
            );
          }
          case "tabs":
            return (
              <TabsBlock
                key={`tabs-${index}`}
                block={block}
                runtime={runtime}
                operationsById={operationsById}
                datasets={datasets}
                onExecuteOperation={onExecuteOperation}
              />
            );
          case "timeline":
            return <TimelineBlock key={`timeline-${index}`} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function HeaderBlock({
  title,
  description,
  actions,
  schemaRuntime,
  operationsById,
  onExecuteOperation,
}: {
  title: string;
  description?: string;
  actions?: UIAction[];
  schemaRuntime: BusinessAppRuntimePayload;
  operationsById: Map<string, BusinessOperationSchema>;
  onExecuteOperation?: OperationExecutor;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground max-w-2xl">{description}</p> : null}
      </div>
      {actions && actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => {
            const operation = operationsById.get(action.operationId);
            if (!operation) return null;
            return (
              <OperationFormTrigger
                key={action.id}
                operation={operation}
                schema={schemaRuntime.schema}
                triggerLabel={action.label}
                triggerVariant={action.variant ?? "default"}
                onExecute={onExecuteOperation}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function StatGridBlock({
  metrics,
}: {
  metrics: {
    id: string;
    label: string;
    value: string;
    change?: string;
    intent?: "positive" | "negative" | "neutral";
  }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">{metric.value}</CardTitle>
          </CardHeader>
          {metric.change ? (
            <CardContent>
              <p className={cn("text-sm", changeToClass(metric.intent ?? "neutral"))}>{metric.change}</p>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

function changeToClass(intent: "positive" | "negative" | "neutral") {
  switch (intent) {
    case "positive":
      return "text-emerald-500";
    case "negative":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

function TableBlock({
  block,
  entity,
  dataset,
  operationsById,
  runtime,
  onExecuteOperation,
}: {
  block: Extract<UIBlock, { kind: "table" }>;
  entity?: BusinessEntitySchema;
  dataset: Record<string, unknown>[];
  operationsById: Map<string, BusinessOperationSchema>;
  runtime: BusinessAppRuntimePayload;
  onExecuteOperation?: OperationExecutor;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{block.title ?? entity?.label ?? "数据列表"}</CardTitle>
          {entity?.description ? <CardDescription>{entity.description}</CardDescription> : null}
        </div>
        {block.actions && block.actions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {block.actions.map((action) => {
              const operation = operationsById.get(action.operationId);
              if (!operation) return null;
              return (
                <OperationFormTrigger
                  key={action.id}
                  operation={operation}
                  schema={runtime.schema}
                  triggerLabel={action.label}
                  triggerVariant={action.variant ?? "outline"}
                  onExecute={onExecuteOperation}
                />
              );
            })}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {block.columns.map((column) => (
                  <TableHead key={column.field}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataset.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={block.columns.length} className="h-24 text-center text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                dataset.map((row, index) => (
                  <TableRow key={String(row.id ?? index)}>
                    {block.columns.map((column) => (
                      <TableCell key={column.field} className="max-w-xs whitespace-nowrap text-sm">
                        {renderTableCell(row[column.field], column, entity)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function renderTableCell(value: unknown, column: { type: string; enumValues?: { value: string; label: string }[] }, entity?: BusinessEntitySchema) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">-</span>;
  }
  if (column.enumValues && column.enumValues.length > 0) {
    const match = column.enumValues.find((option) => option.value === value || option.label === value);
    return <Badge variant="secondary">{match?.label ?? String(value)}</Badge>;
  }
  switch (column.type) {
    case "boolean":
      return <Badge variant={value ? "default" : "outline"}>{value ? "是" : "否"}</Badge>;
    case "currency":
      return `¥${Number(value).toLocaleString()}`;
    case "number":
    case "integer":
      return Number(value).toLocaleString();
    case "percentage":
      return `${Number(value).toFixed(1)}%`;
    case "date":
      return formatSafe(value, "yyyy-MM-dd");
    case "datetime":
      return formatSafe(value, "yyyy-MM-dd HH:mm");
    default:
      return String(value);
  }
}

function formatSafe(value: unknown, pattern: string) {
  try {
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return format(date, pattern);
  } catch (error) {
    return String(value);
  }
}

function DetailBlock({
  block,
  entity,
}: {
  block: Extract<UIBlock, { kind: "detail" }>;
  entity?: BusinessEntitySchema;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title ?? `${entity?.label ?? "实体"}详情`}</CardTitle>
        {entity?.description ? <CardDescription>{entity.description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {block.fields.map((fieldName) => {
            const meta = entity?.fields.find((field) => field.name === fieldName);
            const value = block.record[fieldName];
            return (
              <div key={fieldName} className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {meta?.label ?? fieldName}
                </p>
                <p className="text-sm font-semibold">
                  {renderDetailValue(value, meta)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function renderDetailValue(value: unknown, field?: BusinessEntitySchema["fields"][number]) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">-</span>;
  }
  if (field?.enumValues?.length) {
    const match = field.enumValues.find((option) => option.value === value || option.label === value);
    return <Badge variant="secondary">{match?.label ?? String(value)}</Badge>;
  }
  switch (field?.type) {
    case "currency":
      return `¥${Number(value).toLocaleString()}`;
    case "percentage":
      return `${Number(value).toFixed(1)}%`;
    case "boolean":
      return value ? "是" : "否";
    case "date":
      return formatSafe(value, "yyyy-MM-dd");
    case "datetime":
      return formatSafe(value, "yyyy-MM-dd HH:mm");
    default:
      return String(value);
  }
}

function TabsBlock({
  block,
  runtime,
  operationsById,
  datasets,
  onExecuteOperation,
}: {
  block: Extract<UIBlock, { kind: "tabs" }>;
  runtime: BusinessAppRuntimePayload;
  operationsById: Map<string, BusinessOperationSchema>;
  datasets: Record<string, Record<string, unknown>[]>;
  onExecuteOperation?: OperationExecutor;
}) {
  return (
    <Tabs defaultValue={block.tabs[0]?.id} className="space-y-6">
      <TabsList>
        {block.tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {block.tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="space-y-6">
          <DynamicUIRenderer
            runtime={{
              schema: runtime.schema,
              datasets: Object.entries(datasets).map(([entity, records]) => ({
                entity,
                records,
              })),
            }}
            blocks={tab.blocks}
            onExecuteOperation={onExecuteOperation}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function TimelineBlock({
  block,
}: {
  block: Extract<UIBlock, { kind: "timeline" }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{block.title ?? "业务事件"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {block.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无事件记录</p>
        ) : (
          block.items.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.label}</p>
                {item.timestamp ? (
                  <span className="text-xs text-muted-foreground">{formatSafe(item.timestamp, "yyyy-MM-dd HH:mm")}</span>
                ) : null}
              </div>
              {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.actor ? <span>操作者：{item.actor}</span> : null}
                {item.status ? <Badge variant="outline">{item.status}</Badge> : null}
              </div>
              {index !== block.items.length - 1 ? <Separator className="!my-3" /> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
