import type { WorkflowDefinition } from "../types/workflow.types";

export const validWorkflowExample: WorkflowDefinition = {
  steps: [
    {
      id: "fetch-user",
      type: "http",
      dependsOn: [],
      config: {
        method: "GET",
        url: "https://api.example.com/users/123",
      },
    },
    {
      id: "fetch-account",
      type: "http",
      dependsOn: [],
      config: {
        method: "GET",
        url: "https://api.example.com/accounts/123",
      },
    },
    {
      id: "wait-before-processing",
      type: "delay",
      dependsOn: ["fetch-user"],
      config: {
        ms: 1000,
      },
    },
    {
      id: "normalize-account",
      type: "script",
      dependsOn: ["fetch-account"],
      config: {
        script: "return { normalized: true };",
      },
    },
    {
      id: "transform-user",
      type: "script",
      dependsOn: ["wait-before-processing", "normalize-account"],
      config: {
        script: "return { processed: true };",
      },
    },
  ],
};

export const invalidWorkflowExample: WorkflowDefinition = {
  steps: [
    {
      id: "fetch-user",
      type: "http",
      dependsOn: ["transform-user"],
      config: {
        method: "GET",
        url: "https://api.example.com/users/123",
      },
    },
    {
      id: "transform-user",
      type: "script",
      dependsOn: ["missing-step"],
      config: {
        script: "return input;",
      },
    },
  ],
};

export const validWorkflowExecutionOrderExample = [
  "fetch-user",
  "fetch-account",
  "wait-before-processing",
  "normalize-account",
  "transform-user",
];

export const validWorkflowParallelGroupsExample = [
  ["fetch-user", "fetch-account"],
  ["wait-before-processing", "normalize-account"],
  ["transform-user"],
];

export const retryWorkflowExample: WorkflowDefinition = {
  steps: [
    {
      id: "fetch-orders",
      type: "http",
      dependsOn: [],
      config: {
        method: "GET",
        url: "https://api.example.com/orders",
        latencyMs: 50,
        failUntilAttempt: 1,
      },
    },
    {
      id: "pause",
      type: "delay",
      dependsOn: ["fetch-orders"],
      config: {
        ms: 25,
      },
    },
    {
      id: "summarize-orders",
      type: "script",
      dependsOn: ["pause"],
      config: {
        scriptName: "summarize-orders",
        result: "summary-ready",
      },
    },
  ],
};

export const retryWorkflowExecutionFlowExample = {
  mode: "parallel",
  orderedStepIds: ["fetch-orders", "pause", "summarize-orders"],
  parallelGroups: [["fetch-orders"], ["pause"], ["summarize-orders"]],
  notableEvents: [
    "fetch-orders fails on attempt 1",
    "engine waits for exponential backoff",
    "fetch-orders succeeds on attempt 2",
    "pause runs after fetch-orders succeeds",
    "summarize-orders runs last",
  ],
};
