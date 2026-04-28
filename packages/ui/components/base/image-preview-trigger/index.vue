<template>
  <BaseButton
    size="sm"
    :ignore-variant="true"
    icon="fa-solid fa-expand"
    :icon-class="isArmed ? iconClassArmed : iconClassDefault"
    :custom-class="triggerClass"
    :title="title"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import type { VariantKey } from '@flowforge/types';
  import { useColorStore } from '../../../../../apps/frontend/stores/utils/color';

  const props = withDefaults(
    defineProps<{
      title?: string;
      customClass?: string;
      showOnHover?: boolean;
      doubleTapOnTouch?: boolean;
      armedDurationMs?: number;
      fullArea?: boolean;
    }>(),
    {
      title: 'Preview image',
      customClass: '',
      showOnHover: true,
      doubleTapOnTouch: true,
      armedDurationMs: 1200,
      fullArea: true,
    }
  );

  const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void;
  }>();

  const themeClass = useColorClass();
  const colorStore = useColorStore();
  const isArmed = ref(false);
  const isTouchDevice = ref(false);
  const resetTimer = ref<ReturnType<typeof setTimeout> | null>(null);

  const primaryVariant = computed<VariantKey>(() => colorStore.variant || 'teal');
  const iconClassDefault = computed(() =>
    isTouchDevice.value ? 'text-transparent' : 'text-white'
  );
  const iconClassArmed = computed(() => {
    if (isTouchDevice.value) return 'text-transparent';
    const token = themeClass.value.text[primaryVariant.value] || '';
    return token || 'text-white';
  });

  const clearArmTimer = () => {
    if (!resetTimer.value) return;
    clearTimeout(resetTimer.value);
    resetTimer.value = null;
  };

  const arm = () => {
    isArmed.value = true;
    clearArmTimer();
    resetTimer.value = setTimeout(
      () => {
        isArmed.value = false;
        resetTimer.value = null;
      },
      Math.max(Number(props.armedDurationMs || 1200), 400)
    );
  };

  const triggerPreview = (event: MouseEvent) => {
    emit('click', event);
  };

  const handleClick = (event: MouseEvent) => {
    const shouldDoubleTap = props.doubleTapOnTouch && isTouchDevice.value;
    if (!shouldDoubleTap) {
      triggerPreview(event);
      return;
    }

    if (!isArmed.value) {
      arm();
      return;
    }

    isArmed.value = false;
    clearArmTimer();
    triggerPreview(event);
  };

  const triggerClass = computed(() => {
    const fullAreaClass = props.fullArea
      ? 'w-full h-full rounded-[inherit] border-0 shadow-none'
      : 'h-8 w-8 rounded-full border backdrop-blur-sm shadow-[0_6px_18px_rgba(15,23,42,0.35)]';

    const armedVisualClass = [
      'transition',
      themeClass.value.background[primaryVariant.value] || 'bg-teal-500',
      props.fullArea ? 'bg-opacity-25' : '',
      props.fullArea ? 'animate-pulse' : 'border-white/30',
    ].join(' ');

    const idleVisualClass = props.fullArea
      ? 'bg-slate-950/0 hover:bg-slate-950/20 transition'
      : 'bg-slate-950/45 border-white/30 hover:bg-slate-950/70 transition';

    const shouldHideOnTouch = props.doubleTapOnTouch && isTouchDevice.value && !isArmed.value;
    const visibilityClass = shouldHideOnTouch
      ? 'opacity-0'
      : props.showOnHover
        ? 'opacity-0 sm:group-hover:opacity-100'
        : 'opacity-100';

    return [
      fullAreaClass,
      isArmed.value ? armedVisualClass : idleVisualClass,
      visibilityClass,
      props.customClass,
    ]
      .join(' ')
      .trim();
  });

  onMounted(() => {
    if (!import.meta.client) return;
    isTouchDevice.value =
      window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches;
  });

  onBeforeUnmount(() => {
    clearArmTimer();
  });
</script>
