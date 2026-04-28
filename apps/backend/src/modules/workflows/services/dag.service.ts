import type {
  WorkflowDefinition,
  WorkflowEdgeInput,
  WorkflowExecutionPlan,
  WorkflowNodeInput,
  WorkflowStep,
  WorkflowValidationError,
  WorkflowValidationResult,
} from "../types/workflow.types";

type DagValidationResult = {
  orderedNodeKeys: string[];
  incomingMap: Map<string, string[]>;
};

export function validateDag(
  nodes: WorkflowNodeInput[],
  edges: WorkflowEdgeInput[],
): DagValidationResult {
  if (nodes.length === 0) {
    throw new Error("Workflow must contain at least one node");
  }

  const nodeKeys = new Set<string>();
  const adjacency = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();
  const incomingMap = new Map<string, string[]>();

  for (const node of nodes) {
    if (nodeKeys.has(node.key)) {
      throw new Error(`Duplicate node key: ${node.key}`);
    }

    nodeKeys.add(node.key);
    adjacency.set(node.key, []);
    incomingCount.set(node.key, 0);
    incomingMap.set(node.key, []);
  }

  for (const edge of edges) {
    if (!nodeKeys.has(edge.fromNodeKey) || !nodeKeys.has(edge.toNodeKey)) {
      throw new Error(
        `Edge references unknown node: ${edge.fromNodeKey} -> ${edge.toNodeKey}`,
      );
    }

    adjacency.get(edge.fromNodeKey)?.push(edge.toNodeKey);
    incomingCount.set(
      edge.toNodeKey,
      (incomingCount.get(edge.toNodeKey) ?? 0) + 1,
    );
    incomingMap.get(edge.toNodeKey)?.push(edge.fromNodeKey);
  }

  const queue = [...incomingCount.entries()]
    .filter(([, count]) => count === 0)
    .map(([nodeKey]) => nodeKey);
  const orderedNodeKeys: string[] = [];

  while (queue.length > 0) {
    const nodeKey = queue.shift();

    if (!nodeKey) {
      continue;
    }

    orderedNodeKeys.push(nodeKey);

    for (const nextNodeKey of adjacency.get(nodeKey) ?? []) {
      const nextCount = (incomingCount.get(nextNodeKey) ?? 0) - 1;
      incomingCount.set(nextNodeKey, nextCount);

      if (nextCount === 0) {
        queue.push(nextNodeKey);
      }
    }
  }

  if (orderedNodeKeys.length !== nodes.length) {
    throw new Error("Workflow graph contains a cycle");
  }

  return {
    orderedNodeKeys,
    incomingMap,
  };
}

function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

function buildError(error: WorkflowValidationError): WorkflowValidationError {
  return error;
}

type StepGraph = {
  stepIds: Set<string>;
  adjacency: Map<string, string[]>;
  incomingCount: Map<string, number>;
  errors: WorkflowValidationError[];
};

function buildStepGraph(steps: WorkflowStep[]): StepGraph {
  const errors: WorkflowValidationError[] = [];
  const stepIds = new Set<string>();
  const adjacency = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();

  for (const step of steps) {
    if (!isNonEmptyString(step.id)) {
      errors.push(
        buildError({
          code: "INVALID_STEP_ID",
          message: "Step id must be a non-empty string",
        }),
      );
      continue;
    }

    if (stepIds.has(step.id)) {
      errors.push(
        buildError({
          code: "DUPLICATE_STEP_ID",
          message: `Duplicate step id: ${step.id}`,
          stepId: step.id,
        }),
      );
      continue;
    }

    stepIds.add(step.id);
    adjacency.set(step.id, []);
    incomingCount.set(step.id, 0);
  }

  for (const step of steps) {
    if (!stepIds.has(step.id)) {
      continue;
    }

    for (const dependencyId of step.dependsOn) {
      if (!isNonEmptyString(dependencyId)) {
        errors.push(
          buildError({
            code: "INVALID_DEPENDENCY_ID",
            message: `Step ${step.id} contains an empty dependency id`,
            stepId: step.id,
          }),
        );
        continue;
      }

      if (dependencyId === step.id) {
        errors.push(
          buildError({
            code: "SELF_DEPENDENCY",
            message: `Step ${step.id} cannot depend on itself`,
            stepId: step.id,
            dependencyId,
          }),
        );
        continue;
      }

      if (!stepIds.has(dependencyId)) {
        errors.push(
          buildError({
            code: "UNKNOWN_DEPENDENCY",
            message: `Step ${step.id} depends on unknown step ${dependencyId}`,
            stepId: step.id,
            dependencyId,
          }),
        );
        continue;
      }

      adjacency.get(dependencyId)?.push(step.id);
      incomingCount.set(step.id, (incomingCount.get(step.id) ?? 0) + 1);
    }
  }

  return {
    stepIds,
    adjacency,
    incomingCount,
    errors,
  };
}

export function topologicallySortWorkflowSteps(
  steps: WorkflowStep[],
): WorkflowExecutionPlan {
  if (steps.length === 0) {
    throw new Error("Workflow must contain at least one step");
  }

  const { stepIds, adjacency, incomingCount, errors } = buildStepGraph(steps);

  if (errors.length > 0) {
    throw new Error(errors[0]?.message ?? "Workflow is invalid");
  }

  const queue = [...incomingCount.entries()]
    .filter(([, count]) => count === 0)
    .map(([stepId]) => stepId);
  const orderedStepIds: string[] = [];
  const parallelGroups: string[][] = [];

  while (queue.length > 0) {
    const currentGroup = [...queue];
    queue.length = 0;
    parallelGroups.push(currentGroup);

    for (const stepId of currentGroup) {
      orderedStepIds.push(stepId);

      for (const nextStepId of adjacency.get(stepId) ?? []) {
        const nextCount = (incomingCount.get(nextStepId) ?? 0) - 1;
        incomingCount.set(nextStepId, nextCount);

        if (nextCount === 0) {
          queue.push(nextStepId);
        }
      }
    }
  }

  if (orderedStepIds.length !== stepIds.size) {
    const cyclicStepIds = steps
      .map((step) => step.id)
      .filter((stepId) => stepIds.has(stepId) && !orderedStepIds.includes(stepId));

    throw new Error(
      cyclicStepIds.length > 0
        ? `Workflow contains a cycle involving: ${cyclicStepIds.join(", ")}`
        : "Workflow contains a cycle",
    );
  }

  return {
    orderedStepIds,
    parallelGroups,
  };
}

export function validateWorkflow(
  workflow: WorkflowDefinition,
): WorkflowValidationResult {
  const errors: WorkflowValidationError[] = [];
  const steps = workflow.steps ?? [];

  if (steps.length === 0) {
    errors.push(
      buildError({
        code: "EMPTY_WORKFLOW",
        message: "Workflow must contain at least one step",
      }),
    );
  }

  const { stepIds, errors: graphErrors } = buildStepGraph(steps);

  errors.push(...graphErrors);

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      orderedStepIds: [],
    };
  }

  try {
    const plan = topologicallySortWorkflowSteps(steps);

    return {
      valid: true,
      errors: [],
      orderedStepIds: plan.orderedStepIds,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow contains a cycle";
    const cyclicStepIds = steps
      .map((step: WorkflowStep) => step.id)
      .filter((stepId) => stepIds.has(stepId));

    errors.push(
      buildError({
        code: "CYCLE_DETECTED",
        message,
        stepId: cyclicStepIds[0],
      }),
    );
  }

  return {
    valid: false,
    errors,
    orderedStepIds: [],
  };
}
