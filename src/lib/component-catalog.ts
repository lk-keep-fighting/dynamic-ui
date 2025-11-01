export type CatalogComponent = {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
  inputs: string[];
  outputs?: string[];
  interactionHints?: string[];
  layoutHints?: string[];
  codeExample?: string;
};

export const componentCatalog: CatalogComponent[] = [
  {
    id: "stat-card",
    name: "统计卡片",
    description:
      "用于展示关键业务指标、趋势百分比或聚合数据，常见于仪表盘顶部。",
    bestFor: ["关键指标", "实时概览"],
    inputs: ["title", "value", "change", "icon"],
    interactionHints: ["可点击跳转详情", "可组合为统计网格"],
    layoutHints: ["适合放置在网格布局", "支持 3~4 列展示"],
    codeExample:
      "<MetricCard title=\"订单总额\" value=\"¥930,000\" change=\"↑12%\" />",
  },
  {
    id: "data-table",
    name: "数据表格",
    description:
      "支持排序、过滤、分页的高级表格，用于展示结构化的列表数据。",
    bestFor: ["列表数据", "批量操作", "多字段对比"],
    inputs: ["columns", "rows", "filters", "rowActions"],
    interactionHints: ["支持工具栏按钮", "可嵌入行内操作按钮"],
    layoutHints: ["在内容区域占满宽度", "可与统计卡片组合"],
    codeExample:
      "<EntityTable entity=\"orders\" data={orders} onSelect={...} />",
  },
  {
    id: "entity-form",
    name: "业务表单",
    description:
      "根据数据模型动态生成的表单组件，支持表单校验与提交反馈。",
    bestFor: ["创建或编辑实体", "业务流程审批"],
    inputs: ["fields", "initialValues", "submit"],
    interactionHints: ["可放置在弹窗、侧滑面板", "可组合为多步流程"],
    layoutHints: ["表单项自动两列布局", "支持分组标题"],
    codeExample:
      "<EntityForm schema={entitySchema} onSubmit={saveOrder} />",
  },
  {
    id: "detail-panel",
    name: "详情面板",
    description:
      "以卡片和标签形式展示单条业务数据的详情，支持标签式字段组。",
    bestFor: ["查看实体详情", "展示上下文信息"],
    inputs: ["entity", "record", "highlightFields"],
    interactionHints: ["可搭配时间线", "可插入操作按钮"],
    layoutHints: ["侧边栏或弹出抽屉", "可两列排布"],
    codeExample:
      "<DetailPanel entity={customer} record={selectedCustomer} />",
  },
  {
    id: "tab-layout",
    name: "标签页布局",
    description:
      "用于将不同类型的数据或操作分组，例如详情、流程、报表等视图。",
    bestFor: ["多维度数据", "复杂业务面板"],
    inputs: ["tabs", "panes"],
    interactionHints: ["可结合表格、表单、图表"],
    layoutHints: ["支持纵向和横向布局"],
    codeExample:
      "<TabbedView tabs={[{ id: 'overview', label: '概览', content: <Overview /> }]} />",
  },
  {
    id: "action-bar",
    name: "操作工具栏",
    description:
      "放置常用操作按钮、筛选器、搜索栏的横向工具区域。",
    bestFor: ["列表页顶部", "批量操作"],
    inputs: ["actions", "filters", "search"],
    interactionHints: ["支持权限控制", "支持下拉菜单"],
    layoutHints: ["通常放置在表格上方", "按钮按重要性从左到右排序"],
    codeExample:
      "<ActionBar search filters actions={primaryActions} />",
  },
  {
    id: "timeline",
    name: "时间线",
    description:
      "按时间顺序展示业务事件、审批记录，适合流程追踪。",
    bestFor: ["事件追踪", "审批记录"],
    inputs: ["items", "timestamp", "actor"],
    interactionHints: ["可点击事件查看详情"],
    layoutHints: ["常见于详情侧边栏"],
    codeExample:
      "<Timeline items={orderEvents} />",
  },
  {
    id: "kanban-board",
    name: "看板",
    description:
      "以列和卡片形式展示状态流转，常用于销售线索、任务管理。",
    bestFor: ["状态流转", "看板管理"],
    inputs: ["columns", "cards", "onDrag"],
    interactionHints: ["支持拖拽更新状态", "可配置统计"],
    layoutHints: ["多列平铺布局"],
    codeExample:
      "<KanbanBoard columns={pipelineColumns} onMove={handlePipelineMove} />",
  },
];

export function findCatalogComponent(id: string): CatalogComponent | undefined {
  return componentCatalog.find((item) => item.id === id);
}
