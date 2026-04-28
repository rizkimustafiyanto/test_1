<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 bg-slate-100 px-4 py-10 text-slate-900">
    <slot name="hero" :title="title" :description="description">
      <div class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FlowForge Console</p>
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p class="max-w-3xl text-sm text-slate-600">{{ description }}</p>
      </div>
    </slot>

    <slot />
  </div>
</template>
