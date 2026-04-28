<template>
  <div
    class="flex flex-col items-center justify-center px-5 text-center"
    :class="minHeightClass"
    :style="variant === 'brand' ? brandStyle : undefined"
  >
    <div
      class="mb-5 h-14 w-14 animate-spin rounded-full border-4"
      :class="spinnerClass"
      :style="spinnerStyle"
    />
    <p class="ui-body-strong" :class="messageClass">{{ message }}</p>
    <div v-if="$slots.skeleton" class="mt-8 flex w-full justify-center">
      <slot name="skeleton" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useBranding } from '../../../../../apps/frontend/composables/useBranding';

  const props = withDefaults(
    defineProps<{
      message?: string;
      minHeightClass?: string;
      variant?: 'brand' | 'theme';
    }>(),
    {
      message: 'Memuat halaman...',
      minHeightClass: 'min-h-[70vh]',
      variant: 'brand',
    }
  );

  const themeClass = useColorClass();
  const { brandStyle } = useBranding();

  const messageClass = computed(() =>
    props.variant === 'brand' ? 'brand-muted' : themeClass.value.text.secondary
  );

  const spinnerClass = computed(() =>
    props.variant === 'brand' ? '' : themeClass.value.icon.primary
  );

  const spinnerStyle = computed(() => {
    if (props.variant === 'brand') {
      return {
        borderColor: 'var(--brand-soft-weak)',
        borderTopColor: 'var(--brand)',
      } as Record<string, string>;
    }

    return undefined;
  });
</script>
