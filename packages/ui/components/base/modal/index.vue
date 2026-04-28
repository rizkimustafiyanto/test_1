<template>
  <Teleport to="body">
    <transition name="modal-fade" @after-enter="$emit('after-enter')">
      <div
        v-if="modelValue"
        :class="[
          'fixed inset-0 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4',
          props.zIndexClass || 'z-[1100]',
        ]"
        @click.self="close"
      >
        <transition name="modal-scale">
          <div
            v-if="modelValue"
            :class="[
              'relative mx-0 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:mx-4 sm:max-h-[90vh] sm:rounded-2xl',
              widthClass,
              (themeClass.baseDiv as Record<string, string>)[props.variant ?? 'default'],
            ]"
          >
            <div
              v-if="title"
              class="flex items-center justify-between border-b px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4"
              :class="themeClass.border.secondary"
            >
              <h3 class="ui-subtitle truncate pr-2" :class="themeClass.text.secondary">
                {{ title }}
              </h3>
              <button
                class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:opacity-80"
                :class="themeClass.text.secondary"
                @click="close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="scrollbar-none overflow-y-auto px-4 pt-2 pb-5 sm:px-6 sm:pb-6">
              <slot />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useColorClass } from '../../../theme/useColorClass';
  import type { VariantKey } from '@flowforge/types';

  const themeClass = useColorClass();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'after-enter'): void;
    (e: 'close'): void;
  }>();

  const props = defineProps<{
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
    variant?: Partial<VariantKey> | string;
    zIndexClass?: string;
  }>();

  const widthClass = computed(() => `max-w-${props.size ?? 'lg'}`);

  const close = () => {
    emit('close');
    emit('update:modelValue', false);
  };
</script>

<style scoped>
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .modal-scale-enter-active {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
  .modal-scale-enter-from {
    transform: scale(0.95);
    opacity: 0;
  }
  .modal-scale-leave-active {
    transition:
      transform 0.15s ease,
      opacity 0.15s ease;
  }
  .modal-scale-leave-to {
    transform: scale(0.95);
    opacity: 0;
  }
</style>
