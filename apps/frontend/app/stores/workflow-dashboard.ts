import { defineStore } from 'pinia'
import type { WorkflowRecord, WorkflowRunRecord } from '../types/workflow'

type LoadingState = {
  workflows: boolean
  workflowDetail: boolean
  runs: boolean
  trigger: boolean
}

export const useWorkflowDashboardStore = defineStore('workflow-dashboard', {
  state: () => ({
    token: '',
    workflows: [] as WorkflowRecord[],
    selectedWorkflowId: '',
    selectedWorkflow: null as WorkflowRecord | null,
    workflowRuns: [] as WorkflowRunRecord[],
    selectedRunId: '',
    selectedRun: null as WorkflowRunRecord | null,
    triggerInput: '{\n  "input": {}\n}',
    apiError: null as string | null,
    debugMessage: '' as string,
    loading: {
      workflows: false,
      workflowDetail: false,
      runs: false,
      trigger: false,
    } as LoadingState,
  }),
  getters: {
    hasToken: (state) => state.token.trim().length > 0,
    selectedWorkflowSteps: (state) => state.selectedWorkflow?.definition.steps ?? [],
  },
  actions: {
    resetDashboardState() {
      this.workflows = []
      this.selectedWorkflowId = ''
      this.selectedWorkflow = null
      this.workflowRuns = []
      this.selectedRunId = ''
      this.selectedRun = null
    },
    setApiError(message: string | null) {
      this.apiError = message
    },
    setDebugMessage(message: string) {
      this.debugMessage = message
    },
    setToken(token: string) {
      this.token = token
    },
    setLoading(key: keyof LoadingState, value: boolean) {
      this.loading[key] = value
    },
    setWorkflows(workflows: WorkflowRecord[]) {
      this.workflows = workflows
    },
    setSelectedWorkflow(workflow: WorkflowRecord | null) {
      this.selectedWorkflow = workflow
      this.selectedWorkflowId = workflow?.id ?? ''
    },
    setWorkflowRuns(runs: WorkflowRunRecord[]) {
      this.workflowRuns = runs
    },
    setSelectedRun(run: WorkflowRunRecord | null) {
      this.selectedRun = run
      this.selectedRunId = run?.id ?? ''
    },
    patchRun(run: WorkflowRunRecord) {
      this.workflowRuns = this.workflowRuns.map(item => item.id === run.id ? run : item)
      if (this.selectedRunId === run.id) {
        this.selectedRun = run
      }
    },
  },
})
