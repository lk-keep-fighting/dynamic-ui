import { z } from "zod";
import { BusinessAppRuntimePayload } from "@/lib/schema";
import {
  hrPerformanceRuntime,
  inventoryConsoleRuntime,
  salesConsoleRuntime,
} from "@/data/samples";
import { componentCatalog } from "@/lib/component-catalog";

export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export interface AiInterpreter {
  interpret(messages: ConversationMessage[]): Promise<BusinessAppRuntimePayload>;
}

const businessAppZod = z.object({
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    entities: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        label: z.string(),
        description: z.string().optional(),
        fields: z.array(
          z.object({
            name: z.string(),
            label: z.string(),
            type: z.enum([
              "string",
              "text",
              "number",
              "integer",
              "boolean",
              "date",
              "datetime",
              "enum",
              "status",
              "currency",
              "percentage",
              "rating",
            ]),
            description: z.string().optional(),
            required: z.boolean().optional(),
            isPrimary: z.boolean().optional(),
            isIdentifier: z.boolean().optional(),
            isSearchable: z.boolean().optional(),
            isMetric: z.boolean().optional(),
            format: z.string().optional(),
            unit: z.string().optional(),
            enumValues: z
              .array(z.object({ label: z.string(), value: z.string() }))
              .optional(),
            componentHint: z.string().optional(),
          }),
        ),
        sampleData: z.array(z.record(z.unknown())).optional(),
      }),
    ),
    operations: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        label: z.string(),
        targetEntity: z.string(),
        description: z.string().optional(),
        kind: z.enum(["create", "update", "delete", "action"]),
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
        endpoint: z.string(),
        parameters: z
          .array(
            z.object({
              name: z.string(),
              label: z.string(),
              type: z.enum([
                "string",
                "text",
                "number",
                "integer",
                "boolean",
                "date",
                "datetime",
                "enum",
                "status",
                "currency",
                "percentage",
                "rating",
              ]),
              description: z.string().optional(),
              required: z.boolean().optional(),
              enumValues: z
                .array(z.object({ label: z.string(), value: z.string() }))
                .optional(),
              defaultValue: z.unknown().optional(),
            }),
          )
          .optional(),
        ui: z
          .object({
            variant: z.enum(["dialog", "sheet", "inline", "drawer"]).optional(),
            intent: z.enum(["primary", "secondary", "destructive"]).optional(),
            triggerLabel: z.string().optional(),
            successMessage: z.string().optional(),
          })
          .optional(),
      }),
    ),
    patterns: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        type: z.enum([
          "collection-hub",
          "detail-dashboard",
          "workflow-console",
          "analytics-summary",
        ]),
        entity: z.string(),
        operations: z.array(z.string()).optional(),
        features: z
          .object({
            quickFilters: z.boolean().optional(),
            quickStats: z.boolean().optional(),
            bulkActions: z.boolean().optional(),
            timeline: z.boolean().optional(),
            highlights: z.boolean().optional(),
          })
          .optional(),
      }),
    ),
  }),
  datasets: z
    .array(
      z.object({
        entity: z.string(),
        records: z.array(z.record(z.unknown())),
      }),
    )
    .optional(),
});

const BUSINESS_APP_JSON_SCHEMA = {
  name: "BusinessAppRuntime",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["schema"],
    properties: {
      schema: {
        type: "object",
        required: ["id", "name", "entities", "operations", "patterns"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          entities: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "name", "label", "fields"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                label: { type: "string" },
                description: { type: "string" },
                fields: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["name", "label", "type"],
                    properties: {
                      name: { type: "string" },
                      label: { type: "string" },
                      type: {
                        type: "string",
                        enum: [
                          "string",
                          "text",
                          "number",
                          "integer",
                          "boolean",
                          "date",
                          "datetime",
                          "enum",
                          "status",
                          "currency",
                          "percentage",
                          "rating",
                        ],
                      },
                      description: { type: "string" },
                      required: { type: "boolean" },
                      isPrimary: { type: "boolean" },
                      isIdentifier: { type: "boolean" },
                      isSearchable: { type: "boolean" },
                      isMetric: { type: "boolean" },
                      format: { type: "string" },
                      unit: { type: "string" },
                      enumValues: {
                        type: "array",
                        items: {
                          type: "object",
                          required: ["label", "value"],
                          properties: {
                            label: { type: "string" },
                            value: { type: "string" },
                          },
                        },
                      },
                      componentHint: { type: "string" },
                    },
                  },
                },
                sampleData: {
                  type: "array",
                  items: { type: "object" },
                },
              },
            },
          },
          operations: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "name", "label", "targetEntity", "kind", "method", "endpoint"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                label: { type: "string" },
                targetEntity: { type: "string" },
                description: { type: "string" },
                kind: {
                  type: "string",
                  enum: ["create", "update", "delete", "action"],
                },
                method: {
                  type: "string",
                  enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                },
                endpoint: { type: "string" },
                parameters: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["name", "label", "type"],
                    properties: {
                      name: { type: "string" },
                      label: { type: "string" },
                      type: {
                        type: "string",
                        enum: [
                          "string",
                          "text",
                          "number",
                          "integer",
                          "boolean",
                          "date",
                          "datetime",
                          "enum",
                          "status",
                          "currency",
                          "percentage",
                          "rating",
                        ],
                      },
                      description: { type: "string" },
                      required: { type: "boolean" },
                      enumValues: {
                        type: "array",
                        items: {
                          type: "object",
                          required: ["label", "value"],
                          properties: {
                            label: { type: "string" },
                            value: { type: "string" },
                          },
                        },
                      },
                      defaultValue: {},
                    },
                  },
                },
                ui: {
                  type: "object",
                  properties: {
                    variant: { type: "string", enum: ["dialog", "sheet", "inline", "drawer"] },
                    intent: { type: "string", enum: ["primary", "secondary", "destructive"] },
                    triggerLabel: { type: "string" },
                    successMessage: { type: "string" },
                  },
                },
              },
            },
          },
          patterns: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "name", "type", "entity"],
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                type: {
                  type: "string",
                  enum: [
                    "collection-hub",
                    "detail-dashboard",
                    "workflow-console",
                    "analytics-summary",
                  ],
                },
                entity: { type: "string" },
                operations: {
                  type: "array",
                  items: { type: "string" },
                },
                features: {
                  type: "object",
                  properties: {
                    quickFilters: { type: "boolean" },
                    quickStats: { type: "boolean" },
                    bulkActions: { type: "boolean" },
                    timeline: { type: "boolean" },
                    highlights: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
      datasets: {
        type: "array",
        items: {
          type: "object",
          required: ["entity", "records"],
          properties: {
            entity: { type: "string" },
            records: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
      },
    },
  },
};

const MOCK_SCENARIOS: {
  keywords: string[];
  runtime: BusinessAppRuntimePayload;
}[] = [
  {
    keywords: ["销售", "订单", "crm", "客户", "deal", "pipeline"],
    runtime: salesConsoleRuntime,
  },
  {
    keywords: ["库存", "warehouse", "仓库", "物料", "供应链", "stock"],
    runtime: inventoryConsoleRuntime,
  },
  {
    keywords: ["人力", "绩效", "员工", "hr", "okr"],
    runtime: hrPerformanceRuntime,
  },
];

export class MockAiInterpreter implements AiInterpreter {
  async interpret(messages: ConversationMessage[]): Promise<BusinessAppRuntimePayload> {
    const text = messages.map((message) => message.content.toLowerCase()).join(" \n ");
    const matched = MOCK_SCENARIOS.find((scenario) =>
      scenario.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
    );
    const runtime = matched?.runtime ?? salesConsoleRuntime;

    return {
      schema: {
        ...runtime.schema,
        description:
          runtime.schema.description ??
          "由AI根据对话生成的业务工作台，可根据数据动态渲染界面。",
      },
      datasets: runtime.datasets,
    };
  }
}

export class OpenAiInterpreter implements AiInterpreter {
  constructor(private apiKey: string, private model = process.env.OPENAI_MODEL ?? "gpt-4o-mini") {}

  async interpret(messages: ConversationMessage[]): Promise<BusinessAppRuntimePayload> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: this.buildPrompt(messages),
        response_format: {
          type: "json_schema",
          json_schema: BUSINESS_APP_JSON_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const textOutput = json?.output?.[0]?.content?.[0]?.text ?? json?.output_text ?? json?.choices?.[0]?.message?.content;
    if (!textOutput || typeof textOutput !== "string") {
      throw new Error("OpenAI 返回内容为空");
    }
    const parsed = JSON.parse(textOutput);
    return businessAppZod.parse(parsed);
  }

  private buildPrompt(messages: ConversationMessage[]) {
    const catalogSummary = componentCatalog
      .map((component) => `${component.name}: ${component.description}。适用场景：${component.bestFor.join("、")}`)
      .join("\n");

    const systemMessage = `你是一名企业中台体验设计师，根据用户的业务描述生成数据模型(schema)、业务操作(schema)以及交互模式(pattern)。\n请参考以下预制组件，并在输出中选择最适合的组件组合：\n${catalogSummary}\n输出需要严格符合 BusinessAppRuntime JSON Schema。`;

    const inputMessages = [
      {
        role: "system",
        content: [{ type: "text", text: systemMessage }],
      },
      ...messages.map((message) => ({
        role: message.role,
        content: [{ type: "text", text: message.content }],
      })),
    ];

    return inputMessages;
  }
}

export async function interpretConversation(messages: ConversationMessage[]): Promise<BusinessAppRuntimePayload> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const interpreter = new OpenAiInterpreter(apiKey);
      return await interpreter.interpret(messages);
    } catch (error) {
      console.error("OpenAI interpreter failed, fallback to mock.", error);
    }
  }
  const interpreter = new MockAiInterpreter();
  return interpreter.interpret(messages);
}
