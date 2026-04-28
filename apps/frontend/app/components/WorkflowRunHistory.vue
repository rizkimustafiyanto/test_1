<script setup lang="ts">
import BaseBadge from '../../../../packages/ui/components/base/badge/index.vue'
import BaseButton from '../../../../packages/ui/components/base/button/index.vue'
import BaseCard from '../../../../packages/ui/components/base/card/index.vue'
import BaseLoadingSpinner from '../../../../packages/ui/components/base/loading-spinner/index.vue'
import type { WorkflowRunRecord } from '../types/workflow'

defineProps<{
  runs: WorkflowRunRecord[]
  loading?: boolean
  getStatusBadge: (status: string) => { variantText: string, variantBGColor: string }
  formatDateTime: (value?: string | null) => string
}>()

const emit = defineEmits<{
  refresh: []
  openRun: [runId: string]
}>()
</script>

<template>
  <BaseCard size="lg" variant="secondary" class-override="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">Run History</h2>
        <p class="text-sm text-slate-500">Buka run monitor khusus untuk melihat detail step dan event live.</p>
      </div>
      <BaseButton label="Refresh Runs" variant="secondary" size="sm" :loading="loading" @click="emit('refresh')" />
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <BaseLoadingSpinner type="mini" message="Memuat run history..." />
    </div>

    <div v-else-if="!runs.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      Belum ada run untuk workflow ini.
    </div>

    <div v-else class="grid gap-3 lg:grid-cols-2">
      <button
        v-for="run in runs"
        :key="run.id"
        type="button"
        class="rounded-3xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300"
        @click="emit('openRun', run.id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-900">{{ run.id }}</p>
            <p class="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{{ run.mode || 'parallel' }} mode</p>
          </div>
          <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge(run.status)">
            {{ run.status }}
          </BaseBadge>
        </div>

        <div class="mt-4 grid gap-2 text-sm text-slate-600">
          <p><span class="font-medium text-slate-800">Started:</span> {{ formatDateTime(run.startedAt) }}</p>
          <p><span class="font-medium text-slate-800">Finished:</span> {{ formatDateTime(run.finishedAt) }}</p>
        </div>

        <p class="mt-4 text-xs font-semibold text-slate-900">Open run monitor</p>
      </button>
    </div>
  </BaseCard>
</template>
