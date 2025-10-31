"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  BusinessAppSchema,
  BusinessEntitySchema,
  BusinessFieldSchema,
  BusinessOperationSchema,
  OperationParameter,
  PrimitiveFieldType,
} from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export type OperationExecutor = (
  operation: BusinessOperationSchema,
  values: Record<string, unknown>,
) => Promise<void> | void;

const defaultOperationExecutor: OperationExecutor = async (operation, values) => {
  console.info("[operation]", operation.id, values);
  await new Promise((resolve) => setTimeout(resolve, 400));
};

export type OperationFormFieldMeta = {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  component: "text" | "textarea" | "select" | "switch" | "number" | "date" | "datetime";
  options?: { value: string; label: string }[];
  required: boolean;
  type: PrimitiveFieldType;
};

export type OperationFormModel = {
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  defaultValues: Record<string, unknown>;
  fields: OperationFormFieldMeta[];
};

export function buildOperationFormModel(
  operation: BusinessOperationSchema,
  schema: BusinessAppSchema,
): OperationFormModel {
  const entity = schema.entities.find((item) => item.id === operation.targetEntity);
  const parameters = ensureParameters(operation, entity);

  const shape: Record<string, z.ZodTypeAny> = {};
  const defaultValues: Record<string, unknown> = {};
  const fields: OperationFormFieldMeta[] = [];

  parameters.forEach((parameter) => {
    const field = resolveField(parameter, entity);
    const fieldType = parameter.type ?? field?.type ?? "string";
    const required = parameter.required ?? field?.required ?? false;
    const options = parameter.enumValues ?? field?.enumValues;
    const component = inferComponent(parameter, fieldType, field);

    shape[parameter.name] = buildZodValidator(fieldType, required, Boolean(options));
    defaultValues[parameter.name] = inferDefaultValue(parameter, field);

    fields.push({
      name: parameter.name,
      label: parameter.label ?? field?.label ?? parameter.name,
      description: parameter.description ?? field?.description,
      placeholder: field?.description,
      component,
      options,
      required,
      type: fieldType,
    });
  });

  return {
    schema: z.object(shape),
    defaultValues,
    fields,
  };
}

function ensureParameters(
  operation: BusinessOperationSchema,
  entity?: BusinessEntitySchema,
): OperationParameter[] {
  if (operation.parameters && operation.parameters.length > 0) {
    return operation.parameters;
  }
  if (!entity) return [];
  const primaryField = entity.fields.find((field) => field.isPrimary || field.isIdentifier);
  if (!primaryField) return [];
  return [
    {
      name: primaryField.name,
      label: primaryField.label,
      type: primaryField.type,
      required: true,
      description: primaryField.description,
    },
  ];
}

function resolveField(parameter: OperationParameter, entity?: BusinessEntitySchema): BusinessFieldSchema | undefined {
  if (!entity) return undefined;
  if (parameter.ref) {
    const relatedEntity = parameter.ref.entity === entity.id
      ? entity
      : undefined;
    return relatedEntity?.fields.find((field) => field.name === parameter.ref?.field);
  }
  return entity.fields.find((field) => field.name === parameter.name);
}

function inferComponent(
  parameter: OperationParameter,
  type: PrimitiveFieldType,
  field?: BusinessFieldSchema,
): OperationFormFieldMeta["component"] {
  if (parameter.enumValues?.length || field?.enumValues?.length || type === "enum" || type === "status") {
    return "select";
  }
  if (field?.componentHint === "textarea" || type === "text") {
    return "textarea";
  }
  if (type === "boolean") {
    return "switch";
  }
  if (type === "date") {
    return "date";
  }
  if (type === "datetime") {
    return "datetime";
  }
  if (type === "number" || type === "integer" || type === "currency" || type === "percentage") {
    return "number";
  }
  return "text";
}

function buildZodValidator(
  type: PrimitiveFieldType,
  required: boolean,
  hasOptions: boolean,
): z.ZodTypeAny {
  let validator: z.ZodTypeAny;
  switch (type) {
    case "number":
    case "integer":
    case "currency":
    case "percentage":
      validator = z.coerce.number({ invalid_type_error: "请输入数字" });
      break;
    case "boolean":
      validator = z.boolean();
      break;
    case "date":
    case "datetime":
      validator = z.string().min(1, "请选择日期");
      break;
    default:
      validator = hasOptions ? z.string().min(1, "请选择选项") : z.string().trim();
      break;
  }
  return required ? validator : validator.optional();
}

function inferDefaultValue(parameter: OperationParameter, field?: BusinessFieldSchema) {
  if (parameter.defaultValue !== undefined) {
    return parameter.defaultValue;
  }
  if (field?.type === "boolean") {
    return false;
  }
  if (
    field?.type === "number" ||
    field?.type === "integer" ||
    field?.type === "currency" ||
    field?.type === "percentage"
  ) {
    return field.description?.includes("@default:")
      ? Number(field.description.split("@default:")[1])
      : undefined;
  }
  return undefined;
}

export type OperationFormTriggerProps = {
  operation: BusinessOperationSchema;
  schema: BusinessAppSchema;
  onExecute?: OperationExecutor;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "destructive";
  variant?: "dialog" | "sheet" | "inline" | "drawer";
};

export function OperationFormTrigger({
  operation,
  schema,
  onExecute,
  triggerLabel,
  triggerVariant = "default",
  variant,
}: OperationFormTriggerProps) {
  const resolvedVariant = variant ?? operation.ui?.variant ?? "dialog";
  const label = triggerLabel ?? operation.ui?.triggerLabel ?? operation.label;
  const [open, setOpen] = useState(false);

  const handleCompleted = () => {
    toast.success(`${operation.label}已提交`);
    if (resolvedVariant !== "inline") {
      setOpen(false);
    }
  };

  if (resolvedVariant === "inline") {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>{operation.label}</CardTitle>
          {operation.description ? (
            <CardDescription>{operation.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <OperationForm
            operation={operation}
            schema={schema}
            onExecute={onExecute}
            onCompleted={handleCompleted}
          />
        </CardContent>
      </Card>
    );
  }

  if (resolvedVariant === "sheet" || resolvedVariant === "drawer") {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant={triggerVariant}>{label}</Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{operation.label}</SheetTitle>
            {operation.description ? (
              <SheetDescription>{operation.description}</SheetDescription>
            ) : null}
          </SheetHeader>
          <Separator className="my-4" />
          <OperationForm
            operation={operation}
            schema={schema}
            onExecute={onExecute}
            onCompleted={handleCompleted}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>{label}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{operation.label}</DialogTitle>
          {operation.description ? <DialogDescription>{operation.description}</DialogDescription> : null}
        </DialogHeader>
        <OperationForm
          operation={operation}
          schema={schema}
          onExecute={onExecute}
          onCompleted={handleCompleted}
        />
      </DialogContent>
    </Dialog>
  );
}

export type OperationFormProps = {
  operation: BusinessOperationSchema;
  schema: BusinessAppSchema;
  onExecute?: OperationExecutor;
  onCompleted?: () => void;
};

export function OperationForm({ operation, schema, onExecute, onCompleted }: OperationFormProps) {
  const model = useMemo(() => buildOperationFormModel(operation, schema), [operation, schema]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(model.schema),
    defaultValues: model.defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);
      await (onExecute ?? defaultOperationExecutor)(operation, normalizeValues(model.fields, values));
      onCompleted?.();
      form.reset(model.defaultValues);
    } catch (error) {
      console.error(error);
      toast.error(`${operation.label}执行失败`);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (model.fields.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">此操作无需额外输入。</div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {model.fields.map((fieldMeta) => (
          <FormField
            key={fieldMeta.name}
            control={form.control}
            name={fieldMeta.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldMeta.label}
                  {fieldMeta.required ? <span className="text-destructive"> *</span> : null}
                </FormLabel>
                <FormControl>
                  {renderFormControl(fieldMeta, field)}
                </FormControl>
                {fieldMeta.description ? (
                  <p className="text-xs text-muted-foreground">{fieldMeta.description}</p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : operation.ui?.triggerLabel ?? `执行${operation.label}`}
        </Button>
      </form>
    </Form>
  );
}

function renderFormControl(fieldMeta: OperationFormFieldMeta, field: any) {
  switch (fieldMeta.component) {
    case "textarea":
      return <Textarea {...field} placeholder={fieldMeta.placeholder} />;
    case "select":
      return (
        <Select
          onValueChange={field.onChange}
          value={field.value ? String(field.value) : undefined}
        >
          <SelectTrigger>
            <SelectValue placeholder={fieldMeta.placeholder ?? `选择${fieldMeta.label}`} />
          </SelectTrigger>
          <SelectContent>
            {fieldMeta.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "switch":
      return (
        <div className="flex items-center gap-2 py-1">
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => field.onChange(checked)}
          />
          {fieldMeta.placeholder ? (
            <span className="text-sm text-muted-foreground">{fieldMeta.placeholder}</span>
          ) : null}
        </div>
      );
    case "number":
      return (
        <Input
          type="number"
          value={field.value === undefined ? "" : String(field.value)}
          onChange={(event) => field.onChange(event.target.value)}
          placeholder={fieldMeta.placeholder}
        />
      );
    case "date":
      return (
        <Input
          type="date"
          value={field.value === undefined ? "" : String(field.value)}
          onChange={(event) => field.onChange(event.target.value)}
        />
      );
    case "datetime":
      return (
        <Input
          type="datetime-local"
          value={field.value === undefined ? "" : String(field.value)}
          onChange={(event) => field.onChange(event.target.value)}
        />
      );
    default:
      return <Input {...field} placeholder={fieldMeta.placeholder} />;
  }
}

function normalizeValues(
  fields: OperationFormFieldMeta[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  fields.forEach((field) => {
    const value = values[field.name];
    if (value === "") {
      result[field.name] = undefined;
      return;
    }
    if (field.component === "number") {
      result[field.name] = value === undefined ? undefined : Number(value);
      return;
    }
    result[field.name] = value;
  });
  return result;
}
