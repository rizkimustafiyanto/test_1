import { storeToRefs } from 'pinia'
import { FetchError } from 'ofetch'
import type { WorkflowRecord, WorkflowRunRecord } from '../types/workflow'
import { useWorkflowDashboardStore } from '../stores/workflow-dashboard'

const WORKFLOW_DASHBOARD_TOKEN_STORAGE_KEY = 'workflow-dashboard-token'

export function useWorkflowDashboard() {
  const config = useRuntimeConfig()
  const dashboardStore = useWorkflowDashboardStore()
  const {
    token,
    workflows,
    selectedWorkflowId,
    selectedWorkflow,
    workflowRuns,
    selectedRunId,
    selectedRun,
    triggerInput,
    apiError,
    debugMessage,
    loading,
  } = storeToRefs(dashboardStore)

  const {
    connect,
    disconnect,
    events,
    isConnected,
    errorMessage: socketError,
  } = useWorkflowRunEvents()

  const sortedEvents = computed(() => [...events.value].reverse())
  const selectedWorkflowSteps = computed(() => dashboardStore.selectedWorkflowSteps)
  const workflowSummaryStats = computed(() => {
    const runs = workflowRuns.value
    const totalRuns = runs.length
    const successRuns = runs.filter(run => run.status === 'success').length
    const failedRuns = runs.filter(run => run.status === 'failed').length
    const runningRuns = runs.filter(run => run.status === 'running').length
    const completedRuns = runs.filter(run => run.finishedAt && run.startedAt)
    const averageDurationMs = completedRuns.length
      ? completedRuns.reduce((total, run) => {
        return total + (new Date(run.finishedAt as string).getTime() - new Date(run.startedAt).getTime())
      }, 0) / completedRuns.length
      : 0

    return {
      totalRuns,
      successRuns,
      failedRuns,
      runningRuns,
      successRate: totalRuns ? Math.round((successRuns / totalRuns) * 100) : 0,
      averageDurationMs: Number.isFinite(averageDurationMs) ? Math.max(0, averageDurationMs) : 0,
      latestRunAt: runs[0]?.startedAt ?? null,
    }
  })

  const recentRunTimeline = computed(() => {
    return workflowRuns.value
      .slice(0, 6)
      .map(run => ({
        id: run.id,
        status: run.status,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        mode: run.mode || 'parallel',
        duration: formatDuration(run.startedAt, run.finishedAt),
      }))
  })

  const dagLayout = computed(() => {
    const steps = selectedWorkflowSteps.value

    if (!steps.length) {
      return {
        width: 0,
        height: 0,
        nodes: [] as Array<{
          id: string
          type: string
          dependsOn: string[]
          x: number
          y: number
          width: number
          height: number
        }>,
        edges: [] as Array<{
          id: string
          x1: number
          y1: number
          x2: number
          y2: number
        }>,
      }
    }

    const stepMap = new Map(steps.map(step => [step.id, step]))
    const levelCache = new Map<string, number>()

    function getLevel(stepId: string, trail = new Set<string>()): number {
      if (levelCache.has(stepId)) {
        return levelCache.get(stepId) as number
      }

      if (trail.has(stepId)) {
        return 0
      }

      const step = stepMap.get(stepId)

      if (!step || !step.dependsOn.length) {
        levelCache.set(stepId, 0)
        return 0
      }

      const nextTrail = new Set(trail)
      nextTrail.add(stepId)
      const level = Math.max(...step.dependsOn.map(dependsOnId => getLevel(dependsOnId, nextTrail))) + 1
      levelCache.set(stepId, level)
      return level
    }

    const columns = new Map<number, typeof steps>()

    for (const step of steps) {
      const level = getLevel(step.id)
      const columnSteps = columns.get(level) ?? []
      columnSteps.push(step)
      columns.set(level, columnSteps)
    }

    const sortedLevels = [...columns.keys()].sort((a, b) => a - b)
    const horizontalGap = 260
    const verticalGap = 150
    const nodeWidth = 200
    const nodeHeight = 84
    const padding = 32

    const nodes = sortedLevels.flatMap((level, columnIndex) => {
      const columnSteps = columns.get(level) ?? []

      return columnSteps.map((step, rowIndex) => ({
        id: step.id,
        type: step.type,
        dependsOn: step.dependsOn,
        x: padding + (columnIndex * horizontalGap),
        y: padding + (rowIndex * verticalGap),
        width: nodeWidth,
        height: nodeHeight,
      }))
    })

    const nodeMap = new Map(nodes.map(node => [node.id, node]))
    const edges = nodes.flatMap((node) => {
      return node.dependsOn.flatMap((dependencyId) => {
        const source = nodeMap.get(dependencyId)

        if (!source) {
          return []
        }

        return [{
          id: `${dependencyId}->${node.id}`,
          x1: source.x + source.width,
          y1: source.y + (source.height / 2),
          x2: node.x,
          y2: node.y + (node.height / 2),
        }]
      })
    })

    const columnHeights = [...columns.values()].map(columnSteps => columnSteps.length)

    return {
      width: padding * 2 + ((sortedLevels.length - 1) * horizontalGap) + nodeWidth,
      height: padding * 2 + ((Math.max(...columnHeights) - 1) * verticalGap) + nodeHeight,
      nodes,
      edges,
    }
  })

  function normalizeTokenValue(value: string) {
    const trimmed = value.trim()

    if (!trimmed) {
      return ''
    }

    return trimmed.replace(/^Bearer\s+/i, '')
  }

  function buildHeaders() {
    return {
      Authorization: `Bearer ${normalizeTokenValue(token.value)}`,
    }
  }

  function getApiErrorMessage(error: unknown, fallback: string) {
    if (error instanceof FetchError) {
      const responseMessage
        = typeof error.data === 'object'
          && error.data
          && 'message' in error.data
          && typeof error.data.message === 'string'
          ? error.data.message
          : null

      return responseMessage ?? error.message ?? fallback
    }

    return error instanceof Error ? error.message : fallback
  }

  function decodeJwtPayload(rawToken: string) {
    const normalizedToken = normalizeTokenValue(rawToken)

    try {
      const [, payload] = normalizedToken.split('.')

      if (!payload) {
        return null
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
      return JSON.parse(atob(paddedPayload)) as { tenantId?: string, sub?: string, role?: string }
    } catch {
      return null
    }
  }

  function createSeedJwt() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAxMDEiLCJ0ZW5hbnRJZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDAwMDAwMCwiZXhwIjoxODkzNDU2MDAwfQ.I0r2tlD127zkouVBkO5iY0SD3q3SmjnMRz1uYw-QYMA'
  }

  async function apiGet<T>(path: string): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}${path}`, {
      headers: buildHeaders(),
    })
  }

  async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
    return $fetch<T>(`${config.public.apiBase}${path}`, {
      method: 'POST',
      headers: {
        ...buildHeaders(),
        'Content-Type': 'application/json',
      },
      body,
    })
  }

  function resetDashboardState() {
    dashboardStore.resetDashboardState()
    disconnect()
  }

  async function loadWorkflows() {
    const payload = decodeJwtPayload(token.value)
    const startMessage = `Load workflows dipanggil. apiBase=${config.public.apiBase}. tenantId=${payload?.tenantId ?? 'tidak terbaca'}.`
    console.log('[useWorkflowDashboard] loadWorkflows called', {
      apiBase: config.public.apiBase,
      hasToken: Boolean(normalizeTokenValue(token.value)),
      selectedWorkflowId: selectedWorkflowId.value,
      tenantId: payload?.tenantId ?? null,
    })
    dashboardStore.setDebugMessage(startMessage)

    if (!normalizeTokenValue(token.value)) {
      console.warn('[useWorkflowDashboard] loadWorkflows aborted: missing token')
      dashboardStore.setDebugMessage('Load workflows dibatalkan karena token kosong.')
      dashboardStore.setApiError('JWT token wajib diisi.')
      return [] as WorkflowRecord[]
    }

    dashboardStore.setApiError(null)
    dashboardStore.setLoading('workflows', true)

    try {
      const response = await apiGet<WorkflowRecord[]>('/workflows')
      console.log('[useWorkflowDashboard] loadWorkflows success', {
        count: response.length,
      })
      dashboardStore.setDebugMessage(`Load workflows berhasil. Dapat ${response.length} workflow.`)
      dashboardStore.setWorkflows(response)

      if (selectedWorkflowId.value && !response.some(workflow => workflow.id === selectedWorkflowId.value)) {
        dashboardStore.setSelectedWorkflow(null)
      }

      return response
    } catch (error) {
      console.error('[useWorkflowDashboard] loadWorkflows failed', error)
      resetDashboardState()
      dashboardStore.setDebugMessage(`Load workflows gagal: ${getApiErrorMessage(error, 'Gagal memuat workflows.')}`)
      dashboardStore.setApiError(getApiErrorMessage(error, 'Gagal memuat workflows.'))
      return []
    } finally {
      dashboardStore.setLoading('workflows', false)
    }
  }

  async function loadWorkflowDetail(workflowId = selectedWorkflowId.value) {
    if (!workflowId) {
      return null
    }

    dashboardStore.setApiError(null)
    dashboardStore.setLoading('workflowDetail', true)

    try {
      const workflow = await apiGet<WorkflowRecord>(`/workflows/${workflowId}`)
      dashboardStore.setSelectedWorkflow(workflow)
      return workflow
    } catch (error) {
      dashboardStore.setApiError(getApiErrorMessage(error, 'Gagal memuat detail workflow.'))
      return null
    } finally {
      dashboardStore.setLoading('workflowDetail', false)
    }
  }

  async function loadWorkflowRuns(workflowId = selectedWorkflowId.value) {
    if (!workflowId) {
      return [] as WorkflowRunRecord[]
    }

    dashboardStore.setLoading('runs', true)

    try {
      const runs = await apiGet<WorkflowRunRecord[]>(`/workflows/${workflowId}/runs`)
      dashboardStore.setWorkflowRuns(runs)

      if (runs.length > 0) {
        const preferredRun = runs.find(run => run.id === selectedRunId.value) ?? runs[0]
        dashboardStore.setSelectedRun(preferredRun)
      } else {
        dashboardStore.setSelectedRun(null)
      }

      return runs
    } catch (error) {
      dashboardStore.setApiError(getApiErrorMessage(error, 'Gagal memuat run history.'))
      return []
    } finally {
      dashboardStore.setLoading('runs', false)
    }
  }

  async function loadRunDetail(runId = selectedRunId.value) {
    if (!runId) {
      return null
    }

    try {
      const run = await apiGet<WorkflowRunRecord>(`/runs/${runId}`)
      dashboardStore.patchRun(run)
      dashboardStore.setSelectedRun(run)
      return run
    } catch (error) {
      dashboardStore.setApiError(getApiErrorMessage(error, 'Gagal memuat run detail.'))
      return null
    }
  }

  async function triggerWorkflow() {
    if (!selectedWorkflowId.value) {
      dashboardStore.setApiError('Pilih workflow terlebih dulu.')
      return null
    }

    let parsedBody: Record<string, unknown>

    try {
      parsedBody = JSON.parse(triggerInput.value) as Record<string, unknown>
    } catch {
      dashboardStore.setApiError('Payload trigger harus berupa JSON yang valid.')
      return null
    }

    dashboardStore.setLoading('trigger', true)
    dashboardStore.setApiError(null)

    try {
      const run = await apiPost<WorkflowRunRecord>(`/workflows/${selectedWorkflowId.value}/trigger`, parsedBody)
      dashboardStore.setSelectedRun(run)
      connect(run.id, normalizeTokenValue(token.value))
      await loadWorkflowRuns(selectedWorkflowId.value)
      await loadRunDetail(run.id)
      return run
    } catch (error) {
      dashboardStore.setApiError(getApiErrorMessage(error, 'Gagal menjalankan workflow.'))
      return null
    } finally {
      dashboardStore.setLoading('trigger', false)
    }
  }

  function selectWorkflow(workflowId: string) {
    dashboardStore.setSelectedWorkflow(
      workflows.value.find(workflow => workflow.id === workflowId) ?? null,
    )
  }

  function selectRun(runId: string) {
    dashboardStore.setSelectedRun(
      workflowRuns.value.find(run => run.id === runId) ?? null,
    )
    disconnect()

    if (runId) {
      connect(runId, normalizeTokenValue(token.value))
      void loadRunDetail(runId)
    }
  }

  function getStatusBadge(status: string) {
    if (status === 'success' || status === 'step_completed') {
      return { variantText: 'success', variantBGColor: 'success' } as const
    }

    if (status === 'failed' || status === 'step_failed') {
      return { variantText: 'danger', variantBGColor: 'danger' } as const
    }

    if (status === 'running' || status === 'step_started') {
      return { variantText: 'mist', variantBGColor: 'mist' } as const
    }

    return { variantText: 'warning', variantBGColor: 'warning' } as const
  }

  function formatDuration(startedAt?: string, finishedAt?: string) {
    if (!startedAt || !finishedAt) {
      return '-'
    }

    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime()

    if (Number.isNaN(durationMs) || durationMs < 0) {
      return '-'
    }

    return `${(durationMs / 1000).toFixed(2)}s`
  }

  function formatAverageDuration(durationMs: number) {
    if (!durationMs) {
      return '-'
    }

    return `${(durationMs / 1000).toFixed(2)}s`
  }

  function formatDateTime(value?: string | null) {
    if (!value) {
      return '-'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  watch(
    () => sortedEvents.value[0],
    (latestEvent) => {
      if (!latestEvent || !selectedRun.value || latestEvent.runId !== selectedRun.value.id) {
        return
      }

      void loadRunDetail(selectedRun.value.id)
    },
  )

  if (import.meta.client) {
    onMounted(() => {
      const savedToken = window.localStorage.getItem(WORKFLOW_DASHBOARD_TOKEN_STORAGE_KEY)

      if (savedToken && !token.value.trim()) {
        dashboardStore.setToken(savedToken)
      }
    })

    watch(token, (value) => {
      const normalizedValue = value.trim()

      if (normalizedValue) {
        window.localStorage.setItem(WORKFLOW_DASHBOARD_TOKEN_STORAGE_KEY, value)
        return
      }

      window.localStorage.removeItem(WORKFLOW_DASHBOARD_TOKEN_STORAGE_KEY)
    }, { immediate: true })
  }

  return {
    token,
    workflows,
    selectedWorkflowId,
    selectedWorkflow,
    workflowRuns,
    selectedRunId,
    selectedRun,
    triggerInput,
    apiError,
    debugMessage,
    loading,
    sortedEvents,
    selectedWorkflowSteps,
    workflowSummaryStats,
    recentRunTimeline,
    dagLayout,
    isConnected,
    socketError,
    connect,
    disconnect,
    dashboardStore,
    resetDashboardState,
    loadWorkflows,
    loadWorkflowDetail,
    loadWorkflowRuns,
    loadRunDetail,
    triggerWorkflow,
    selectWorkflow,
    selectRun,
    getStatusBadge,
    formatDuration,
    formatAverageDuration,
    formatDateTime,
    normalizeTokenValue,
    decodeJwtPayload,
    createSeedJwt,
  }
}
