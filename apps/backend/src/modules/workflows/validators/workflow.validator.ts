import type {
  CreateWorkflowRequest,
  TriggerWorkflowRequest,
  WorkflowDefinition,
  WorkflowExecutionMode,
} from "../types/workflow.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExecutionMode(value: unknown): value is WorkflowExecutionMode {
  return value === "parallel" || value === "sequential";
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function parseCreateWorkflowRequest(payload: unknown): CreateWorkflowRequest {
  if (!isRecord(payload)) {
    throw new Error("Request body must be an object");
  }

  if (typeof payload.name !== "string" || payload.name.trim().length === 0) {
    throw new Error("name is required");
  }

  const definition = payload.definition;

  if (!isRecord(definition) || !Array.isArray(definition.steps)) {
    throw new Error("definition.steps is required");
  }

  return {
    name: payload.name.trim(),
    description:
      typeof payload.description === "string" && payload.description.trim().length > 0
        ? payload.description.trim()
        : undefined,
    definition: definition as WorkflowDefinition,
  };
}

export function parseTriggerWorkflowRequest(payload: unknown): TriggerWorkflowRequest {
  if (payload === undefined) {
    return {};
  }

  if (!isRecord(payload)) {
    throw new Error("Request body must be an object");
  }

  if (payload.mode !== undefined && !isExecutionMode(payload.mode)) {
    throw new Error("mode must be 'parallel' or 'sequential'");
  }

  if (payload.maxRetries !== undefined && !isNonNegativeInteger(payload.maxRetries)) {
    throw new Error("maxRetries must be a non-negative integer");
  }

  if (payload.backoffMs !== undefined && !isNonNegativeNumber(payload.backoffMs)) {
    throw new Error("backoffMs must be a non-negative number");
  }

  if (payload.input !== undefined && !isRecord(payload.input)) {
    throw new Error("input must be an object");
  }

  return {
    input: payload.input as Record<string, unknown> | undefined,
    mode: payload.mode,
    maxRetries: payload.maxRetries as number | undefined,
    backoffMs: payload.backoffMs as number | undefined,
  };
}
