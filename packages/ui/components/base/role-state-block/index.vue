<template>
  <div v-if="mode === 'loading'" class="space-y-3">
    <div
      v-for="idx in skeletonCount"
      :key="idx"
      class="animate-pulse rounded-2xl border p-4"
      :class="[themeClass.border.secondary, themeClass.background.mist]"
    >
      <div class="h-4 w-1/3 rounded" :class="themeClass.background.secondary" />
      <div class="mt-3 h-3 w-1/2 rounded" :class="themeClass.background.secondary" />
      <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div class="h-10 rounded" :class="themeClass.background.secondary" />
        <div class="h-10 rounded" :class="themeClass.background.secondary" />
        <div class="h-10 rounded" :class="themeClass.background.secondary" />
      </div>
    </div>
  </div>

  <div
    v-else
    class="rounded-2xl border border-dashed px-5 py-8 text-center"
    :class="[themeClass.border.airy, themeClass.background.mist]"
  >
    <i :class="[icon, 'mb-3 text-3xl', themeClass.icon.secondary]" />
    <p class="ui-body-strong" :class="themeClass.text.secondary">{{ title }}</p>
    <p class="ui-caption mt-1" :class="themeClass.text.subtleMeta">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  const props = withDefaults(
    defineProps<{
      mode: 'loading' | 'empty';
      title?: string;
      description?: string;
      icon?: string;
      count?: number;
    }>(),
    {
      title: 'Belum ada data',
      description: 'Data akan muncul setelah transaksi tersedia.',
      icon: 'fa-solid fa-inbox',
      count: 2,
    }
  );

  const themeClass = useColorClass();
  const skeletonCount = computed(() => Math.max(Number(props.count || 2), 1));
</script>
