<template>
  <BaseModal v-model="modalOpen" :title="title" :size="size" :variant="variant" @close="onCancel">
    <form class="space-y-5" :novalidate="disableNativeValidation" @submit.prevent="onSubmit">
      <slot />

      <div
        v-if="showFooter"
        class="flex items-center justify-end gap-2 border-t pt-4"
        :class="themeClass.border.secondary"
      >
        <BaseButton
          type="button"
          :label="cancelLabel"
          variant="secondary"
          :disabled="submitLoading"
          @click="onCancel"
        />
        <BaseButton
          type="button"
          :label="submitLabel"
          variant="teal"
          icon="fa-solid fa-floppy-disk"
          :is-loading="submitLoading"
          :disabled="submitLoading || submitDisabled"
          @click="onSubmit"
        />
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
  import type { VariantKey } from '@flowforge/types';

  interface Props {
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    variant?: Partial<VariantKey> | string;
    showFooter?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    submitLoading?: boolean;
    submitDisabled?: boolean;
    disableNativeValidation?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    size: 'md',
    variant: 'default',
    showFooter: true,
    submitLabel: 'Simpan',
    cancelLabel: 'Batal',
    submitLoading: false,
    submitDisabled: false,
    disableNativeValidation: true,
  });

  const emit = defineEmits<{
    (e: 'submit'): void;
    (e: 'cancel'): void;
  }>();

  const modalOpen = defineModel<boolean>({ default: false });
  const themeClass = useColorClass();

  const onCancel = () => {
    modalOpen.value = false;
    emit('cancel');
  };

  const onSubmit = () => emit('submit');
</script>
