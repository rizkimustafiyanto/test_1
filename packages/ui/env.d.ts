import type { DefineComponent } from 'vue';

declare module '*.vue' {
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare global {
  interface ImportMeta {
    readonly client: boolean;
  }

  const ref: typeof import('vue').ref;
  const shallowRef: typeof import('vue').shallowRef;
  const reactive: typeof import('vue').reactive;
  const computed: typeof import('vue').computed;
  const watch: typeof import('vue').watch;
  const watchEffect: typeof import('vue').watchEffect;
  const onMounted: typeof import('vue').onMounted;
  const onBeforeMount: typeof import('vue').onBeforeMount;
  const onBeforeUnmount: typeof import('vue').onBeforeUnmount;
  const onUnmounted: typeof import('vue').onUnmounted;
  const nextTick: typeof import('vue').nextTick;
  const useSlots: typeof import('vue').useSlots;

  const useColorClass: typeof import('../../apps/frontend/theme/useColorClass').useColorClass;
  const useThemeStore: typeof import('../../apps/frontend/stores/utils/theme').useThemeStore;
  const useColorStore: typeof import('../../apps/frontend/stores/utils/color').useColorStore;
  const useUIStore: typeof import('../../apps/frontend/stores/utils/ui').useUIStore;
  const useFormatter: typeof import('../../apps/frontend/composables/useFormatter').useFormatter;
  const useResponsive: typeof import('../../apps/frontend/composables/useResponsive').useResponsive;
  const useBranding: typeof import('../../apps/frontend/composables/useBranding').useBranding;
  const useContentModal: typeof import('../../apps/frontend/composables/useContentModal').useContentModal;

  const isClient: boolean;
  const useState: <T>(key: string, init?: () => T) => import('vue').Ref<T>;
  const useCookie: <T = string>(name: string, opts?: any) => import('vue').Ref<T>;
  const useNotification: (...args: any[]) => any;

  const useToast: (...args: any[]) => any;
  const useEvent: (...args: any[]) => any;
  const useAbove: (...args: any[]) => any;
  const useField: (...args: any[]) => any;
  const createDebouncer: (...args: any[]) => any;
}

export {};
