import { randomUUID } from "node:crypto";
import { validateWorkflow } from "./dag.service";
import { executeWorkflow } from "./workflow-engine.service";
import { emitWorkflowStepEvent } from "./workflow-events.service";
import { workflowRepository } from "../repositories/workflow.repository";
import type {
  CreateWorkflowRequest,
  TriggerWorkflowRequest,
  WorkflowAccessUser,
  WorkflowRecord,
  WorkflowRunRecord,
} from "../types/workflow.types";
function createStepEventEmitter(
  run: WorkflowRunRecord,
  workflowId: string,
) {
  return (
    eventName: "step_started" | "step_completed" | "step_failed",
    event: {
      stepId: string;
      stepType: string;
      attempt: number;
      timestamp: string;
      output?: Record<string, unknown>;
      error?: string;
    },
  ) => {
    const payload = {
      event: eventName,
      runId: run.id,
      workflowId,
      tenantId: run.tenantId,
      stepId: event.stepId,
      stepType: event.stepType as "http" | "delay" | "script",
      attempt: event.attempt,
      timestamp: event.timestamp,
      output: event.output,
      error: event.error,
    } as const;

    emitWorkflowStepEvent(payload);
    void workflowRepository.upsertStepRunFromEvent(payload);
  };
}

export async function createWorkflow(
  actor: WorkflowAccessUser,
  input: CreateWorkflowRequest,
): Promise<WorkflowRecord> {
  const validation = validateWorkflow(input.definition);

  if (!validation.valid) {
    throw new Error(validation.errors[0]?.message ?? "Workflow definition is invalid");
  }

  return workflowRepository.createWorkflow({
    actor,
    name: input.name,
    description: input.description,
    definition: input.definition,
  });
}

export async function listWorkflows(actor: WorkflowAccessUser): Promise<WorkflowRecord[]> {
  return workflowRepository.listWorkflowsByTenant(actor.tenantId);
}

export async function getWorkflow(
  actor: WorkflowAccessUser,
  workflowId: string,
): Promise<WorkflowRecord | null> {
  const workflow = await workflowRepository.getWorkflowById(workflowId);

  if (!workflow || workflow.tenantId !== actor.tenantId) {
    return null;
  }

  return workflow;
}

export async function listWorkflowRuns(
  actor: WorkflowAccessUser,
  workflowId: string,
): Promise<WorkflowRunRecord[] | null> {
  const workflow = await workflowRepository.getWorkflowById(workflowId);

  if (!workflow || workflow.tenantId !== actor.tenantId) {
    return null;
  }

  return workflowRepository.listRunsByWorkflowId(workflowId, actor.tenantId);
}

export async function triggerWorkflow(
  actor: WorkflowAccessUser,
  workflowId: string,
  input: TriggerWorkflowRequest,
): Promise<WorkflowRunRecord> {
  const workflow = await workflowRepository.getWorkflowById(workflowId);

  if (!workflow || workflow.tenantId !== actor.tenantId) {
    throw new Error("Workflow not found");
  }

  if (!workflow.workflowVersionId) {
    throw new Error("Workflow latest version is missing");
  }

  const baseRun = await workflowRepository.createRun({
    actor,
    workflowId: workflow.id,
    workflowVersionId: workflow.workflowVersionId,
    mode: input.mode ?? "parallel",
    input: input.input ?? {},
  });

  const emitStepEvent = createStepEventEmitter(baseRun, workflow.id);

  try {
    const result = await executeWorkflow(workflow.definition, {
      input: input.input,
      mode: input.mode,
      maxRetries: input.maxRetries,
      backoffMs: input.backoffMs,
      onStepStarted: (event) => emitStepEvent("step_started", event),
      onStepCompleted: (event) => emitStepEvent("step_completed", event),
      onStepFailed: (event) => emitStepEvent("step_failed", event),
    });

    const completedRun: WorkflowRunRecord = {
      ...baseRun,
      status: "success",
      mode: input.mode ?? "parallel",
      result,
      finishedAt: new Date().toISOString(),
    };

    return workflowRepository.updateRun(completedRun);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow execution failed";
    const failedRun: WorkflowRunRecord = {
      ...baseRun,
      status: "failed",
      mode: input.mode ?? "parallel",
      error: message,
      finishedAt: new Date().toISOString(),
    };

    await workflowRepository.updateRun(failedRun);
    throw error;
  }
}

export async function getRun(
  actor: WorkflowAccessUser,
  runId: string,
): Promise<WorkflowRunRecord | null> {
  const run = await workflowRepository.getRunById(runId);

  if (!run || run.tenantId !== actor.tenantId) {
    return null;
  }

  return run;
}
