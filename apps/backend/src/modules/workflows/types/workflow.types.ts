export type WorkflowNodeInput = {
  key: string;
  name: string;
  type: string;
  config?: Record<string, unknown>;
};

export type WorkflowEdgeInput = {
  fromNodeKey: string;
  toNodeKey: string;
};

export type CreateWorkflowInput = {
  name: string;
  description?: string;
  nodes: WorkflowNodeInput[];
  edges: WorkflowEdgeInput[];
};

export type ExecuteWorkflowInput = {
  input?: Record<string, unknown>;
};

export type WorkflowExecutionContext = {
  workflowId: string;
  runId: string;
  nodeKey: string;
  input: Record<string, unknown>;
  config: Record<string, unknown>;
  previousOutputs: Record<string, unknown>;
};

export type WorkflowStepType = "http" | "delay" | "script";

export type WorkflowStepConfig = Record<string, unknown>;

export type WorkflowStep = {
  id: string;
  type: WorkflowStepType;
  dependsOn: string[];
  config: WorkflowStepConfig;
};

export type WorkflowDefinition = {
  steps: WorkflowStep[];
};

export type WorkflowValidationErrorCode =
  | "EMPTY_WORKFLOW"
  | "DUPLICATE_STEP_ID"
  | "INVALID_STEP_ID"
  | "INVALID_DEPENDENCY_ID"
  | "UNKNOWN_DEPENDENCY"
  | "SELF_DEPENDENCY"
  | "CYCLE_DETECTED";

export type WorkflowValidationError = {
  code: WorkflowValidationErrorCode;
  message: string;
  stepId?: string;
  dependencyId?: string;
};

export type WorkflowValidationResult = {
  valid: boolean;
  errors: WorkflowValidationError[];
  orderedStepIds: string[];
};

export type WorkflowExecutionPlan = {
  orderedStepIds: string[];
  parallelGroups: string[][];
};

export type WorkflowExecutionMode = "sequential" | "parallel";

export type WorkflowStepStatus = "pending" | "running" | "success" | "failed";

export type WorkflowStepRuntimeState = {
  stepId: string;
  status: WorkflowStepStatus;
  attempts: number;
  startedAt?: Date;
  finishedAt?: Date;
  output?: Record<string, unknown>;
  error?: string;
};

export type WorkflowRunOptions = {
  mode?: WorkflowExecutionMode;
  maxRetries?: number;
  backoffMs?: number;
  input?: Record<string, unknown>;
  onStepStarted?: (event: WorkflowStepEvent) => void | Promise<void>;
  onStepCompleted?: (event: WorkflowStepEvent) => void | Promise<void>;
  onStepFailed?: (event: WorkflowStepEvent) => void | Promise<void>;
};

export type WorkflowStepExecutionContext = {
  step: WorkflowStep;
  input: Record<string, unknown>;
  dependencyOutputs: Record<string, Record<string, unknown>>;
  attempt: number;
};

export type WorkflowStepExecutor = (
  context: WorkflowStepExecutionContext,
) => Promise<Record<string, unknown>>;

export type WorkflowExecutionResult = {
  mode: WorkflowExecutionMode;
  orderedStepIds: string[];
  parallelGroups: string[][];
  stepStates: Record<string, WorkflowStepRuntimeState>;
  outputs: Record<string, Record<string, unknown>>;
};

export type WorkflowRole = "admin" | "editor" | "viewer";

export type WorkflowAccessUser = {
  userId: string;
  tenantId: string;
  role: WorkflowRole;
};

export type CreateWorkflowRequest = {
  name: string;
  description?: string;
  definition: WorkflowDefinition;
};

export type TriggerWorkflowRequest = {
  input?: Record<string, unknown>;
  mode?: WorkflowExecutionMode;
  maxRetries?: number;
  backoffMs?: number;
};

export type WorkflowRecord = {
  id: string;
  tenantId: string;
  key?: string;
  workflowVersionId?: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowRunRecord = {
  id: string;
  workflowId: string;
  workflowVersionId?: string;
  tenantId: string;
  triggeredByUserId: string;
  status: "running" | "success" | "failed";
  mode?: WorkflowExecutionMode;
  input: Record<string, unknown>;
  result?: WorkflowExecutionResult;
  error?: string;
  createdAt: string;
  startedAt: string;
  finishedAt?: string;
  stepRuns?: WorkflowStepRunRecord[];
};

export type WorkflowRunStatus = WorkflowRunRecord["status"];

export type WorkflowStepRunRecord = {
  id: string;
  workflowRunId: string;
  tenantId: string;
  stepId: string;
  stepType: WorkflowStepType;
  status: "pending" | "running" | "success" | "failed";
  attempt: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStepEventName =
  | "step_started"
  | "step_completed"
  | "step_failed";

export type WorkflowStepEvent = {
  event: WorkflowStepEventName;
  runId: string;
  workflowId: string;
  tenantId: string;
  stepId: string;
  stepType: WorkflowStepType;
  attempt: number;
  timestamp: string;
  output?: Record<string, unknown>;
  error?: string;
};
