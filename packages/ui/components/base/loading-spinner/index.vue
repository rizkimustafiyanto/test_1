<template>
  <div
    v-if="type === 'full'"
    :class="['absolute inset-0 z-50 flex flex-col items-center justify-center']"
  >
    <div class="flex flex-col items-center gap-3">
      <svg
        class="h-8 w-8 animate-spin"
        :class="themeClass.icon.primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span class="ui-body-sm font-medium" :class="themeClass.text.secondary">
        {{ props.message ?? defaultMessage }}
      </span>
    </div>
  </div>

  <div
    v-else-if="type === 'mini'"
    :class="['flex items-center justify-center rounded-lg p-3 shadow-md']"
  >
    <div class="flex items-center gap-2">
      <svg
        class="h-5 w-5 animate-spin"
        :class="themeClass.icon.primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span class="ui-body-sm" :class="themeClass.text.secondary">
        {{ props.message ?? defaultMessage }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useColorClass } from '../../../theme/useColorClass';
  import type { LoadingSpinnerProps } from '@flowforge/types';

  const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
    message: undefined,
  });

  const defaultMessage = computed(() =>
    props.type === 'full' ? 'Memuat halaman...' : 'Memuat data...'
  );

  const themeClass = useColorClass();
</script>
