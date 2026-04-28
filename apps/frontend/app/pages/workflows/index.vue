<script setup lang="ts">
import BaseBadge from '../../../../../packages/ui/components/base/badge/index.vue'
import BaseCard from '../../../../../packages/ui/components/base/card/index.vue'
import BaseLoadingSpinner from '../../../../../packages/ui/components/base/loading-spinner/index.vue'
import WorkflowPageShell from '../../components/WorkflowPageShell.vue'
import WorkflowTokenPanel from '../../components/WorkflowTokenPanel.vue'
import WorkflowTopPanel from '../../components/WorkflowTopPanel.vue'
const router = useRouter()
const {
  token,
  workflows,
  apiError,
  debugMessage,
  loading,
  dashboardStore,
  createSeedJwt,
  decodeJwtPayload,
  loadWorkflows,
  selectWorkflow,
  getStatusBadge,
} = useWorkflowDashboard()

const decodedToken = computed(() => decodeJwtPayload(token.value))

async function openWorkflow(workflowId: string) {
  selectWorkflow(workflowId)
  await router.push(`/workflows/${workflowId}`)
}

async function handleLoadWorkflows() {
  console.log('[WorkflowListPage] load workflows requested', {
    hasToken: Boolean(token.value.trim()),
    currentWorkflowCount: workflows.value.length,
    loading: loading.value.workflows,
  })
  dashboardStore.setDebugMessage('Tombol Load Workflows diklik.')
  await loadWorkflows()
}

function useSeedJwt() {
  const seedToken = createSeedJwt()
  dashboardStore.setToken(seedToken)
  dashboardStore.setDebugMessage('Seed JWT berhasil diisi. Klik tombol Load Workflows terpisah di bawah.')
  console.log('[WorkflowListPage] seed jwt inserted')
}

function handleUseSeedJwtClick() {
  console.log('[WorkflowListPage] Use Seed JWT button clicked')
  useSeedJwt()
}

async function handleLoadWorkflowsClick() {
  console.log('[WorkflowListPage] Load Workflows button clicked')
  await handleLoadWorkflows()
}

onMounted(async () => {
  if (token.value.trim() && !workflows.value.length) {
    await handleLoadWorkflows()
  }
})

watch(token, async (value, previousValue) => {
  if (!value.trim() || value === previousValue || workflows.value.length) {
    return
  }

  await handleLoadWorkflows()
})
</script>

<template>
  <WorkflowPageShell
    title="Workflow List"
    description="Mulai dari daftar workflow yang tersedia, lalu masuk ke halaman detail untuk trigger, DAG, history, dan monitoring."
  >
    <WorkflowTopPanel
      title="Workflow List"
      description="Mulai dari daftar workflow yang tersedia, lalu masuk ke halaman detail untuk trigger, DAG, history, dan monitoring."
    >
      <template #actions>
        <NuxtLink to="/workflows" class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Workflows
        </NuxtLink>
      </template>

      <WorkflowTokenPanel
        :token="token"
        :error-message="apiError"
        :debug-message="debugMessage"
        :get-status-badge="getStatusBadge"
        @update-token="dashboardStore.setToken"
      />

    </WorkflowTopPanel>

    <section class="relative z-20 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
      <div class="space-y-3">
        <h2 class="text-lg font-semibold text-slate-900">Cara Tes Frontend Ini</h2>
        <ol class="space-y-2 text-sm text-slate-600">
          <li>1. Klik <span class="font-semibold text-slate-900">Use Seed JWT</span> untuk mengisi token demo lokal.</li>
          <li>2. Klik <span class="font-semibold text-slate-900">Load Workflows</span> untuk mengambil data workflow dari backend.</li>
          <li>3. Klik salah satu card workflow untuk masuk ke halaman detail dan trigger run.</li>
        </ol>
        <p class="text-xs text-slate-500">
          Tenant seed lokal: <code>00000000-0000-0000-0000-000000000001</code>
        </p>
        <p v-if="decodedToken?.tenantId" class="text-xs text-slate-500">
          Tenant token aktif: <code>{{ decodedToken.tenantId }}</code>
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          class="relative z-30 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          @click="handleUseSeedJwtClick"
        >
          Use Seed JWT
        </button>
        <button
          type="button"
          class="relative z-30 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading.workflows"
          @click="handleLoadWorkflowsClick"
        >
          {{ loading.workflows ? 'Loading...' : 'Load Workflows' }}
        </button>
      </div>
    </section>

    <BaseCard size="lg" variant="secondary" class-override="space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold">Available Workflows</h2>
          <p class="text-sm text-slate-500">{{ workflows.length }} workflow tersedia</p>
        </div>
        <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge('pending')">
          persisted
        </BaseBadge>
      </div>

      <div v-if="loading.workflows" class="flex justify-center py-10">
        <BaseLoadingSpinner type="mini" message="Memuat workflows..." />
      </div>

      <div v-else-if="!workflows.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        Belum ada workflow yang bisa ditampilkan. Isi JWT token lalu klik Load Workflows.
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="workflow in workflows"
          :key="workflow.id"
          type="button"
          class="rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-slate-300"
          @click="openWorkflow(workflow.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ workflow.name }}</p>
              <p class="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{{ workflow.key || workflow.id }}</p>
            </div>
            <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {{ workflow.definition.steps.length }} steps
            </span>
          </div>

          <p class="mt-4 text-sm text-slate-600">
            {{ workflow.description || 'Tanpa deskripsi workflow.' }}
          </p>

          <div class="mt-5 flex items-center justify-between text-xs text-slate-500">
            <span>Updated {{ workflow.updatedAt }}</span>
            <span class="font-semibold text-slate-900">Open detail</span>
          </div>
        </button>
      </div>
    </BaseCard>
  </WorkflowPageShell>
</template>
