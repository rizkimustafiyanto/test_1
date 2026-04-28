<template>
  <Teleport to="body">
    <transition name="toast-slide">
      <div
        v-if="visible"
        class="pointer-events-none fixed inset-x-0 top-3 z-1200 flex justify-center px-3 sm:top-4 sm:justify-end sm:px-5"
      >
        <div
          :class="[
            'pointer-events-auto w-full max-w-md rounded-2xl border p-4 shadow-[0_12px_28px_rgba(15,23,42,0.14)]',
            (themeClass.baseDiv as Record<string, string>)['secondary'],
            themeClass.border.secondary,
          ]"
          :role="status === 'success' ? 'status' : 'alert'"
          :aria-live="status === 'success' ? 'polite' : 'assertive'"
          @mouseenter="handlePause"
          @mouseleave="handleResume"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
              :class="
                status === 'success' ? [themeClass.border.success] : [themeClass.border.danger]
              "
            >
              <i
                :class="[
                  'text-base leading-none',
                  status === 'success'
                    ? 'far fa-thumbs-up ' + themeClass.icon.success
                    : 'fas fa-exclamation-circle ' + themeClass.icon.danger,
                ]"
              />
            </div>

            <div class="min-w-0 flex-1">
              <p
                class="ui-caption font-semibold tracking-wide uppercase"
                :class="status === 'success' ? themeClass.text.success : themeClass.text.danger"
              >
                {{ status === 'success' ? 'Berhasil' : 'Gagal' }}
              </p>
              <p class="ui-body mt-1 wrap-break-word" :class="themeClass.text.secondary">
                {{ message }}
              </p>
            </div>

            <button
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:opacity-80"
              :class="themeClass.text.subtleMeta"
              aria-label="Tutup notifikasi"
              @click="$emit('close')"
            >
              <i class="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { useColorClass } from '../../../theme/useColorClass';
  import type { ResponseModalProps } from '@flowforge/types';

  defineProps<ResponseModalProps>();
  defineEmits<{ (e: 'close'): void }>();
  const ui = useUIStore();

  const themeClass = useColorClass();

  const handlePause = () => {
    ui.pauseToast();
  };

  const handleResume = () => {
    ui.resumeToast();
  };
</script>

<style scoped>
  .toast-slide-enter-active,
  .toast-slide-leave-active {
    transition: all 0.22s ease;
  }

  .toast-slide-enter-from,
  .toast-slide-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }
</style>
