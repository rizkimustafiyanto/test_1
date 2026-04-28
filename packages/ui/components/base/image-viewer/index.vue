<template>
  <teleport to="body">
    <transition name="viewer-fade">
      <div
        v-if="modelValue && imageSrc"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm sm:p-6"
        @click.self="close"
      >
        <transition name="viewer-scale">
          <div
            v-if="modelValue && imageSrc"
            class="relative w-full max-w-5xl overflow-hidden rounded-2xl border shadow-2xl"
            :class="[themeClass.border.secondary, themeClass.baseDiv.secondary]"
          >
            <BaseButton
              type="button"
              :ignore-variant="true"
              icon="fa-solid fa-xmark"
              icon-class="text-white"
              custom-class="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-950/55 border border-white/25 backdrop-blur-sm hover:bg-slate-950/75 shadow-none"
              :title="'Close image preview'"
              @click="close"
            />

            <div
              class="absolute top-2 left-2 z-20 flex items-center gap-1.5 sm:top-3 sm:left-3 sm:gap-2"
            >
              <BaseButton
                type="button"
                :ignore-variant="true"
                icon="fa-solid fa-magnifying-glass-minus"
                icon-class="text-white"
                custom-class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-950/55 border border-white/25 backdrop-blur-sm hover:bg-slate-950/75 shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="zoom <= minZoom"
                :title="'Zoom out'"
                @click="zoomOut"
              />
              <BaseButton
                type="button"
                :ignore-variant="true"
                icon="fa-solid fa-magnifying-glass-plus"
                icon-class="text-white"
                custom-class="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-950/55 border border-white/25 backdrop-blur-sm hover:bg-slate-950/75 shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="zoom >= maxZoom"
                :title="'Zoom in'"
                @click="zoomIn"
              />
              <BaseButton
                type="button"
                :ignore-variant="true"
                :label="`${Math.round(zoom * 100)}%`"
                icon-class="text-white"
                custom-class="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-slate-950/55 border border-white/25 backdrop-blur-sm hover:bg-slate-950/75 shadow-none text-white"
                :title="'Reset zoom'"
                @click="resetZoom"
              />
            </div>

            <div
              class="flex h-[68dvh] items-center justify-center overflow-auto p-4 sm:h-[72dvh] sm:p-6"
            >
              <img
                :src="imageSrc"
                :alt="altText"
                class="max-h-full max-w-full rounded-xl object-contain transition-transform duration-200 ease-out select-none"
                :style="{ transform: `scale(${zoom})`, transformOrigin: 'center center' }"
              />
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

  const props = defineProps<{
    modelValue: boolean;
    imageSrc: string | null;
    alt?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const themeClass = useColorClass();
  const minZoom = 1;
  const maxZoom = 3;
  const zoomStep = 0.25;
  const zoom = ref(1);

  const altText = computed(() => props.alt || 'Image preview');

  const close = () => {
    emit('update:modelValue', false);
  };

  const zoomIn = () => {
    zoom.value = Math.min(Number((zoom.value + zoomStep).toFixed(2)), maxZoom);
  };

  const zoomOut = () => {
    zoom.value = Math.max(Number((zoom.value - zoomStep).toFixed(2)), minZoom);
  };

  const resetZoom = () => {
    zoom.value = minZoom;
  };

  watch(
    () => props.modelValue,
    (isOpen) => {
      if (isOpen) {
        resetZoom();
      }
    }
  );

  const handleKeydown = (event: KeyboardEvent) => {
    if (!props.modelValue) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key === '+' || event.key === '=') {
      zoomIn();
      return;
    }
    if (event.key === '-') {
      zoomOut();
      return;
    }
    if (event.key === '0') {
      resetZoom();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<style scoped>
  .viewer-fade-enter-active,
  .viewer-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .viewer-fade-enter-from,
  .viewer-fade-leave-to {
    opacity: 0;
  }

  .viewer-scale-enter-active {
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
  }
  .viewer-scale-enter-from {
    transform: scale(0.97);
    opacity: 0;
  }
  .viewer-scale-leave-active {
    transition:
      transform 0.15s ease,
      opacity 0.15s ease;
  }
  .viewer-scale-leave-to {
    transform: scale(0.97);
    opacity: 0;
  }
</style>
