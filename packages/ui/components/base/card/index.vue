<template>
  <div
    :class="[
      'relative rounded-2xl border transition duration-300',
      cardVisualClass,
      variantClass,
      disabled ? 'opacity-60' : '',
      type === 'grid' ? gridLayoutClass : sizePaddingClass,
      props.classOverride,
    ]"
    :style="props.styleOverride"
  >
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/10 backdrop-blur-[1px]"
      :class="disabled ? 'cursor-not-allowed' : ''"
    >
      <BaseLoadingSpinner type="mini" />
    </div>

    <template v-if="type === 'grid'">
      <div v-if="gridDirection === 'row'" :class="[gridClass, `gap-${gap}`]">
        <slot />
      </div>
      <div v-else :class="[`flex flex-col gap-${gap}`]">
        <slot />
      </div>
    </template>

    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import BaseLoadingSpinner from '../loading-spinner/index.vue';
  import { useColorClass } from '../../../theme/useColorClass';
  import { useThemeStore } from '../../../stores/utils/theme';
  import type { CardProps } from '@flowforge/types';

  const props = defineProps<CardProps>();
  const type = computed(() => props.type ?? 'default');
  const gridDirection = computed(() => props.gridDirection ?? 'row');
  const cols = computed(() => props.cols ?? 2);
  const gap = computed(() => props.gap ?? 4);
  const width = computed(() => props.width ?? 'full');
  const height = computed(() => props.height ?? 'auto');
  const variant = computed(() => props.variant ?? 'secondary');
  const size = computed(() => props.size ?? 'md');
  const hasRing = computed(() => props.hasRing ?? true);
  const loading = computed(() => Boolean(props.loading));
  const disabled = computed(() => Boolean(props.disabled));

  const themeStore = useThemeStore();
  const themeClass = useColorClass();
  const mounted = ref(false);
  const sizePaddingClass = computed(() => {
    const map = {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
      xl: 'p-6',
    };
    return map[size.value] || 'p-4';
  });

  const gridLayoutClass = computed(() => {
    return `w-${width.value} h-${height.value} ${sizePaddingClass.value}`;
  });

  const gridClass = computed(() => {
    const map: Record<number, string> = {
      1: 'grid grid-cols-1',
      2: 'grid grid-cols-1 sm:grid-cols-2',
      3: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      4: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    };
    return map[cols.value] || `grid grid-cols-1 sm:grid-cols-${cols.value}`;
  });

  const variantClass = computed(() => {
    const baseDiv = themeClass.value.baseDiv || {};
    return (baseDiv as Record<string, string>)[variant.value] || baseDiv.default || '';
  });

  const cardVisualClass = computed(() => {
    if (!mounted.value) {
      return 'shadow-lg backdrop-blur-sm border-white/10';
    }
    const isDark = themeStore.theme === 'dark';
    const shadow = isDark
      ? 'shadow-[0_12px_30px_rgba(2,6,23,0.35)] backdrop-blur-md'
      : 'shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-sm';

    if (hasRing.value) {
      const baseRing = themeClass.value.ring?.[variant.value] || themeClass.value.ring.secondary;
      return `${shadow} ring-1 ${baseRing} border-white/10`;
    }

    return `${shadow} border-white/10`;
  });

  onMounted(() => {
    mounted.value = true;
  });
</script>
