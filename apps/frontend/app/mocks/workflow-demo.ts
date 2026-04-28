import type { WorkflowRecord, WorkflowRunRecord } from '../types/workflow'

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000101'

export const demoWorkflows: WorkflowRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    tenantId: DEMO_TENANT_ID,
    key: 'lead-enrichment-pipeline',
    workflowVersionId: '11111111-1111-1111-1111-111111111112',
    latestVersionId: '11111111-1111-1111-1111-111111111112',
    name: 'Lead Enrichment Pipeline',
    description: 'Sample active workflow for onboarding and enrichment.',
    definition: {
      steps: [
        {
          id: 'fetch-lead',
          type: 'http',
          dependsOn: [],
          config: {
            method: 'GET',
            url: 'https://api.example.com/leads/42',
          },
        },
        {
          id: 'wait-for-score',
          type: 'delay',
          dependsOn: ['fetch-lead'],
          config: {
            ms: 250,
          },
        },
        {
          id: 'normalize-lead',
          type: 'script',
          dependsOn: ['wait-for-score'],
          config: {
            scriptName: 'normalize-lead',
            result: 'lead-normalized',
          },
        },
      ],
    },
    createdByUserId: DEMO_USER_ID,
    createdAt: '2026-04-27T09:09:30.456Z',
    updatedAt: '2026-04-27T09:09:30.657Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222221',
    tenantId: DEMO_TENANT_ID,
    key: 'customer-welcome-flow',
    workflowVersionId: '22222222-2222-2222-2222-222222222222',
    latestVersionId: '22222222-2222-2222-2222-222222222222',
    name: 'Customer Welcome Flow',
    description: 'Draft workflow example for testing the editor experience.',
    definition: {
      steps: [
        {
          id: 'fetch-customer',
          type: 'http',
          dependsOn: [],
          config: {
            method: 'GET',
            url: 'https://api.example.com/customers/7',
          },
        },
        {
          id: 'compose-message',
          type: 'script',
          dependsOn: ['fetch-customer'],
          config: {
            scriptName: 'compose-message',
            template: 'welcome-customer',
          },
        },
      ],
    },
    createdByUserId: DEMO_USER_ID,
    createdAt: '2026-04-27T09:09:30.690Z',
    updatedAt: '2026-04-27T09:09:30.822Z',
  },
]

export const demoWorkflowRuns: WorkflowRunRecord[] = [
  {
    id: '11111111-1111-1111-1111-111111111113',
    workflowId: '11111111-1111-1111-1111-111111111111',
    workflowVersionId: '11111111-1111-1111-1111-111111111112',
    tenantId: DEMO_TENANT_ID,
    triggeredByUserId: DEMO_USER_ID,
    status: 'success',
    mode: 'parallel',
    input: {},
    createdAt: '2026-01-01T09:00:00.000Z',
    startedAt: '2026-01-01T09:00:00.000Z',
    finishedAt: '2026-01-01T09:05:00.000Z',
    stepRuns: [
      {
        id: '11111111-1111-1111-1111-111111111201',
        workflowRunId: '11111111-1111-1111-1111-111111111113',
        tenantId: DEMO_TENANT_ID,
        stepId: 'fetch-lead',
        stepType: 'http',
        status: 'success',
        attempt: 1,
        output: {
          leadId: 'lead-42',
          email: 'lead@example.com',
        },
        startedAt: '2026-01-01T09:00:00.000Z',
        finishedAt: '2026-01-01T09:00:20.000Z',
        createdAt: '2026-01-01T09:00:00.000Z',
        updatedAt: '2026-01-01T09:00:20.000Z',
      },
      {
        id: '11111111-1111-1111-1111-111111111202',
        workflowRunId: '11111111-1111-1111-1111-111111111113',
        tenantId: DEMO_TENANT_ID,
        stepId: 'wait-for-score',
        stepType: 'delay',
        status: 'success',
        attempt: 1,
        output: {
          waitedMs: 250,
        },
        startedAt: '2026-01-01T09:01:00.000Z',
        finishedAt: '2026-01-01T09:01:20.000Z',
        createdAt: '2026-01-01T09:01:00.000Z',
        updatedAt: '2026-01-01T09:01:20.000Z',
      },
      {
        id: '11111111-1111-1111-1111-111111111203',
        workflowRunId: '11111111-1111-1111-1111-111111111113',
        tenantId: DEMO_TENANT_ID,
        stepId: 'normalize-lead',
        stepType: 'script',
        status: 'success',
        attempt: 1,
        output: {
          normalized: true,
          score: 91,
        },
        startedAt: '2026-01-01T09:02:00.000Z',
        finishedAt: '2026-01-01T09:02:20.000Z',
        createdAt: '2026-01-01T09:02:00.000Z',
        updatedAt: '2026-01-01T09:02:20.000Z',
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    workflowId: '22222222-2222-2222-2222-222222222221',
    workflowVersionId: '22222222-2222-2222-2222-222222222222',
    tenantId: DEMO_TENANT_ID,
    triggeredByUserId: DEMO_USER_ID,
    status: 'success',
    mode: 'sequential',
    input: {},
    createdAt: '2026-01-01T09:00:00.000Z',
    startedAt: '2026-01-01T09:00:00.000Z',
    finishedAt: '2026-01-01T09:05:00.000Z',
    stepRuns: [
      {
        id: '22222222-2222-2222-2222-222222222201',
        workflowRunId: '22222222-2222-2222-2222-222222222223',
        tenantId: DEMO_TENANT_ID,
        stepId: 'fetch-customer',
        stepType: 'http',
        status: 'success',
        attempt: 1,
        output: {
          customerId: 'customer-7',
          locale: 'id-ID',
        },
        startedAt: '2026-01-01T09:00:00.000Z',
        finishedAt: '2026-01-01T09:00:20.000Z',
        createdAt: '2026-01-01T09:00:00.000Z',
        updatedAt: '2026-01-01T09:00:20.000Z',
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        workflowRunId: '22222222-2222-2222-2222-222222222223',
        tenantId: DEMO_TENANT_ID,
        stepId: 'compose-message',
        stepType: 'script',
        status: 'success',
        attempt: 1,
        output: {
          subject: 'Welcome aboard',
          preview: 'Terima kasih sudah bergabung.',
        },
        startedAt: '2026-01-01T09:01:00.000Z',
        finishedAt: '2026-01-01T09:01:20.000Z',
        createdAt: '2026-01-01T09:01:00.000Z',
        updatedAt: '2026-01-01T09:01:20.000Z',
      },
    ],
  },
]

export function cloneDemoWorkflows() {
  return structuredClone(demoWorkflows)
}

export function cloneDemoWorkflowRuns(workflowId?: string) {
  const runs = workflowId
    ? demoWorkflowRuns.filter(run => run.workflowId === workflowId)
    : demoWorkflowRuns

  return structuredClone(runs)
}

export function findDemoWorkflow(workflowId: string) {
  return structuredClone(demoWorkflows.find(workflow => workflow.id === workflowId) ?? null)
}

export function findDemoRun(runId: string) {
  return structuredClone(demoWorkflowRuns.find(run => run.id === runId) ?? null)
}
