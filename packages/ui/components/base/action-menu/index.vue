<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import type { ActionMenuProps } from '@flowforge/types';
  import { useColorClass } from '../../../theme/useColorClass';

  const props = withDefaults(defineProps<ActionMenuProps>(), {
    items: () => [],
    buttonLabel: 'Aksi',
    buttonVariant: 'secondary',
    buttonSize: 'xs',
  });

  const themeClass = useColorClass();
  const open = ref(false);
  const rootRef = ref<HTMLElement | null>(null);

  const close = () => {
    open.value = false;
  };

  const handleDocumentClick = (event: MouseEvent) => {
    if (!rootRef.value) return;
    const target = event.target as Node | null;
    if (target && rootRef.value.contains(target)) return;
    close();
  };

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
  });

  const visibleItems = computed(() => props.items.filter((item) => item && item.label));
  const handleItemClick = (item: ActionMenuProps['items'][number]) => {
    if (!item || item.disabled) return;
    try {
      item.onClick?.();
    } catch (error) {
      console.error('ActionMenu handler failed', error);
    } finally {
      close();
    }
  };
</script>

<template>
  <div ref="rootRef" class="relative">
    <BaseButton :size="buttonSize" :variant="buttonVariant" @click="open = !open">
      {{ buttonLabel }}
    </BaseButton>
    <div
      v-if="open"
      class="absolute right-0 z-30 mt-2 min-w-[180px] rounded-xl border p-2 shadow-lg"
      :class="[
        (themeClass.baseDiv as Record<string, string>)['secondary'],
        themeClass.border.secondary,
      ]"
    >
      <button
        v-for="item in visibleItems"
        :key="item.label"
        type="button"
        class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition"
        :class="[
          item.tone === 'danger' ? themeClass.text.danger : themeClass.text.secondary,
          item.disabled ? 'cursor-not-allowed opacity-50' : themeClass.hover.smooth,
        ]"
        :disabled="item.disabled"
        @click="handleItemClick(item)"
      >
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
