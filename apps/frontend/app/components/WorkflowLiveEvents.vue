<script setup lang="ts">
import BaseBadge from '../../../../packages/ui/components/base/badge/index.vue'
import BaseCard from '../../../../packages/ui/components/base/card/index.vue'
import BaseLoadingSpinner from '../../../../packages/ui/components/base/loading-spinner/index.vue'
import type { WorkflowStepEvent } from '../types/workflow'

defineProps<{
  events: WorkflowStepEvent[]
  isConnected: boolean
  getStatusBadge: (status: string) => { variantText: string, variantBGColor: string }
  formatDateTime: (value?: string | null) => string
}>()
</script>

<template>
  <BaseCard size="lg" variant="secondary" class-override="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold">Live Event Stream</h2>
        <p class="text-sm text-slate-500">Socket otomatis subscribe ke run yang sedang dibuka.</p>
      </div>
      <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge(isConnected ? 'running' : 'pending')">
        {{ isConnected ? 'subscribed' : 'not subscribed' }}
      </BaseBadge>
    </div>

    <div v-if="!events.length && isConnected" class="flex justify-center py-8">
      <BaseLoadingSpinner type="mini" message="Menunggu live event..." />
    </div>

    <div v-else-if="!events.length" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      Belum ada event real-time yang diterima.
    </div>

    <div v-else class="space-y-3">
      <BaseCard
        v-for="event in events"
        :key="`${event.runId}-${event.stepId}-${event.attempt}-${event.timestamp}-${event.event}`"
        size="md"
        variant="mist"
        class-override="space-y-3"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-base font-semibold">{{ event.stepId }}</p>
            <p class="text-sm text-slate-500">{{ event.stepType }} • attempt {{ event.attempt }}</p>
          </div>
          <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge(event.event)">
            {{ event.event }}
          </BaseBadge>
        </div>

        <div class="grid gap-2 text-sm text-slate-600">
          <p><span class="font-medium text-slate-800">Run:</span> {{ event.runId }}</p>
          <p><span class="font-medium text-slate-800">Timestamp:</span> {{ formatDateTime(event.timestamp) }}</p>
        </div>

        <pre
          v-if="event.output"
          class="overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-xs text-slate-100"
        >{{ JSON.stringify(event.output, null, 2) }}</pre>

        <p
          v-if="event.error"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ event.error }}
        </p>
      </BaseCard>
    </div>
  </BaseCard>
</template>
