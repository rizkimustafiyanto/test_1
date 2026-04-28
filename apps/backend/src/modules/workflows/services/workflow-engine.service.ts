import { topologicallySortWorkflowSteps } from "./dag.service";
import { getWorkflowStepExecutor } from "./workflow-executor.service";
import type {
  WorkflowDefinition,
  WorkflowExecutionMode,
  WorkflowExecutionResult,
  WorkflowRunOptions,
  WorkflowStep,
  WorkflowStepRuntimeState,
} from "../types/workflow.types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getBackoffDelay(baseDelayMs: number, attempt: number): number {
  return baseDelayMs * 2 ** Math.max(0, attempt - 1);
}

function buildDependencyOutputs(
  step: WorkflowStep,
  outputs: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  return step.dependsOn.reduce<Record<string, Record<string, unknown>>>(
    (acc, dependencyId) => {
      acc[dependencyId] = outputs[dependencyId] ?? {};
      return acc;
    },
    {},
  );
}

function buildStepInput(
  baseInput: Record<string, unknown>,
  dependencyOutputs: Record<string, Record<string, unknown>>,
): Record<string, unknown> {
  return Object.values(dependencyOutputs).reduce<Record<string, unknown>>(
    (acc, output) => ({
      ...acc,
      ...output,
    }),
    { ...baseInput },
  );
}

function createInitialStepStates(steps: WorkflowStep[]): Record<string, WorkflowStepRuntimeState> {
  return steps.reduce<Record<string, WorkflowStepRuntimeState>>((acc, step) => {
    acc[step.id] = {
      stepId: step.id,
      status: "pending",
      attempts: 0,
    };
    return acc;
  }, {});
}

async function executeStepWithRetry(
  step: WorkflowStep,
  outputs: Record<string, Record<string, unknown>>,
  stepStates: Record<string, WorkflowStepRuntimeState>,
  options: Required<Pick<WorkflowRunOptions, "maxRetries" | "backoffMs" | "input">>
    & Pick<WorkflowRunOptions, "onStepStarted" | "onStepCompleted" | "onStepFailed">,
): Promise<Record<string, unknown>> {
  const executor = getWorkflowStepExecutor(step.type);
  const dependencyOutputs = buildDependencyOutputs(step, outputs);
  const input = buildStepInput(options.input, dependencyOutputs);
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= options.maxRetries + 1; attempt += 1) {
    const currentState = stepStates[step.id] ?? {
      stepId: step.id,
      status: "pending" as const,
      attempts: 0,
    };

    stepStates[step.id] = {
      ...currentState,
      status: "running",
      attempts: attempt,
      startedAt: currentState.startedAt ?? new Date(),
    };

    await options.onStepStarted?.({
      event: "step_started",
      runId: "",
      workflowId: "",
      tenantId: "",
      stepId: step.id,
      stepType: step.type,
      attempt,
      timestamp: new Date().toISOString(),
    });

    try {
      const output = await executor({
        step,
        input,
        dependencyOutputs,
        attempt,
      });

      stepStates[step.id] = {
        ...currentState,
        status: "success",
        attempts: attempt,
        finishedAt: new Date(),
        output,
      };

      await options.onStepCompleted?.({
        event: "step_completed",
        runId: "",
        workflowId: "",
        tenantId: "",
        stepId: step.id,
        stepType: step.type,
        attempt,
        timestamp: new Date().toISOString(),
        output,
      });

      return output;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Step execution failed");

      stepStates[step.id] = {
        ...currentState,
        status: "failed",
        attempts: attempt,
        finishedAt: new Date(),
        error: lastError.message,
      };

      await options.onStepFailed?.({
        event: "step_failed",
        runId: "",
        workflowId: "",
        tenantId: "",
        stepId: step.id,
        stepType: step.type,
        attempt,
        timestamp: new Date().toISOString(),
        error: lastError.message,
      });

      if (attempt > options.maxRetries) {
        break;
      }

      await sleep(getBackoffDelay(options.backoffMs, attempt));
    }
  }

  throw lastError ?? new Error(`Step ${step.id} failed`);
}

async function runSequential(
  stepsById: Map<string, WorkflowStep>,
  orderedStepIds: string[],
  outputs: Record<string, Record<string, unknown>>,
  stepStates: Record<string, WorkflowStepRuntimeState>,
  options: Required<Pick<WorkflowRunOptions, "maxRetries" | "backoffMs" | "input">>
    & Pick<WorkflowRunOptions, "onStepStarted" | "onStepCompleted" | "onStepFailed">,
): Promise<void> {
  for (const stepId of orderedStepIds) {
    const step = stepsById.get(stepId);

    if (!step) {
      throw new Error(`Missing step ${stepId}`);
    }

    outputs[stepId] = await executeStepWithRetry(step, outputs, stepStates, options);
  }
}

async function runParallel(
  stepsById: Map<string, WorkflowStep>,
  parallelGroups: string[][],
  outputs: Record<string, Record<string, unknown>>,
  stepStates: Record<string, WorkflowStepRuntimeState>,
  options: Required<Pick<WorkflowRunOptions, "maxRetries" | "backoffMs" | "input">>
    & Pick<WorkflowRunOptions, "onStepStarted" | "onStepCompleted" | "onStepFailed">,
): Promise<void> {
  for (const group of parallelGroups) {
    const results = await Promise.all(
      group.map(async (stepId) => {
        const step = stepsById.get(stepId);

        if (!step) {
          throw new Error(`Missing step ${stepId}`);
        }

        const output = await executeStepWithRetry(step, outputs, stepStates, options);
        return { stepId, output };
      }),
    );

    for (const result of results) {
      outputs[result.stepId] = result.output;
    }
  }
}

export async function executeWorkflow(
  workflow: WorkflowDefinition,
  options: WorkflowRunOptions = {},
): Promise<WorkflowExecutionResult> {
  const plan = topologicallySortWorkflowSteps(workflow.steps);
  const mode: WorkflowExecutionMode = options.mode ?? "parallel";
  const normalizedOptions = {
    input: options.input ?? {},
    maxRetries: options.maxRetries ?? 0,
    backoffMs: options.backoffMs ?? 250,
    onStepStarted: options.onStepStarted,
    onStepCompleted: options.onStepCompleted,
    onStepFailed: options.onStepFailed,
  };
  const outputs: Record<string, Record<string, unknown>> = {};
  const stepStates = createInitialStepStates(workflow.steps);
  const stepsById = new Map(workflow.steps.map((step) => [step.id, step]));

  if (mode === "sequential") {
    await runSequential(
      stepsById,
      plan.orderedStepIds,
      outputs,
      stepStates,
      normalizedOptions,
    );
  } else {
    await runParallel(
      stepsById,
      plan.parallelGroups,
      outputs,
      stepStates,
      normalizedOptions,
    );
  }

  return {
    mode,
    orderedStepIds: plan.orderedStepIds,
    parallelGroups: plan.parallelGroups,
    stepStates,
    outputs,
  };
}
