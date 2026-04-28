import type {
  WorkflowExecutionContext,
  WorkflowStep,
  WorkflowStepExecutionContext,
  WorkflowStepExecutor,
} from "../types/workflow.types";

export type WorkflowNodeExecutor = (
  context: WorkflowExecutionContext,
) => Promise<Record<string, unknown>>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const noopNodeExecutor: WorkflowNodeExecutor = async ({ input, config }) => ({
  ...input,
  ...config,
});

const nodeExecutors = new Map<string, WorkflowNodeExecutor>([["noop", noopNodeExecutor]]);

const httpStepExecutor: WorkflowStepExecutor = async ({ step, attempt }) => {
  const url = String(step.config.url ?? "https://example.test");
  const method = String(step.config.method ?? "GET");
  const latencyMs = Number(step.config.latencyMs ?? 100);
  const shouldFail = Boolean(step.config.shouldFail);
  const failUntilAttempt = Number(step.config.failUntilAttempt ?? 0);

  await sleep(latencyMs);

  if (shouldFail || attempt <= failUntilAttempt) {
    throw new Error(`Simulated HTTP failure for ${step.id}`);
  }

  return {
    stepId: step.id,
    type: step.type,
    response: {
      ok: true,
      status: 200,
      method,
      url,
    },
  };
};

const delayStepExecutor: WorkflowStepExecutor = async ({ step }) => {
  const ms = Number(step.config.ms ?? 0);

  await sleep(ms);

  return {
    stepId: step.id,
    type: step.type,
    delayedMs: ms,
  };
};

const scriptStepExecutor: WorkflowStepExecutor = async ({
  step,
  input,
  dependencyOutputs,
}) => {
  const scriptName = String(step.config.scriptName ?? "dummy-script");

  return {
    stepId: step.id,
    type: step.type,
    scriptName,
    receivedInputKeys: Object.keys(input),
    dependencyCount: Object.keys(dependencyOutputs).length,
    result: step.config.result ?? "ok",
  };
};

const stepExecutors = new Map<WorkflowStep["type"], WorkflowStepExecutor>([
  ["http", httpStepExecutor],
  ["delay", delayStepExecutor],
  ["script", scriptStepExecutor],
]);

export function getWorkflowNodeExecutor(type: string): WorkflowNodeExecutor {
  return nodeExecutors.get(type) ?? noopNodeExecutor;
}

export function getWorkflowStepExecutor(stepType: WorkflowStep["type"]): WorkflowStepExecutor {
  return stepExecutors.get(stepType) ?? scriptStepExecutor;
}
