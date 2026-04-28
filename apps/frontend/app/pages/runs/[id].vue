<script setup lang="ts">
import BaseBadge from '../../../../../packages/ui/components/base/badge/index.vue'
import BaseCard from '../../../../../packages/ui/components/base/card/index.vue'
import BaseLoadingSpinner from '../../../../../packages/ui/components/base/loading-spinner/index.vue'
import WorkflowLiveEvents from '../../components/WorkflowLiveEvents.vue'
import WorkflowPageShell from '../../components/WorkflowPageShell.vue'
import WorkflowStepRuns from '../../components/WorkflowStepRuns.vue'
import WorkflowTokenPanel from '../../components/WorkflowTokenPanel.vue'
import WorkflowTopPanel from '../../components/WorkflowTopPanel.vue'
const route = useRoute()
const runId = computed(() => String(route.params.id || ''))
const {
  token,
  selectedRun,
  selectedWorkflow,
  sortedEvents,
  isConnected,
  socketError,
  apiError,
  dashboardStore,
  loadRunDetail,
  loadWorkflowDetail,
  loadWorkflowRuns,
  connect,
  disconnect,
  getStatusBadge,
  formatDuration,
  formatDateTime,
} = useWorkflowDashboard()

async function hydrateRunPage() {
  if (!runId.value) {
    return
  }

  const run = await loadRunDetail(runId.value)

  if (!run) {
    return
  }

  await loadWorkflowDetail(run.workflowId)
  await loadWorkflowRuns(run.workflowId)
  connect(run.id, token.value.trim())
}

onMounted(async () => {
  await hydrateRunPage()
})

watch(runId, async () => {
  disconnect()
  await hydrateRunPage()
})

onBeforeUnmount(() => {
  disconnect()
})
</script>

<template>
  <WorkflowPageShell
    title="Run Monitor"
    description="Halaman ini fokus ke satu run: status, step runs, payload, dan live event stream real-time."
  >
    <WorkflowTopPanel
      title="Run Monitor"
      description="Halaman ini fokus ke satu run: status, step runs, payload, dan live event stream real-time."
    >
      <template #actions>
        <NuxtLink
          v-if="selectedWorkflow"
          :to="`/workflows/${selectedWorkflow.id}`"
          class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          Back to workflow
        </NuxtLink>
      </template>

      <WorkflowTokenPanel
        :token="token"
        primary-label="Refresh Run"
        :connection-label="isConnected ? 'Live connected' : 'Live idle'"
        :is-connected="isConnected"
        :show-disconnect="true"
        :error-message="apiError || socketError"
        :get-status-badge="getStatusBadge"
        @update-token="dashboardStore.setToken"
        @primary="hydrateRunPage"
        @disconnect="disconnect"
      />
    </WorkflowTopPanel>

    <div v-if="!selectedRun" class="flex justify-center py-16">
      <BaseLoadingSpinner type="mini" message="Memuat run monitor..." />
    </div>

    <template v-else>
      <div class="grid gap-6 2xl:grid-cols-[1fr_1fr]">
        <BaseCard size="lg" variant="secondary" class-override="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold">Run Detail</h2>
              <p class="text-sm text-slate-500">Ringkasan status dan payload run yang dipilih.</p>
            </div>
            <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge(selectedRun.status)">
              {{ selectedRun.status }}
            </BaseBadge>
          </div>

          <BaseCard size="md" variant="mist" class-override="space-y-3">
            <div class="grid gap-2 text-sm text-slate-600">
              <p><span class="font-medium text-slate-800">Run ID:</span> {{ selectedRun.id }}</p>
              <p><span class="font-medium text-slate-800">Workflow ID:</span> {{ selectedRun.workflowId }}</p>
              <p><span class="font-medium text-slate-800">Started:</span> {{ formatDateTime(selectedRun.startedAt) }}</p>
              <p><span class="font-medium text-slate-800">Finished:</span> {{ formatDateTime(selectedRun.finishedAt) }}</p>
              <p><span class="font-medium text-slate-800">Duration:</span> {{ formatDuration(selectedRun.startedAt, selectedRun.finishedAt) }}</p>
            </div>

            <pre class="overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-xs text-slate-100">{{ JSON.stringify(selectedRun.input, null, 2) }}</pre>
          </BaseCard>

          <WorkflowStepRuns
            :step-runs="selectedRun.stepRuns"
            :get-status-badge="getStatusBadge"
            :format-duration="formatDuration"
            :format-date-time="formatDateTime"
          />
        </BaseCard>

        <WorkflowLiveEvents
          :events="sortedEvents"
          :is-connected="isConnected"
          :get-status-badge="getStatusBadge"
          :format-date-time="formatDateTime"
        />
      </div>
    </template>
  </WorkflowPageShell>
</template>
