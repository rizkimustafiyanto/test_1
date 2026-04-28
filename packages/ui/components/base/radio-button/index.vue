<script setup lang="ts">
  import { computed } from 'vue';
  import { FIELD_TYPOGRAPHY_BY_SIZE } from '../../../theme/typography';
  import type { RadioButtonProps } from '@flowforge/types';

  const themeClass = useColorClass();

  const props = defineProps<RadioButtonProps>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | boolean): void;
  }>();

  const radioName = computed(() => props.name ?? `radio-${Math.random().toString(36).slice(2)}`);

  const wrapperClass = computed(() => {
    if (props.type === 'horizontal') {
      return `flex flex-row flex-wrap ${gapStyle.value.horizontal}`;
    }
    return `flex flex-col ${gapStyle.value.vertical}`;
  });

  const sizeMap = {
    xs: { circle: 'w-4 h-4', dot: 'w-2 h-2', text: FIELD_TYPOGRAPHY_BY_SIZE.xs.radio, gap: 'ml-1' },
    sm: { circle: 'w-6 h-6', dot: 'w-3 h-3', text: FIELD_TYPOGRAPHY_BY_SIZE.sm.radio, gap: 'ml-2' },
    md: { circle: 'w-8 h-8', dot: 'w-4 h-4', text: FIELD_TYPOGRAPHY_BY_SIZE.md.radio, gap: 'ml-2' },
    lg: {
      circle: 'w-10 h-10',
      dot: 'w-5 h-5',
      text: FIELD_TYPOGRAPHY_BY_SIZE.lg.radio,
      gap: 'ml-3',
    },
    xl: {
      circle: 'w-12 h-12',
      dot: 'w-6 h-6',
      text: FIELD_TYPOGRAPHY_BY_SIZE.xl.radio,
      gap: 'ml-3',
    },
  } as const;

  const gapMap = {
    xs: { horizontal: 'gap-x-3 gap-y-2', vertical: 'gap-2' },
    sm: { horizontal: 'gap-x-4 gap-y-2', vertical: 'gap-2.5' },
    md: { horizontal: 'gap-x-5 gap-y-3', vertical: 'gap-3' },
    lg: { horizontal: 'gap-x-6 gap-y-3', vertical: 'gap-3.5' },
    xl: { horizontal: 'gap-x-7 gap-y-4', vertical: 'gap-4' },
  } as const;

  const gapStyle = computed(() => gapMap[props.sizeVariant ?? 'sm']);

  const sizeStyle = computed(() => sizeMap[props.sizeVariant ?? 'sm']);

  const ringClass = computed(() =>
    themeClass.value.ring.primary.replace('ring-', 'peer-focus-visible:ring-')
  );
</script>

<template>
  <div class="relative" :data-field-name="name">
    <label
      v-if="label"
      class="mb-2 block font-medium"
      :class="[themeClass.text.dark, sizeStyle.text]"
    >
      {{ label }}
    </label>

    <div :class="wrapperClass">
      <label
        v-for="option in options"
        :key="String(option.value)"
        class="flex cursor-pointer items-center transition select-none"
      >
        <input
          type="radio"
          :name="radioName"
          :value="option.value"
          :checked="modelValue === option.value"
          class="peer hidden"
          @change="emit('update:modelValue', option.value)"
        />

        <!-- Outer circle -->
        <div
          class="flex items-center justify-center rounded-full border-2 transition-all peer-focus-visible:ring-2"
          :class="[
            sizeStyle.circle,
            ringClass,
            modelValue === option.value ? themeClass.border.primary : themeClass.border.secondary,
          ]"
        >
          <!-- Inner dot -->
          <div
            v-if="modelValue === option.value"
            class="rounded-full transition-all"
            :class="[sizeStyle.dot, themeClass.background.primary]"
          />
        </div>

        <span :class="[sizeStyle.gap, themeClass.text.dark, sizeStyle.text]">
          {{ option.label }}
        </span>
      </label>
    </div>
  </div>
</template>
