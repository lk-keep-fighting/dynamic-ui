export type PrimitiveFieldType =
  | "string"
  | "text"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "datetime"
  | "enum"
  | "status"
  | "currency"
  | "percentage"
  | "rating";

export type BusinessFieldSchema = {
  name: string;
  label: string;
  type: PrimitiveFieldType;
  description?: string;
  required?: boolean;
  isPrimary?: boolean;
  isIdentifier?: boolean;
  isSearchable?: boolean;
  isMetric?: boolean;
  format?: string;
  unit?: string;
  enumValues?: { label: string; value: string }[];
  componentHint?:
    | "text"
    | "textarea"
    | "select"
    | "multiselect"
    | "switch"
    | "badge"
    | "chip"
    | "progress"
    | "rating"
    | "currency"
    | "percentage"
    | "date"
    | "datetime";
};

export type BusinessRelationSchema = {
  relation: "hasMany" | "hasOne" | "belongsTo";
  target: string;
  via?: string;
  label?: string;
  description?: string;
};

export type BusinessEntitySchema = {
  id: string;
  name: string;
  label: string;
  description?: string;
  fields: BusinessFieldSchema[];
  relations?: BusinessRelationSchema[];
  sampleData?: Record<string, unknown>[];
};

export type OperationHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type OperationParameter = {
  name: string;
  label: string;
  type: PrimitiveFieldType;
  description?: string;
  required?: boolean;
  ref?: { entity: string; field: string };
  enumValues?: { label: string; value: string }[];
  defaultValue?: unknown;
};

export type OperationResponse = {
  description?: string;
  entity?: string;
  type: "collection" | "entity" | "custom";
};

export type BusinessOperationSchema = {
  id: string;
  name: string;
  label: string;
  targetEntity: string;
  description?: string;
  kind: "create" | "update" | "delete" | "action";
  method: OperationHttpMethod;
  endpoint: string;
  parameters?: OperationParameter[];
  response?: OperationResponse;
  ui?: {
    variant?: "dialog" | "sheet" | "inline" | "drawer";
    intent?: "primary" | "secondary" | "destructive";
    triggerLabel?: string;
    successMessage?: string;
  };
};

export type InteractionPatternType =
  | "collection-hub"
  | "detail-dashboard"
  | "workflow-console"
  | "analytics-summary";

export type InteractionPattern = {
  id: string;
  name: string;
  description: string;
  type: InteractionPatternType;
  entity: string;
  operations?: string[];
  dataBinding?: {
    source: string; // entity id or custom provider
    relationships?: string[];
  };
  features?: {
    quickFilters?: boolean;
    quickStats?: boolean;
    bulkActions?: boolean;
    timeline?: boolean;
    highlights?: boolean;
  };
  layoutHints?: {
    columns?: number;
    emphasis?: "data" | "actions" | "insights";
  };
};

export type BusinessAppSchema = {
  id: string;
  name: string;
  description?: string;
  entities: BusinessEntitySchema[];
  operations: BusinessOperationSchema[];
  patterns: InteractionPattern[];
};

export type BusinessDataset = {
  entity: string;
  records: Record<string, unknown>[];
};

export type BusinessAppRuntimePayload = {
  schema: BusinessAppSchema;
  datasets?: BusinessDataset[];
};
