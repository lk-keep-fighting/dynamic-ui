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

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_ENDPOINT = "responses";

type OpenAiInterpreterOptions = {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  apiKeyHeader?: string;
  organization?: string;
  project?: string;
  extraHeaders?: Record<string, string>;
};

export class OpenAiInterpreter implements AiInterpreter {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly endpoint: string;
  private readonly apiKeyHeader: string;
  private readonly organization?: string;
  private readonly project?: string;
  private readonly extraHeaders: Record<string, string>;

  constructor(options: OpenAiInterpreterOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const baseUrl = (options.baseUrl ?? process.env.OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL).trim();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    const endpoint = (options.endpoint ?? process.env.OPENAI_COMPAT_ENDPOINT ?? DEFAULT_OPENAI_ENDPOINT).trim();
    this.endpoint = endpoint.replace(/^\//, "");
    this.apiKeyHeader = (options.apiKeyHeader ?? process.env.OPENAI_API_KEY_HEADER ?? "Authorization").trim();
    this.organization = options.organization ?? process.env.OPENAI_ORG ?? process.env.OPENAI_ORGANIZATION;
    this.project = options.project ?? process.env.OPENAI_PROJECT;
    this.extraHeaders = options.extraHeaders ?? {};
  }

  async interpret(messages: ConversationMessage[]): Promise<BusinessAppRuntimePayload> {
    const isChatCompletions = this.endpoint.includes("chat/completions");
    const url = `${this.baseUrl}/${this.endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.extraHeaders,
    };

    if (this.apiKeyHeader.toLowerCase() === "authorization") {
      headers.Authorization = `Bearer ${this.apiKey}`;
    } else {
      headers[this.apiKeyHeader] = this.apiKey;
    }

    if (this.organization) {
      headers["OpenAI-Organization"] = this.organization;
    }

    if (this.project) {
      headers["OpenAI-Project"] = this.project;
    }

    const payload = isChatCompletions
      ? this.buildChatCompletionsPayload(messages)
      : this.buildResponsesPayload(messages);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const textOutput = this.extractJsonText(json);
    if (!textOutput) {
      throw new Error("OpenAI 返回内容为空");
    }

    const parsed = JSON.parse(textOutput);
    return businessAppZod.parse(parsed);
  }

  private buildResponsesPayload(messages: ConversationMessage[]) {
    return {
      model: this.model,
      input: this.buildResponsesInput(messages),
      response_format: {
        type: "json_schema",
        json_schema: BUSINESS_APP_JSON_SCHEMA,
      },
    };
  }

  private buildChatCompletionsPayload(messages: ConversationMessage[]) {
    return {
      model: this.model,
      messages: this.buildChatMessages(messages),
      response_format: {
        type: "json_schema",
        json_schema: BUSINESS_APP_JSON_SCHEMA,
      },
    };
  }

  private buildResponsesInput(messages: ConversationMessage[]) {
    const catalogSummary = this.buildCatalogSummary();
    const systemMessage = this.buildSystemInstruction(catalogSummary);

    return [
      {
        role: "system",
        content: [{ type: "text", text: systemMessage }],
      },
      ...messages.map((message) => ({
        role: message.role,
        content: [{ type: "text", text: message.content }],
      })),
    ];
  }

  private buildChatMessages(messages: ConversationMessage[]) {
    const catalogSummary = this.buildCatalogSummary();
    const systemMessage = this.buildSystemInstruction(catalogSummary);

    return [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];
  }

  private buildCatalogSummary() {
    return componentCatalog
      .map((component) => `${component.name}: ${component.description}。适用场景：${component.bestFor.join("、")}`)
      .join("\n");
  }

  private buildSystemInstruction(catalogSummary: string) {
    return `你是一名企业中台体验设计师，根据用户的业务描述生成数据模型(schema)、业务操作(schema)以及交互模式(pattern)。\n请参考以下预制组件，并在输出中选择最适合的组件组合：\n${catalogSummary}\n输出需要严格符合 BusinessAppRuntime JSON Schema。`;
  }

  private extractJsonText(response: any): string | null {
    if (!response) return null;

    const fromResponses = response?.output?.[0]?.content?.[0]?.text;
    if (typeof fromResponses === "string" && fromResponses.trim()) {
      return fromResponses;
    }

    if (typeof response?.output_text === "string" && response.output_text.trim()) {
      return response.output_text;
    }

    const choices = response?.choices;
    if (Array.isArray(choices) && choices.length > 0) {
      const firstChoice = choices[0];
      const messageContent = firstChoice?.message?.content;

      if (typeof messageContent === "string" && messageContent.trim()) {
        return messageContent;
      }

      if (Array.isArray(messageContent)) {
        const textPart = messageContent.find((part: any) => part?.type === "text" && typeof part?.text === "string");
        if (textPart?.text?.trim()) {
          return textPart.text;
        }
      }

      if (typeof firstChoice?.text === "string" && firstChoice.text.trim()) {
        return firstChoice.text;
      }
    }

    return null;
  }
}

function parseAdditionalHeaders(value?: string | null): Record<string, string> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const headers: Record<string, string> = {};
      Object.entries(parsed).forEach(([key, val]) => {
        if (typeof val === "string") {
          headers[key] = val;
        } else if (val !== undefined && val !== null) {
          headers[key] = JSON.stringify(val);
        }
      });
      return headers;
    }
  } catch (error) {
    console.warn("Failed to parse AI additional headers", error);
  }
  return undefined;
}

export async function interpretConversation(messages: ConversationMessage[]): Promise<BusinessAppRuntimePayload> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY;
  if (apiKey) {
    try {
      const interpreter = new OpenAiInterpreter({
        apiKey,
        model: process.env.OPENAI_MODEL ?? process.env.AI_MODEL,
        baseUrl: process.env.OPENAI_BASE_URL ?? process.env.AI_API_BASE_URL,
        endpoint: process.env.OPENAI_COMPAT_ENDPOINT ?? process.env.AI_API_ENDPOINT,
        apiKeyHeader: process.env.OPENAI_API_KEY_HEADER ?? process.env.AI_API_KEY_HEADER,
        organization: process.env.OPENAI_ORG ?? process.env.OPENAI_ORGANIZATION,
        project: process.env.OPENAI_PROJECT,
        extraHeaders:
          parseAdditionalHeaders(process.env.OPENAI_ADDITIONAL_HEADERS) ??
          parseAdditionalHeaders(process.env.AI_API_ADDITIONAL_HEADERS) ??
          {},
      });
      return await interpreter.interpret(messages);
    } catch (error) {
      console.error("OpenAI interpreter failed, fallback to mock.", error);
    }
  }
  const interpreter = new MockAiInterpreter();
  return interpreter.interpret(messages);
}
