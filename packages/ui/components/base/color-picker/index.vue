<template>
  <div ref="root" class="relative inline-flex items-center">
    <button
      type="button"
      :class="['color-picker-trigger leading-none', buttonClass]"
      :title="title"
      aria-label="Ganti warna tema"
      @click="toggle"
    >
      <i class="fas fa-palette" />
    </button>

    <transition name="fade-scale">
      <div
        v-if="open"
        ref="panel"
        class="fixed z-[70] min-w-[220px]"
        :style="panelStyle"
        @click.stop
      >
        <div
          class="rounded-xl border p-3 shadow-lg"
          :class="[
            (colorClass.baseDiv as Record<string, string>)['secondary'],
            colorClass.border.secondary,
          ]"
        >
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="variant in choices"
              :key="variant"
              type="button"
              class="h-8 w-8 rounded-full border transition"
              :class="variant === current ? activeRing : 'border-transparent'"
              :style="{ backgroundColor: palette[variant] }"
              :title="variant"
              @click="select(variant)"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import type { VariantKey } from '@flowforge/types';
  import { useColorStore } from '../../../../../apps/frontend/stores/utils/color';
  import { COLOR_CHOICES, COLOR_PALETTE } from '../../../theme/colorPalette';

  withDefaults(
    defineProps<{
      title?: string;
      buttonClass?: string;
    }>(),
    {
      title: 'Ganti warna',
      buttonClass: '',
    }
  );

  const colorStore = useColorStore();
  const colorClass = useColorClass();
  const open = ref(false);
  const root = ref<HTMLElement | null>(null);
  const panel = ref<HTMLElement | null>(null);
  const panelStyle = ref<Record<string, string>>({
    left: '50%',
    top: '4rem',
    transform: 'translateX(-50%)',
  });

  const current = computed(() => colorStore.variant);
  const palette = COLOR_PALETTE;
  const choices = COLOR_CHOICES;

  const activeRing = computed(() => {
    const ring = colorClass.value.ring.primary;
    return `ring-2 ${ring}`;
  });

  const toggle = () => {
    open.value = !open.value;
  };

  const select = (variant: VariantKey) => {
    colorStore.setVariant(variant);
    open.value = false;
  };

  const updatePanelPosition = () => {
    if (!open.value || !root.value) return;

    const rootRect = root.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const panelWidth = panel.value?.offsetWidth || 220;
    const panelHeight = panel.value?.offsetHeight || 80;

    const isMobile = viewportWidth < 640;
    if (isMobile) {
      panelStyle.value = {
        left: '50%',
        top: '4rem',
        transform: 'translateX(-50%)',
      };
      return;
    }

    const minInset = 8;
    const desiredLeft = rootRect.right - panelWidth;
    const clampedLeft = Math.max(
      minInset,
      Math.min(desiredLeft, viewportWidth - panelWidth - minInset)
    );

    const belowTop = rootRect.bottom + 8;
    const aboveTop = rootRect.top - panelHeight - 8;
    const useAbove = belowTop + panelHeight > viewportHeight - minInset && aboveTop >= minInset;

    panelStyle.value = {
      left: `${Math.round(clampedLeft)}px`,
      top: `${Math.round(useAbove ? aboveTop : belowTop)}px`,
      transform: 'none',
    };
  };

  watch(open, async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    updatePanelPosition();
  });

  onMounted(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (root.value && root.value.contains(target)) return;
      open.value = false;
    };
    document.addEventListener('click', handler);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    onBeforeUnmount(() => document.removeEventListener('click', handler));
    onBeforeUnmount(() => window.removeEventListener('resize', updatePanelPosition));
    onBeforeUnmount(() => window.removeEventListener('scroll', updatePanelPosition, true));
  });
</script>

<style scoped>
  .color-picker-trigger {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
    transition: all 0.2s ease;
  }

  .color-picker-trigger:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
  }

  .color-picker-trigger i {
    line-height: 1;
    display: block;
  }
</style>
