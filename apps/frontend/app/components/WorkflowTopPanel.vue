<script setup lang="ts">
import BaseCard from '../../../../packages/ui/components/base/card/index.vue'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <BaseCard size="lg" variant="secondary" class-override="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowForge Console</p>
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p class="max-w-3xl text-sm text-slate-600">{{ description }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </BaseCard>
</template>
