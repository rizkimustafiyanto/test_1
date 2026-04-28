<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1150] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="onCancel"
      >
        <transition name="modal-scale">
          <div
            v-if="modelValue"
            class="relative mx-0 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:mx-4 sm:max-h-[90vh] sm:rounded-2xl"
            :class="panelClass"
          >
            <div
              class="relative overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5"
              :class="panelClass"
            >
              <div
                class="pointer-events-none absolute -top-14 -right-14 h-36 w-36 rounded-full blur-2xl"
                :class="glowClass"
              />

              <div class="relative space-y-4">
                <div class="flex flex-col items-center gap-3 text-center">
                  <div
                    class="inline-grid h-14 w-14 place-items-center rounded-2xl border shadow-sm"
                    :class="iconBoxClass"
                  >
                    <i :class="[toneIcon, toneIconClass, 'text-xl leading-none']" />
                  </div>

                  <div class="space-y-1">
                    <p
                      class="ui-caption inline-flex rounded-full border px-2.5 py-1"
                      :class="toneChipClass"
                    >
                      {{ toneLabel }}
                    </p>
                    <p class="ui-body-strong" :class="themeClass.text.secondary">
                      {{ title }}
                    </p>
                    <div class="w-full space-y-2 text-left">
                      <template
                        v-for="(block, index) in messageBlocks"
                        :key="`${block.type}-${index}`"
                      >
                        <ul
                          v-if="block.type === 'list'"
                          class="ui-body-sm list-disc space-y-1 pl-5 leading-relaxed"
                          :class="themeClass.text.subtleMeta"
                        >
                          <li
                            v-for="(item, itemIndex) in block.items"
                            :key="`${item}-${itemIndex}`"
                          >
                            {{ item }}
                          </li>
                        </ul>
                        <p
                          v-else
                          class="ui-body-sm leading-relaxed whitespace-pre-line"
                          :class="themeClass.text.subtleMeta"
                        >
                          {{ block.text }}
                        </p>
                      </template>
                    </div>
                  </div>
                </div>

                <div
                  v-if="requireReason"
                  class="space-y-1 rounded-xl border p-3"
                  :class="reasonBoxClass"
                >
                  <BaseInput
                    v-model="reason"
                    type="textarea"
                    rows="3"
                    label="Alasan"
                    placeholder="Tulis alasan secara singkat"
                    :error-message="reasonError"
                  />
                  <p class="ui-caption" :class="themeClass.text.subtleMeta">
                    Alasan akan tersimpan sebagai catatan aksi.
                  </p>
                </div>

                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <BaseButton variant="secondary" class="w-full" @click="onCancel">
                    {{ cancelLabel }}
                  </BaseButton>
                  <BaseButton
                    :variant="confirmButtonVariant"
                    class="w-full"
                    :disabled="isConfirmDisabled"
                    @click="onConfirm"
                  >
                    {{ confirmLabel }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { useColorClass } from '../../../theme/useColorClass';
  import { useUIStore } from '../../../stores/utils/ui';

  const themeClass = useColorClass();
  const ui = useUIStore();

  const modelValue = computed<boolean>({
    get: () => ui.showConfirm,
    set: (v) => (ui.showConfirm = v),
  });

  const title = computed<string>(() => ui.confirmTitle || 'Konfirmasi');
  const message = computed<string>(() => ui.confirmMessage);
  const requireReason = computed<boolean>(() => ui.confirmRequireReason);
  const confirmTone = computed<'danger' | 'warning' | 'info' | 'success'>(
    () => ui.confirmTone || 'warning'
  );
  const confirmLabel = computed<string>(() => ui.confirmLabel || 'Ya, Lanjutkan');
  const cancelLabel = computed<string>(() => ui.cancelLabel || 'Batal');
  const reason = computed<string>({
    get: () => ui.confirmReason,
    set: (value) => (ui.confirmReason = value),
  });
  const isConfirmDisabled = computed<boolean>(
    () => requireReason.value && String(reason.value || '').trim().length === 0
  );
  const reasonError = computed<string>(() =>
    isConfirmDisabled.value ? 'Alasan wajib diisi sebelum melanjutkan.' : ''
  );

  const confirmButtonVariant = computed<'danger' | 'warning' | 'teal' | 'secondary'>(() => {
    if (confirmTone.value === 'danger') return 'danger';
    if (confirmTone.value === 'success') return 'teal';
    if (confirmTone.value === 'info') return 'secondary';
    return 'warning';
  });

  const toneLabel = computed<string>(() => {
    if (confirmTone.value === 'danger') return 'Aksi Berisiko';
    if (confirmTone.value === 'success') return 'Perlu Konfirmasi';
    if (confirmTone.value === 'info') return 'Informasi';
    return 'Perhatian';
  });

  const toneIcon = computed<string>(() => {
    if (confirmTone.value === 'danger') return 'fa-solid fa-triangle-exclamation';
    if (confirmTone.value === 'success') return 'fa-solid fa-circle-check';
    if (confirmTone.value === 'info') return 'fa-solid fa-circle-info';
    return 'fa-solid fa-circle-exclamation';
  });

  const panelClass = computed<string>(() =>
    [themeClass.value.border.secondary, themeClass.value.baseDiv.default].join(' ')
  );

  const reasonBoxClass = computed<string>(() => {
    return [themeClass.value.border.secondary, themeClass.value.baseDiv.default].join(' ');
  });

  const iconBoxClass = computed<string>(() =>
    [themeClass.value.border.secondary, themeClass.value.background.secondary].join(' ')
  );

  const toneIconClass = computed<string>(() => {
    if (confirmTone.value === 'danger') return themeClass.value.text.danger;
    if (confirmTone.value === 'success') return themeClass.value.text.success;
    if (confirmTone.value === 'info') return themeClass.value.text.info;
    return themeClass.value.text.warning;
  });

  const toneChipClass = computed<string>(() =>
    [
      themeClass.value.border.secondary,
      themeClass.value.text.secondary,
      themeClass.value.background.airy,
    ].join(' ')
  );

  const glowClass = computed<string>(() => 'bg-slate-400/20');

  type MessageBlock =
    | {
        type: 'paragraph';
        text: string;
      }
    | {
        type: 'list';
        items: string[];
      };

  const messageBlocks = computed<MessageBlock[]>(() => {
    const normalized = String(message.value ?? '')
      .replace(/\r\n/g, '\n')
      .trim();

    if (!normalized) {
      return [];
    }

    const sections = normalized
      .split(/\n{2,}/)
      .map((section) => section.trim())
      .filter((section) => section.length > 0);

    return sections.map<MessageBlock>((section) => {
      const lines = section
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const isList =
        lines.length > 1 && lines.every((line) => /^([-*•]\s+|\d+[\).]\s+)/.test(line));

      if (isList) {
        return {
          type: 'list',
          items: lines.map((line) => line.replace(/^([-*•]\s+|\d+[\).]\s+)/, '').trim()),
        };
      }

      return {
        type: 'paragraph',
        text: section,
      };
    });
  });

  function onConfirm() {
    if (isConfirmDisabled.value) return;
    ui.confirmYes();
  }

  function onCancel() {
    ui.confirmNo();
  }
</script>
