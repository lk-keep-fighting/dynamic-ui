import { BusinessAppRuntimePayload, BusinessEntitySchema, BusinessFieldSchema, BusinessOperationSchema, BusinessAppSchema, InteractionPattern } from "@/lib/schema";

export type TableColumnMeta = {
  field: string;
  label: string;
  type: BusinessFieldSchema["type"];
  format?: string;
  enumValues?: { label: string; value: string }[];
  componentHint?: BusinessFieldSchema["componentHint"];
};

export type UIAction = {
  id: string;
  label: string;
  operationId: string;
  variant?: "default" | "outline" | "destructive";
  icon?: string;
};

export type TimelineItem = {
  id: string;
  label: string;
  description?: string;
  timestamp?: string;
  actor?: string;
  status?: string;
};

export type UIBlock =
  | {
      kind: "header";
      title: string;
      description?: string;
      actions?: UIAction[];
    }
  | {
      kind: "stat-grid";
      metrics: {
        id: string;
        label: string;
        value: string;
        change?: string;
        intent?: "positive" | "negative" | "neutral";
      }[];
    }
  | {
      kind: "table";
      entity: string;
      title?: string;
      columns: TableColumnMeta[];
      data: Record<string, unknown>[];
      actions?: UIAction[];
      filters?: string[];
    }
  | {
      kind: "detail";
      entity: string;
      title?: string;
      record: Record<string, unknown>;
      fields: string[];
    }
  | {
      kind: "form";
      operationId: string;
      variant: "dialog" | "sheet" | "inline" | "drawer";
      triggerLabel?: string;
      description?: string;
    }
  | {
      kind: "tabs";
      tabs: {
        id: string;
        label: string;
        blocks: UIBlock[];
      }[];
    }
  | {
      kind: "timeline";
      title?: string;
      items: TimelineItem[];
    };

export type UIFactoryContext = {
  schema: BusinessAppSchema;
  datasets?: Record<string, Record<string, unknown>[]>;
};

export function getEntity(schema: BusinessAppSchema, entityId: string): BusinessEntitySchema | undefined {
  return schema.entities.find((entity) => entity.id === entityId);
}

export function getOperation(schema: BusinessAppSchema, operationId: string): BusinessOperationSchema | undefined {
  return schema.operations.find((operation) => operation.id === operationId);
}

export function collectEntityData(runtime: BusinessAppRuntimePayload): Record<string, Record<string, unknown>[]> {
  const datasetMap: Record<string, Record<string, unknown>[]> = {};
  runtime.schema.entities.forEach((entity) => {
    datasetMap[entity.id] = entity.sampleData ?? [];
  });
  runtime.datasets?.forEach((dataset) => {
    datasetMap[dataset.entity] = dataset.records;
  });
  return datasetMap;
}

export function deriveDefaultColumns(entity: BusinessEntitySchema): TableColumnMeta[] {
  return entity.fields
    .filter((field) => !field.componentHint?.includes("hidden") && !field.description?.includes("@hidden"))
    .map((field) => ({
      field: field.name,
      label: field.label,
      type: field.type,
      format: field.format,
      enumValues: field.enumValues,
      componentHint: field.componentHint,
    }));
}

export function createUIBlocksFromPattern(
  runtime: BusinessAppRuntimePayload,
  pattern: InteractionPattern,
): UIBlock[] {
  const entity = getEntity(runtime.schema, pattern.entity);
  if (!entity) return [];
  const datasets = collectEntityData(runtime);
  const data = datasets[entity.id] ?? [];

  const operations = pattern.operations
    ?.map((operationId) => getOperation(runtime.schema, operationId))
    .filter((op): op is BusinessOperationSchema => Boolean(op));

  switch (pattern.type) {
    case "collection-hub": {
      const blocks: UIBlock[] = [];
      blocks.push({
        kind: "header",
        title: entity.label,
        description: pattern.description ?? entity.description,
        actions: operations?.map((op) => ({
          id: op.id,
          label: op.ui?.triggerLabel ?? op.label,
          operationId: op.id,
          variant: op.kind === "delete" ? "destructive" : "default",
        })),
      });

      if (pattern.features?.quickStats) {
        const metrics = entity.fields
          .filter((field) => field.isMetric)
          .slice(0, 4)
          .map((field) => ({
            id: field.name,
            label: field.label,
            value: summariseMetric(data, field.name, field.type),
            intent: "neutral" as const,
          }));
        if (metrics.length) {
          blocks.push({ kind: "stat-grid", metrics });
        }
      }

      blocks.push({
        kind: "table",
        entity: entity.id,
        columns: deriveDefaultColumns(entity),
        data,
        actions: operations
          ?.filter((op) => op.kind !== "create")
          .map((op) => ({
            id: op.id,
            label: op.ui?.triggerLabel ?? op.label,
            operationId: op.id,
            variant: op.kind === "delete" ? "destructive" : "outline",
          })),
      });

      const inlineCreate = operations?.find((op) => op.kind === "create" && op.ui?.variant === "inline");
      if (inlineCreate) {
        blocks.push({
          kind: "form",
          operationId: inlineCreate.id,
          variant: inlineCreate.ui?.variant ?? "inline",
          triggerLabel: inlineCreate.ui?.triggerLabel ?? `新建${entity.label}`,
          description: inlineCreate.description,
        });
      }

      return blocks;
    }
    case "detail-dashboard": {
      const record = data[0] ?? {};
      return [
        {
          kind: "header",
          title: pattern.name ?? entity.label,
          description: pattern.description ?? entity.description,
        },
        {
          kind: "tabs",
          tabs: [
            {
              id: "overview",
              label: "概览",
              blocks: [
                {
                  kind: "detail",
                  entity: entity.id,
                  record,
                  fields: entity.fields.map((field) => field.name),
                },
              ],
            },
            {
              id: "activity",
              label: "动态",
              blocks: [
                {
                  kind: "timeline",
                  title: `${entity.label}事件`,
                  items: deriveTimeline(record),
                },
              ],
            },
          ],
        },
      ];
    }
    case "workflow-console": {
      const blocks: UIBlock[] = [];
      blocks.push({
        kind: "header",
        title: pattern.name ?? `${entity.label}流程中心`,
        description: pattern.description,
        actions: operations?.map((op) => ({
          id: op.id,
          label: op.ui?.triggerLabel ?? op.label,
          operationId: op.id,
          variant: op.kind === "delete" ? "destructive" : "default",
        })),
      });
      blocks.push({
        kind: "tabs",
        tabs: [
          {
            id: "pipeline",
            label: "流程进度",
            blocks: [
              {
                kind: "table",
                entity: entity.id,
                columns: deriveDefaultColumns(entity),
                data,
              },
            ],
          },
          {
            id: "actions",
            label: "操作",
            blocks: operations
              ?.filter((operation) => operation.kind !== "create")
              .map((operation) => ({
                kind: "form" as const,
                operationId: operation.id,
                variant: operation.ui?.variant ?? "drawer",
                triggerLabel: operation.ui?.triggerLabel ?? operation.label,
                description: operation.description,
              })) ?? [],
          },
        ].filter((tab) => tab.blocks.length > 0),
      });
      return blocks;
    }
    case "analytics-summary": {
      const blocks: UIBlock[] = [
        {
          kind: "header",
          title: pattern.name ?? `${entity.label}分析`,
          description: pattern.description,
        },
      ];
      const metricFields = entity.fields.filter((field) => field.isMetric);
      if (metricFields.length) {
        blocks.push({
          kind: "stat-grid",
          metrics: metricFields.map((field) => ({
            id: field.name,
            label: field.label,
            value: summariseMetric(data, field.name, field.type),
            change: deriveChangeText(data, field.name, field.type),
            intent: "neutral",
          })),
        });
      }
      blocks.push({
        kind: "table",
        entity: entity.id,
        title: `${entity.label}数据`,
        columns: deriveDefaultColumns(entity),
        data,
      });
      return blocks;
    }
    default:
      return [];
  }
}

function summariseMetric(data: Record<string, unknown>[], fieldName: string, type: BusinessFieldSchema["type"]): string {
  if (!data.length) return "-";
  if (type === "number" || type === "integer" || type === "currency" || type === "percentage") {
    const sum = data.reduce((acc, record) => {
      const val = Number(record[fieldName] ?? 0);
      if (Number.isFinite(val)) return acc + val;
      return acc;
    }, 0);
    if (type === "currency") {
      return `¥${sum.toLocaleString()}`;
    }
    if (type === "percentage") {
      return `${(sum / data.length).toFixed(1)}%`;
    }
    return sum.toLocaleString();
  }
  return String(data[0]?.[fieldName] ?? "-");
}

function deriveChangeText(data: Record<string, unknown>[], fieldName: string, type: BusinessFieldSchema["type"]): string | undefined {
  if (data.length < 2) return undefined;
  const latest = Number(data[0]?.[fieldName]);
  const previous = Number(data[1]?.[fieldName]);
  if (!Number.isFinite(latest) || !Number.isFinite(previous) || previous === 0) {
    return undefined;
  }
  const diff = ((latest - previous) / Math.abs(previous)) * 100;
  const formatted = `${diff >= 0 ? "↑" : "↓"}${Math.abs(diff).toFixed(1)}%`;
  return formatted;
}

function deriveTimeline(record: Record<string, unknown>): TimelineItem[] {
  const timeline = record?.timeline as TimelineItem[] | undefined;
  return timeline ?? [];
}

export function buildUI(runtime: BusinessAppRuntimePayload): UIBlock[] {
  const blocks: UIBlock[] = [];
  runtime.schema.patterns.forEach((pattern) => {
    blocks.push(...createUIBlocksFromPattern(runtime, pattern));
  });
  return blocks;
}
