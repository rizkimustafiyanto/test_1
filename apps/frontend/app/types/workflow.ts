export type WorkflowExecutionMode = 'sequential' | 'parallel'

export type WorkflowStepConfig = Record<string, unknown>

export type WorkflowDefinitionStep = {
  id: string
  type: string
  dependsOn: string[]
  config: WorkflowStepConfig
}

export type WorkflowDefinition = {
  steps: WorkflowDefinitionStep[]
}

export type WorkflowRecord = {
  id: string
  tenantId: string
  key?: string
  workflowVersionId?: string
  name: string
  description?: string
  definition: WorkflowDefinition
  createdAt: string
  updatedAt: string
}

export type WorkflowStepRunStatus = 'pending' | 'running' | 'success' | 'failed'

export type WorkflowStepRunRecord = {
  id: string
  stepId: string
  stepType: string
  status: WorkflowStepRunStatus
  attempt: number
  output?: Record<string, unknown>
  error?: string
  startedAt?: string
  finishedAt?: string
}

export type WorkflowRunRecord = {
  id: string
  workflowId: string
  workflowVersionId?: string
  tenantId: string
  triggeredByUserId: string
  status: 'running' | 'success' | 'failed'
  mode?: WorkflowExecutionMode
  input: Record<string, unknown>
  error?: string
  createdAt: string
  startedAt: string
  finishedAt?: string
  stepRuns?: WorkflowStepRunRecord[]
}

export type WorkflowStepEventName =
  | 'step_started'
  | 'step_completed'
  | 'step_failed'

export type WorkflowStepEvent = {
  event: WorkflowStepEventName
  runId: string
  workflowId: string
  tenantId: string
  stepId: string
  stepType: string
  attempt: number
  timestamp: string
  output?: Record<string, unknown>
  error?: string
}
