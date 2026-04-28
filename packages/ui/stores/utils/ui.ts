import { useState } from '#imports';

type ConfirmTone = 'danger' | 'warning' | 'info' | 'success';

type UIConfirmState = {
  showConfirm: boolean;
  confirmTitle: string;
  confirmMessage: string;
  confirmRequireReason: boolean;
  confirmTone: ConfirmTone;
  confirmLabel: string;
  cancelLabel: string;
  confirmReason: string;
  onConfirm?: (() => void) | null;
  onCancel?: (() => void) | null;
};

const defaultState = (): UIConfirmState => ({
  showConfirm: false,
  confirmTitle: '',
  confirmMessage: '',
  confirmRequireReason: false,
  confirmTone: 'warning',
  confirmLabel: 'Ya, Lanjutkan',
  cancelLabel: 'Batal',
  confirmReason: '',
  onConfirm: null,
  onCancel: null,
});

export function useUIStore() {
  const state = useState<UIConfirmState>('ui-confirm-state', defaultState);

  const reset = () => {
    state.value = defaultState();
  };

  return {
    get showConfirm() {
      return state.value.showConfirm;
    },
    set showConfirm(value: boolean) {
      state.value.showConfirm = value;
    },
    get confirmTitle() {
      return state.value.confirmTitle;
    },
    set confirmTitle(value: string) {
      state.value.confirmTitle = value;
    },
    get confirmMessage() {
      return state.value.confirmMessage;
    },
    set confirmMessage(value: string) {
      state.value.confirmMessage = value;
    },
    get confirmRequireReason() {
      return state.value.confirmRequireReason;
    },
    set confirmRequireReason(value: boolean) {
      state.value.confirmRequireReason = value;
    },
    get confirmTone() {
      return state.value.confirmTone;
    },
    set confirmTone(value: ConfirmTone) {
      state.value.confirmTone = value;
    },
    get confirmLabel() {
      return state.value.confirmLabel;
    },
    set confirmLabel(value: string) {
      state.value.confirmLabel = value;
    },
    get cancelLabel() {
      return state.value.cancelLabel;
    },
    set cancelLabel(value: string) {
      state.value.cancelLabel = value;
    },
    get confirmReason() {
      return state.value.confirmReason;
    },
    set confirmReason(value: string) {
      state.value.confirmReason = value;
    },
    openConfirm(config: Partial<UIConfirmState> = {}) {
      state.value = {
        ...defaultState(),
        ...config,
        showConfirm: true,
      };
    },
    confirmYes() {
      state.value.onConfirm?.();
      reset();
    },
    confirmNo() {
      state.value.onCancel?.();
      reset();
    },
    pauseToast() {},
    resumeToast() {},
  };
}
