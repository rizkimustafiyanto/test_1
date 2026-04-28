<template>
  <span
    class="ui-badge inline-block px-2 py-1 transition-colors duration-200"
    :class="computedClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
  import { useColorClass } from '../../../theme/useColorClass';
  import { FIELD_TYPOGRAPHY_BY_SIZE } from '../../../theme/typography';
  import type { BadgeProps } from '@flowforge/types';
  import type { Rounded, TextSize } from '@flowforge/types';

  const props = defineProps<BadgeProps>();

  const themeClass = useColorClass();

  const textSizeMap: Record<TextSize, string> = {
    xs: FIELD_TYPOGRAPHY_BY_SIZE.xs.badge,
    sm: FIELD_TYPOGRAPHY_BY_SIZE.sm.badge,
    base: FIELD_TYPOGRAPHY_BY_SIZE.md.badge,
    lg: FIELD_TYPOGRAPHY_BY_SIZE.lg.badge,
    xl: FIELD_TYPOGRAPHY_BY_SIZE.xl.badge,
  };

  const roundedMap: Partial<Record<Rounded, string>> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  const computedClass = computed<string[]>(() => {
    const classes: string[] = [];

    if (props.variantText && themeClass.value.text[props.variantText]) {
      classes.push(themeClass.value.text[props.variantText]);
    }

    if (props.variantBGColor && themeClass.value.background[props.variantBGColor]) {
      classes.push(themeClass.value.background[props.variantBGColor]);
    }

    if (props.variantHover && props.variantHover && themeClass.value.hover[props.variantHover]) {
      classes.push(themeClass.value.hover[props.variantHover]);
    }

    if (props.textSize && textSizeMap[props.textSize]) {
      classes.push(textSizeMap[props.textSize]);
    }

    if (props.rounded && roundedMap[props.rounded]) {
      classes.push(roundedMap[props.rounded] as string);
    }

    return classes;
  });
</script>
