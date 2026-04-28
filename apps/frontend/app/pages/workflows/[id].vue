<script setup lang="ts">
import BaseButton from '../../../../../packages/ui/components/base/button/index.vue'
import BaseCard from '../../../../../packages/ui/components/base/card/index.vue'
import BaseLoadingSpinner from '../../../../../packages/ui/components/base/loading-spinner/index.vue'
import WorkflowDagView from '../../components/WorkflowDagView.vue'
import WorkflowPageShell from '../../components/WorkflowPageShell.vue'
import WorkflowRunHistory from '../../components/WorkflowRunHistory.vue'
import WorkflowRunTimeline from '../../components/WorkflowRunTimeline.vue'
import WorkflowSummaryStats from '../../components/WorkflowSummaryStats.vue'
import WorkflowTokenPanel from '../../components/WorkflowTokenPanel.vue'
import WorkflowTopPanel from '../../components/WorkflowTopPanel.vue'
const route = useRoute()
const router = useRouter()
const workflowId = computed(() => String(route.params.id || ''))
const {
  token,
  selectedWorkflow,
  workflowRuns,
  triggerInput,
  apiError,
  loading,
  dagLayout,
  selectedWorkflowSteps,
  workflowSummaryStats,
  recentRunTimeline,
  dashboardStore,
  loadWorkflows,
  loadWorkflowDetail,
  loadWorkflowRuns,
  triggerWorkflow,
  selectRun,
  getStatusBadge,
  formatAverageDuration,
  formatDateTime,
} = useWorkflowDashboard()

async function hydrateWorkflowPage() {
  if (!workflowId.value) {
    return
  }

  if (!selectedWorkflow.value || selectedWorkflow.value.id !== workflowId.value) {
    await loadWorkflowDetail(workflowId.value)
  }

  await loadWorkflowRuns(workflowId.value)
}

async function openRun(runId: string) {
  selectRun(runId)
  await router.push(`/runs/${runId}`)
}

async function runAndOpenMonitor() {
  const run = await triggerWorkflow()

  if (run) {
    await router.push(`/runs/${run.id}`)
  }
}

onMounted(async () => {
  if (token.value.trim()) {
    await loadWorkflows()
  }

  await hydrateWorkflowPage()
})

watch(workflowId, async () => {
  await hydrateWorkflowPage()
})

watch(token, async (value, previousValue) => {
  if (!value.trim() || value === previousValue) {
    return
  }

  await hydrateWorkflowPage()
})
</script>

<template>
  <WorkflowPageShell
    title="Workflow Detail"
    description="Detail workflow, ringkasan performa, visual DAG, trigger manual, dan riwayat run ada di halaman ini."
  >
    <WorkflowTopPanel
      title="Workflow Detail"
      description="Detail workflow, ringkasan performa, visual DAG, trigger manual, dan riwayat run ada di halaman ini."
    >
      <template #actions>
        <NuxtLink to="/workflows" class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
          Back to list
        </NuxtLink>
      </template>

      <WorkflowTokenPanel
        :token="token"
        primary-label="Refresh Detail"
        :primary-loading="loading.workflowDetail"
        :error-message="apiError"
        :get-status-badge="getStatusBadge"
        @update-token="dashboardStore.setToken"
        @primary="hydrateWorkflowPage"
      />
    </WorkflowTopPanel>

    <div v-if="loading.workflowDetail && !selectedWorkflow" class="flex justify-center py-16">
      <BaseLoadingSpinner type="mini" message="Memuat detail workflow..." />
    </div>

    <template v-else-if="selectedWorkflow">
      <WorkflowSummaryStats
        :stats="workflowSummaryStats"
        :format-average-duration="formatAverageDuration"
        :format-date-time="formatDateTime"
      />

      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <BaseCard size="lg" variant="secondary" class-override="space-y-5">
          <div class="space-y-3">
            <div>
              <h2 class="text-2xl font-semibold">{{ selectedWorkflow.name }}</h2>
              <p class="text-sm text-slate-600">{{ selectedWorkflow.description || 'Tanpa deskripsi workflow.' }}</p>
            </div>

            <div class="grid gap-2 text-sm text-slate-600">
              <p><span class="font-medium text-slate-800">Workflow ID:</span> {{ selectedWorkflow.id }}</p>
              <p><span class="font-medium text-slate-800">Version ID:</span> {{ selectedWorkflow.workflowVersionId }}</p>
              <p><span class="font-medium text-slate-800">Updated:</span> {{ formatDateTime(selectedWorkflow.updatedAt) }}</p>
            </div>
          </div>

          <WorkflowDagView
            :dag-layout="dagLayout"
            :step-count="selectedWorkflowSteps.length"
            marker-id="dag-arrow-detail"
            :get-status-badge="getStatusBadge"
          />
        </BaseCard>

        <BaseCard size="lg" variant="secondary" class-override="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Trigger Workflow</h2>
            <BaseButton label="Run and Open Monitor" variant="primary" size="sm" :loading="loading.trigger" @click="runAndOpenMonitor" />
          </div>

          <textarea
            :value="triggerInput"
            rows="12"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-xs text-slate-900 outline-none transition focus:border-slate-400"
            @input="triggerInput = ($event.target as HTMLTextAreaElement).value"
          />

          <WorkflowRunTimeline
            :runs="recentRunTimeline"
            :get-status-badge="getStatusBadge"
            :format-date-time="formatDateTime"
          />
        </BaseCard>
      </div>

      <WorkflowRunHistory
        :runs="workflowRuns"
        :loading="loading.runs"
        :get-status-badge="getStatusBadge"
        :format-date-time="formatDateTime"
        @refresh="loadWorkflowRuns(workflowId)"
        @open-run="openRun"
      />
    </template>
  </WorkflowPageShell>
</template>
