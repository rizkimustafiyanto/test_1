<template>
  <BaseFormField
    :id="id"
    :label="label"
    :required="required"
    :helper="helper"
    :error-message="errorMessage"
    :success-message="successMessage"
    :touched="touched"
    :submitted="submitted"
    :invalid="hasError"
    :disabled="isDisabled"
  >
    <div class="relative cursor-text">
      <input
        :id="id"
        ref="inputRef"
        :name="name"
        type="text"
        :value="sanitizedValue"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :maxlength="length"
        :disabled="isDisabled"
        class="otp-input"
        :aria-label="label || 'Kode OTP'"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div
        class="otp-dashes"
        :class="[themeClass.text.secondary, isDisabled ? 'opacity-60' : '']"
        :style="{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }"
        aria-hidden="true"
      >
        <span v-for="(slot, idx) in otpSlots" :key="idx" class="otp-slot" :class="slotClass">
          {{ slot }}
        </span>
      </div>
    </div>
  </BaseFormField>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useColorClass } from '../../../theme/useColorClass';
  import type { OtpInputProps } from '@flowforge/types';

  const props = withDefaults(defineProps<OtpInputProps>(), {
    id: '',
    name: undefined,
    label: '',
    modelValue: '',
    length: 6,
    required: false,
    disabled: false,
    loading: false,
    helper: '',
    errorMessage: '',
    successMessage: '',
    touched: undefined,
    submitted: false,
    autocomplete: 'one-time-code',
    inputmode: 'numeric',
    placeholderChar: '-',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const themeClass = useColorClass();
  const inputRef = ref<HTMLInputElement | null>(null);
  const focused = ref(false);

  const isDisabled = computed(() => props.disabled || props.loading);
  const hasError = computed(
    () => Boolean(props.errorMessage) && (Boolean(props.touched) || Boolean(props.submitted))
  );

  const sanitize = (value: string) => value.replace(/\D/g, '').slice(0, props.length);

  const sanitizedValue = computed(() => sanitize(String(props.modelValue ?? '')));

  const otpSlots = computed(() => {
    const digits = sanitizedValue.value.split('');
    return Array.from({ length: props.length }, (_, idx) => digits[idx] ?? props.placeholderChar);
  });

  const slotClass = computed(() => {
    if (hasError.value) return 'border-red-500';
    if (focused.value) return themeClass.value.border.primary;
    return themeClass.value.border.secondary;
  });

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const digits = sanitize(target.value);
    if (digits !== props.modelValue) emit('update:modelValue', digits);
  }

  function handleFocus() {
    focused.value = true;
  }

  function handleBlur() {
    focused.value = false;
  }

  defineExpose({
    focus: () => inputRef.value?.focus?.(),
    $el: inputRef,
  });
</script>

<style scoped>
  .otp-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: 0;
    outline: none;
    color: transparent;
    caret-color: transparent;
  }

  .otp-dashes {
    display: grid;
    gap: 8px;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-size: 18px;
    letter-spacing: 0.2em;
    text-align: center;
  }

  .otp-slot {
    min-height: 32px;
    border-bottom-width: 1px;
    border-bottom-style: dashed;
    padding-bottom: 6px;
  }
</style>
