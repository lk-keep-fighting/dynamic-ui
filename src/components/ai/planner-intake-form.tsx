"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const plannerIntakeSchema = z.object({
  appName: z.string().trim().min(2, "请至少输入 2 个字"),
  businessModel: z.string().trim().min(10, "请详细描述业务模型"),
  keyEntities: z.string().trim().min(10, "请列出核心实体与字段"),
  primaryActions: z.string().trim().min(10, "请说明关键操作或流程"),
  dataExamples: z.string().trim().min(5, "请提供示例数据或指标"),
  interactionPreference: z.string().trim().optional(),
});

export type PlannerIntakeValues = z.infer<typeof plannerIntakeSchema>;

export type PlannerIntakeFieldId = keyof PlannerIntakeValues;

export type PlannerIntakeField = {
  id: PlannerIntakeFieldId;
  label: string;
  description: string;
  placeholder: string;
  component: "input" | "textarea";
  required: boolean;
};

export const plannerIntakeFields: PlannerIntakeField[] = [
  {
    id: "appName",
    label: "业务应用名称",
    description: "用于命名生成的中后台界面，便于后续引用。",
    placeholder: "例如：销售订单智能中台",
    component: "input",
    required: true,
  },
  {
    id: "businessModel",
    label: "业务模型概述",
    description: "描述系统要解决的问题、目标用户以及价值主张。",
    placeholder: "例如：服务B2B销售团队，集中管理线索、订单与回款。",
    component: "textarea",
    required: true,
  },
  {
    id: "keyEntities",
    label: "核心数据实体与字段",
    description: "列出关键实体、字段及彼此关系，便于构建数据模型。",
    placeholder: "例如：订单（编号、客户、金额、状态）、客户（名称、行业、等级）。",
    component: "textarea",
    required: true,
  },
  {
    id: "primaryActions",
    label: "关键操作 / 流程",
    description: "说明用户在系统中需要完成的主要动作或审批流程。",
    placeholder: "例如：创建订单、更新状态、发起补货、审批调拨。",
    component: "textarea",
    required: true,
  },
  {
    id: "dataExamples",
    label: "样本数据或指标",
    description: "提供几条示例数据或关键指标，帮助界面默认填充内容。",
    placeholder: "例如：最近订单金额、库存水位、绩效完成率样本。",
    component: "textarea",
    required: true,
  },
  {
    id: "interactionPreference",
    label: "界面侧重点（可选）",
    description: "可选，描述希望突出展示的模块、图表或布局偏好。",
    placeholder: "例如：强调统计概览和操作入口，移动端优先。",
    component: "textarea",
    required: false,
  },
];

export type RequirementIntakeFormProps = {
  defaultValues?: Partial<PlannerIntakeValues>;
  onSubmit: (values: PlannerIntakeValues) => Promise<void> | void;
};

export function RequirementIntakeForm({ defaultValues, onSubmit }: RequirementIntakeFormProps) {
  const form = useForm<PlannerIntakeValues>({
    resolver: zodResolver(plannerIntakeSchema),
    defaultValues: {
      appName: defaultValues?.appName ?? "",
      businessModel: defaultValues?.businessModel ?? "",
      keyEntities: defaultValues?.keyEntities ?? "",
      primaryActions: defaultValues?.primaryActions ?? "",
      dataExamples: defaultValues?.dataExamples ?? "",
      interactionPreference: defaultValues?.interactionPreference ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      appName: defaultValues?.appName ?? "",
      businessModel: defaultValues?.businessModel ?? "",
      keyEntities: defaultValues?.keyEntities ?? "",
      primaryActions: defaultValues?.primaryActions ?? "",
      dataExamples: defaultValues?.dataExamples ?? "",
      interactionPreference: defaultValues?.interactionPreference ?? "",
    });
  }, [defaultValues, form]);

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        {plannerIntakeFields.map((field) => (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: controller }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {field.label}
                  {field.required ? <span className="text-destructive"> *</span> : null}
                </FormLabel>
                <FormDescription>{field.description}</FormDescription>
                <FormControl>
                  {field.component === "input" ? (
                    <Input
                      placeholder={field.placeholder}
                      {...controller}
                    />
                  ) : (
                    <Textarea
                      placeholder={field.placeholder}
                      className="min-h-[120px]"
                      {...controller}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            信息越完整，生成的界面越贴合真实业务场景。
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "提交补充信息"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
