import { computed } from 'vue';
import { useState } from '#imports';
import type { ContentModalPayload, ContentModalState } from '@flowforge/types';

const defaultState = (): ContentModalState => ({
  isOpen: false,
  payload: null,
});

export function useContentModal() {
  const state = useState<ContentModalState>('content-modal-state', defaultState);

  const open = (payload: ContentModalPayload) => {
    state.value = {
      isOpen: true,
      payload,
    };
  };

  const close = () => {
    state.value.isOpen = false;
  };

  const reset = () => {
    state.value = defaultState();
  };

  return {
    isOpen: computed(() => state.value.isOpen),
    payload: computed(() => state.value.payload),
    open,
    close,
    reset,
  };
}
