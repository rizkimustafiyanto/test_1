<template>
  <button
    :type="type"
    :disabled="loadingState || disabled"
    :title="showOnlyIcon ? label : ''"
    :class="[
      'ui-button inline-flex cursor-pointer items-center justify-center transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70 dark:focus-visible:ring-slate-600/70',
      roundedClass,
      buttonClass,
      sizeClass,
      iconOnlyConstraintClass,
      typographyClass,
      props.customClass,
    ]"
    @click="handleClick"
  >
    <template v-if="loadingState">
      <svg
        :class="['animate-spin text-current', iconSizeClass, showOnlyIcon ? '' : 'mr-2']"
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
      <span v-if="!showOnlyIcon">Loading...</span>
    </template>

    <template v-else>
      <template v-if="icon">
        <i
          :class="[
            icon,
            iconSizeClass,
            iconTypographyClass,
            !showOnlyIcon ? 'mr-2' : '',
            props.iconClass ||
              (props.ignoreVariant
                ? ''
                : themeClass.icon[props.variant ?? 'primary'] || themeClass.icon.primary),
          ]"
        />
      </template>
      <template v-if="!showOnlyIcon">
        <slot>{{ label }}</slot>
      </template>
    </template>
  </button>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useColorClass } from '../../../theme/useColorClass';
  import { FIELD_CONTROL_BY_SIZE, FIELD_TYPOGRAPHY_BY_SIZE } from '../../../theme/typography';
  import type { ButtonSize } from '@flowforge/types';
  import type { ButtonProps } from '@flowforge/types';

  const props = defineProps<ButtonProps>();
  const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
  }>();

  const themeClass = useColorClass();

  const isDebouncing = ref(false);
  const loadingState = computed(() => Boolean(props.loading || props.isLoading));
  const showOnlyIcon = computed(() => !!props.icon && !props.label);

  const handleClick = (event: MouseEvent) => {
    if (isDebouncing.value || loadingState.value || props.disabled) return;
    isDebouncing.value = true;
    emit('click', event);
    setTimeout(() => (isDebouncing.value = false), 300);
  };

  const roundedClass = computed(() => {
    if (props.rounded === 'none') return '';
    return `rounded-${props.rounded ?? 'xl'}`;
  });

  const iconOnlyConstraintClass = computed(() => {
    if (!showOnlyIcon.value) return '';

    const sizeKey = props.size || 'md';
    const minBySize: Record<ButtonSize, string> = {
      xl: 'min-w-14 min-h-14',
      lg: 'min-w-12 min-h-12',
      md: 'min-w-11 min-h-11',
      sm: 'min-w-10 min-h-10',
      xs: 'min-w-9 min-h-9',
    };

    return `${minBySize[sizeKey]} leading-none`;
  });

  const buttonClass = computed(() => {
    if (props.disabled || loadingState.value) {
      return 'opacity-50 cursor-not-allowed shadow-none';
    }

    if (props.ignoreVariant) {
      return [
        props.noBg ? 'bg-transparent' : '',
        props.noBorder ? 'border-0' : '',
        props.noHover ? 'hover:bg-transparent hover:text-current hover:border-current' : '',
      ].join(' ');
    }

    if (props.noBg) {
      return [
        'bg-transparent text-current',
        props.noBorder ? '' : themeClass.value.border.secondary,
        props.noHover
          ? 'hover:none hover:bg-transparent hover:text-current hover:border-current'
          : '',
      ].join(' ');
    }

    if (props.noBorder) {
      return [
        themeClass.value.button?.[props.variant || 'secondary'] ||
          themeClass.value.button.secondary,
        'border-0 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)]',
        props.noHover ? 'hover:none hover:bg-transparent hover:text-current' : '',
      ].join(' ');
    }

    return [
      themeClass.value.button?.[props.variant || 'secondary'] || themeClass.value.button.secondary,
      'shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)]',
      props.noHover ? 'hover:none hover:bg-transparent hover:text-current' : '',
    ].join(' ');
  });

  const sizeClass = computed(() => {
    const sizeKey = props.size || 'md';
    const base = showOnlyIcon.value
      ? {
          xl: FIELD_CONTROL_BY_SIZE.xl.iconSquare,
          lg: FIELD_CONTROL_BY_SIZE.lg.iconSquare,
          md: FIELD_CONTROL_BY_SIZE.md.iconSquare,
          sm: FIELD_CONTROL_BY_SIZE.sm.iconSquare,
          xs: FIELD_CONTROL_BY_SIZE.xs.iconSquare,
        }
      : {
          xl: `${FIELD_CONTROL_BY_SIZE.xl.height} ${FIELD_CONTROL_BY_SIZE.xl.px}`,
          lg: `${FIELD_CONTROL_BY_SIZE.lg.height} ${FIELD_CONTROL_BY_SIZE.lg.px}`,
          md: `${FIELD_CONTROL_BY_SIZE.md.height} ${FIELD_CONTROL_BY_SIZE.md.px}`,
          sm: `${FIELD_CONTROL_BY_SIZE.sm.height} ${FIELD_CONTROL_BY_SIZE.sm.px}`,
          xs: `${FIELD_CONTROL_BY_SIZE.xs.height} ${FIELD_CONTROL_BY_SIZE.xs.px}`,
        };
    return base[sizeKey];
  });

  const typographyClass = computed(() => FIELD_TYPOGRAPHY_BY_SIZE[props.size || 'md'].button);
  const iconTypographyClass = computed(
    () => FIELD_TYPOGRAPHY_BY_SIZE[props.size || 'md'].buttonIcon
  );

  const iconSizeClass = computed(() => {
    const sizes: Record<ButtonSize, string> = {
      xl: 'w-6 h-6',
      lg: 'w-5 h-5',
      md: 'w-4 h-4',
      sm: 'w-3.5 h-3.5',
      xs: 'w-3 h-3',
    };
    return sizes[props.size || 'md'];
  });
</script>
