<script setup lang="ts">
import BaseBadge from '../../../../packages/ui/components/base/badge/index.vue'
import BaseCard from '../../../../packages/ui/components/base/card/index.vue'

defineProps<{
  runs: Array<{ id: string, status: string, startedAt?: string, finishedAt?: string, mode: string, duration: string }>
  getStatusBadge: (status: string) => { variantText: string, variantBGColor: string }
  formatDateTime: (value?: string | null) => string
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-semibold">Recent Execution Timeline</h3>
      <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge('pending')">
        {{ runs.length }} recent runs
      </BaseBadge>
    </div>

    <div v-if="!runs.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      Belum ada histori run yang bisa diringkas.
    </div>

    <div v-else class="space-y-3">
      <BaseCard
        v-for="run in runs"
        :key="run.id"
        size="md"
        variant="mist"
        class-override="space-y-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-900">{{ run.id }}</p>
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">{{ run.mode }} mode</p>
          </div>
          <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge(run.status)">
            {{ run.status }}
          </BaseBadge>
        </div>

        <div class="grid gap-2 text-sm text-slate-600">
          <p><span class="font-medium text-slate-800">Started:</span> {{ formatDateTime(run.startedAt) }}</p>
          <p><span class="font-medium text-slate-800">Finished:</span> {{ formatDateTime(run.finishedAt) }}</p>
          <p><span class="font-medium text-slate-800">Duration:</span> {{ run.duration }}</p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
