<script setup lang="ts">
import BaseCard from '../../../../packages/ui/components/base/card/index.vue'

defineProps<{
  stats: {
    totalRuns: number
    successRuns: number
    failedRuns: number
    runningRuns: number
    successRate: number
    averageDurationMs: number
    latestRunAt: string | null
  }
  formatAverageDuration: (value: number) => string
  formatDateTime: (value?: string | null) => string
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <BaseCard size="md" variant="mist" class-override="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Runs</p>
      <p class="text-3xl font-bold text-slate-900">{{ stats.totalRuns }}</p>
      <p class="text-sm text-slate-500">Semua run untuk workflow ini.</p>
    </BaseCard>

    <BaseCard size="md" variant="mist" class-override="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Success Rate</p>
      <p class="text-3xl font-bold text-emerald-600">{{ stats.successRate }}%</p>
      <p class="text-sm text-slate-500">{{ stats.successRuns }} sukses · {{ stats.failedRuns }} gagal</p>
    </BaseCard>

    <BaseCard size="md" variant="mist" class-override="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active Runs</p>
      <p class="text-3xl font-bold text-sky-600">{{ stats.runningRuns }}</p>
      <p class="text-sm text-slate-500">Run yang masih berjalan saat ini.</p>
    </BaseCard>

    <BaseCard size="md" variant="mist" class-override="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Avg Duration</p>
      <p class="text-3xl font-bold text-slate-900">{{ formatAverageDuration(stats.averageDurationMs) }}</p>
      <p class="text-sm text-slate-500">Run terakhir: {{ formatDateTime(stats.latestRunAt) }}</p>
    </BaseCard>
  </div>
</template>
