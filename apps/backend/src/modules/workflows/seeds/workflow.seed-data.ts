import type { WorkflowDefinition, WorkflowExecutionResult } from "../types/workflow.types";

export type SeedWorkflowRecord = {
  workflowId: string;
  workflowVersionId: string;
  workflowRunId: string;
  tenantId: string;
  createdByUserId: string;
  name: string;
  key: string;
  description: string;
  status: "draft" | "active";
  executionMode: "sequential" | "parallel";
  definition: WorkflowDefinition;
  runResult: WorkflowExecutionResult;
};

export const seedWorkflowRecords: SeedWorkflowRecord[] = [
  {
    workflowId: "11111111-1111-1111-1111-111111111111",
    workflowVersionId: "11111111-1111-1111-1111-111111111112",
    workflowRunId: "11111111-1111-1111-1111-111111111113",
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdByUserId: "00000000-0000-0000-0000-000000000101",
    name: "Lead Enrichment Pipeline",
    key: "lead-enrichment-pipeline",
    description: "Sample active workflow for onboarding and enrichment.",
    status: "active",
    executionMode: "parallel",
    definition: {
      steps: [
        {
          id: "fetch-lead",
          type: "http",
          dependsOn: [],
          config: {
            method: "GET",
            url: "https://api.example.com/leads/42",
          },
        },
        {
          id: "wait-for-score",
          type: "delay",
          dependsOn: ["fetch-lead"],
          config: {
            ms: 250,
          },
        },
        {
          id: "normalize-lead",
          type: "script",
          dependsOn: ["wait-for-score"],
          config: {
            scriptName: "normalize-lead",
            result: "lead-normalized",
          },
        },
      ],
    },
    runResult: {
      mode: "parallel",
      orderedStepIds: ["fetch-lead", "wait-for-score", "normalize-lead"],
      parallelGroups: [["fetch-lead"], ["wait-for-score"], ["normalize-lead"]],
      stepStates: {
        "fetch-lead": {
          stepId: "fetch-lead",
          status: "success",
          attempts: 1,
        },
        "wait-for-score": {
          stepId: "wait-for-score",
          status: "success",
          attempts: 1,
        },
        "normalize-lead": {
          stepId: "normalize-lead",
          status: "success",
          attempts: 1,
        },
      },
      outputs: {
        "fetch-lead": {
          leadId: "lead-42",
          email: "lead@example.com",
        },
        "wait-for-score": {
          waitedMs: 250,
        },
        "normalize-lead": {
          normalized: true,
          score: 91,
        },
      },
    },
  },
  {
    workflowId: "22222222-2222-2222-2222-222222222221",
    workflowVersionId: "22222222-2222-2222-2222-222222222222",
    workflowRunId: "22222222-2222-2222-2222-222222222223",
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdByUserId: "00000000-0000-0000-0000-000000000101",
    name: "Customer Welcome Flow",
    key: "customer-welcome-flow",
    description: "Draft workflow example for testing the editor experience.",
    status: "draft",
    executionMode: "sequential",
    definition: {
      steps: [
        {
          id: "fetch-customer",
          type: "http",
          dependsOn: [],
          config: {
            method: "GET",
            url: "https://api.example.com/customers/7",
          },
        },
        {
          id: "compose-message",
          type: "script",
          dependsOn: ["fetch-customer"],
          config: {
            scriptName: "compose-message",
            template: "welcome-customer",
          },
        },
      ],
    },
    runResult: {
      mode: "sequential",
      orderedStepIds: ["fetch-customer", "compose-message"],
      parallelGroups: [["fetch-customer"], ["compose-message"]],
      stepStates: {
        "fetch-customer": {
          stepId: "fetch-customer",
          status: "success",
          attempts: 1,
        },
        "compose-message": {
          stepId: "compose-message",
          status: "success",
          attempts: 1,
        },
      },
      outputs: {
        "fetch-customer": {
          customerId: "customer-7",
          locale: "id-ID",
        },
        "compose-message": {
          subject: "Welcome aboard",
          preview: "Terima kasih sudah bergabung.",
        },
      },
    },
  },
];
