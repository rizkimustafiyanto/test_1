<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
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
  </section>
</template>
