<script setup lang="ts">
import BaseBadge from '../../../../packages/ui/components/base/badge/index.vue'
import BaseCard from '../../../../packages/ui/components/base/card/index.vue'
import type { WorkflowStepRunRecord } from '../types/workflow'

defineProps<{
  stepRuns?: WorkflowStepRunRecord[]
  getStatusBadge: (status: string) => { variantText: string, variantBGColor: string }
  formatDuration: (startedAt?: string, finishedAt?: string) => string
  formatDateTime: (value?: string | null) => string
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-semibold">Step Runs</h3>
      <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge('pending')">
        {{ stepRuns?.length || 0 }} steps
      </BaseBadge>
    </div>

    <div v-if="stepRuns?.length" class="space-y-3">
      <BaseCard
        v-for="stepRun in stepRuns"
        :key="stepRun.id"
        size="md"
        variant="secondary"
        class-override="space-y-3"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-base font-semibold">{{ stepRun.stepId }}</p>
            <p class="text-sm text-slate-500">{{ stepRun.stepType }} • attempt {{ stepRun.attempt }}</p>
          </div>
          <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge(stepRun.status)">
            {{ stepRun.status }}
          </BaseBadge>
        </div>

        <div class="grid gap-2 text-sm text-slate-600">
          <p><span class="font-medium text-slate-800">Started:</span> {{ formatDateTime(stepRun.startedAt) }}</p>
          <p><span class="font-medium text-slate-800">Finished:</span> {{ formatDateTime(stepRun.finishedAt) }}</p>
          <p><span class="font-medium text-slate-800">Duration:</span> {{ formatDuration(stepRun.startedAt, stepRun.finishedAt) }}</p>
        </div>

        <pre
          v-if="stepRun.output"
          class="overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-xs text-slate-100"
        >{{ JSON.stringify(stepRun.output, null, 2) }}</pre>

        <p
          v-if="stepRun.error"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ stepRun.error }}
        </p>
      </BaseCard>
    </div>

    <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      Belum ada step run yang terekam untuk run ini.
    </div>
  </div>
</template>
