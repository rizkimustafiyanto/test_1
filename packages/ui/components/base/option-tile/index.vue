<template>
  <button
    type="button"
    :disabled="disabled"
    class="group w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-200"
    :class="tileClass"
    @click="emit('click')"
  >
    <div class="flex items-center justify-between gap-2">
      <slot name="title" :active="active">
        <p class="ui-label flex min-w-0 items-center gap-2" :class="themeClass.text.secondary">
          <slot name="leading" :active="active">
            <i v-if="icon" :class="[icon, iconClass, 'h-4 w-4 shrink-0 text-center']" />
          </slot>
          <span class="truncate">{{ label }}</span>
        </p>
      </slot>

      <slot name="trailing" :active="active" :value="value" :badge-label="badgeLabel">
        <span
          v-if="value !== null && value !== undefined && String(value).length > 0"
          class="ui-value ui-tabular leading-none"
          :class="themeClass.text.secondary"
        >
          {{ value }}
        </span>

        <span
          v-else-if="badgeLabel"
          class="rounded-full px-2 py-0.5 text-[10px] leading-tight font-semibold tracking-wide uppercase"
          :class="badgeClass"
        >
          {{ badgeLabel }}
        </span>
      </slot>
    </div>

    <slot name="description" :active="active">
      <p
        v-if="description"
        class="ui-caption mt-1 line-clamp-2"
        :class="themeClass.text.subtleMeta"
      >
        {{ description }}
      </p>
    </slot>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  const props = withDefaults(
    defineProps<{
      label: string;
      description?: string;
      icon?: string;
      value?: string | number;
      active?: boolean;
      disabled?: boolean;
      badgeLabel?: string;
      badgeTone?: 'success' | 'danger' | 'warning' | 'info' | 'secondary';
    }>(),
    {
      description: '',
      icon: '',
      value: '',
      active: false,
      disabled: false,
      badgeLabel: '',
      badgeTone: 'secondary',
    }
  );

  const emit = defineEmits<{
    (e: 'click'): void;
  }>();

  const themeClass = useColorClass();

  const tileClass = computed(() => {
    if (props.active) {
      return [
        themeClass.value.border.primary,
        themeClass.value.background.mist,
        'shadow-sm ring-1 ring-slate-300/40 dark:ring-slate-700/50',
      ];
    }
    return [
      themeClass.value.border.secondary,
      themeClass.value.background.secondary,
      'hover:shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/70',
    ];
  });

  const iconClass = computed(() =>
    props.active ? themeClass.value.icon.primary : themeClass.value.icon.secondary
  );

  const badgeClass = computed(() => {
    if (props.badgeTone === 'success') {
      return [themeClass.value.backgroundless.softGreen, themeClass.value.text.success];
    }
    if (props.badgeTone === 'danger') {
      return [themeClass.value.backgroundless.softPink, themeClass.value.text.danger];
    }
    if (props.badgeTone === 'warning') {
      return [themeClass.value.backgroundless.warning, themeClass.value.text.warning];
    }
    if (props.badgeTone === 'info') {
      return [themeClass.value.backgroundless.info, themeClass.value.text.info];
    }
    return [themeClass.value.backgroundless.secondary, themeClass.value.text.secondary];
  });
</script>
