import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

export function useResponsive() {
  const width = ref(1280);

  const syncWidth = () => {
    if (!import.meta.client) return;
    width.value = window.innerWidth;
  };

  onMounted(() => {
    syncWidth();
    window.addEventListener('resize', syncWidth);
  });

  onBeforeUnmount(() => {
    if (!import.meta.client) return;
    window.removeEventListener('resize', syncWidth);
  });

  return {
    width,
    isXlUp: computed(() => width.value >= 1280),
  };
}
