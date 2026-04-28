export type WorkflowNodeDto = {
  key: string;
  name: string;
  type: string;
  config?: Record<string, unknown>;
};

export type WorkflowEdgeDto = {
  fromNodeKey: string;
  toNodeKey: string;
};

export type CreateWorkflowDto = {
  name: string;
  description?: string;
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
};

export type ExecuteWorkflowDto = {
  input?: Record<string, unknown>;
};

export * from './config/card.js';
export * from './config/theme.js';
export * from './config/ui.js';
export * from './ui/components.js';
