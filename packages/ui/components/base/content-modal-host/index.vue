<template>
  <BaseContentModal
    :model-value="isOpen"
    :payload="payload"
    :size="size"
    @update:model-value="handleModelUpdate"
    @close="close"
  />
</template>

<script setup lang="ts">
  import { useContentModal } from '../../../../../apps/frontend/composables/useContentModal';

  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  }>();

  const { isOpen, payload, close, reset } = useContentModal();

  const handleModelUpdate = (value: boolean) => {
    if (value) return;
    close();
    reset();
  };
</script>
