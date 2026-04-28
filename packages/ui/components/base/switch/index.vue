<template>
  <BaseFormField
    :id="id"
    :label="label"
    :required="required"
    :helper="helper"
    :error-message="resolvedErrorMessage"
    :success-message="successMessage"
    :touched="resolvedTouched"
    :submitted="submitted"
    :invalid="hasError"
    :disabled="isDisabled"
  >
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :aria-disabled="isDisabled"
      :data-field-name="name"
      class="relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none"
      :class="[switchTrackClass, isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer']"
      @click="toggle"
      @blur="handleBlur"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
        :class="model ? 'translate-x-6' : 'translate-x-1'"
      />
    </button>
  </BaseFormField>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue';
  import type { FieldMeta } from 'vee-validate';
  import { useField } from 'vee-validate';
  import type { VariantKey } from '@flowforge/types';
  import { useColorClass } from '../../../theme/useColorClass';

  interface Props {
    id?: string;
    name?: string;
    label?: string;
    modelValue?: boolean;
    variant?: VariantKey;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    helper?: string;
    errorMessage?: string;
    successMessage?: string;
    touched?: boolean;
    submitted?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: '',
    name: undefined,
    label: '',
    modelValue: false,
    variant: undefined,
    required: false,
    disabled: false,
    loading: false,
    helper: '',
    errorMessage: '',
    successMessage: '',
    touched: undefined,
    submitted: false,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const themeClass = useColorClass();
  const field = props.name ? useField<boolean>(props.name, undefined, { type: 'checkbox' }) : null;
  const fieldMeta = computed<FieldMeta<unknown> | undefined>(() => field?.meta);

  const model = computed({
    get: () => field?.value.value ?? props.modelValue,
    set: (value: boolean) => {
      emit('update:modelValue', value);
      if (field) field.setValue(value, false);
    },
  });

  const isDisabled = computed(() => props.disabled || props.loading);
  const resolvedErrorMessage = computed(() =>
    String(props.errorMessage || field?.errorMessage.value || '').trim()
  );
  const fieldValidated = computed(() =>
    Boolean((fieldMeta.value as { validated?: boolean } | undefined)?.validated)
  );
  const resolvedTouched = computed(
    () => props.touched ?? fieldMeta.value?.touched ?? fieldValidated.value
  );
  const hasError = computed(
    () => Boolean(resolvedErrorMessage.value) && Boolean(resolvedTouched.value)
  );
  const hasSuccess = computed(
    () =>
      !hasError.value &&
      (Boolean(props.successMessage) || (fieldMeta.value?.valid && resolvedTouched.value))
  );

  const switchTrackClass = computed(() => {
    if (hasError.value) {
      return 'border-red-500 bg-red-500/20 focus:ring-red-500';
    }
    if (hasSuccess.value) {
      return 'border-emerald-500 bg-emerald-500/20 focus:ring-emerald-500';
    }
    if (model.value) {
      return props.variant
        ? `${themeClass.value.background[props.variant]} ${themeClass.value.ring[props.variant]} ${themeClass.value.border[props.variant]}`
        : `${themeClass.value.background.primary} ${themeClass.value.ring.primary} ${themeClass.value.border.primary}`;
    }
    return `${themeClass.value.background.gray} ${themeClass.value.border.gray} focus:ring-slate-400`;
  });

  const toggle = () => {
    if (isDisabled.value) return;
    model.value = !model.value;
    if (field) {
      field.setTouched(true);
      void field.validate();
    }
  };

  const handleBlur = () => {
    if (field) {
      field.setTouched(true);
      void field.validate();
    }
  };

  watch(
    () => props.modelValue,
    (value) => {
      if (!field) return;
      if (value !== field.value.value) field.setValue(Boolean(value), false);
    }
  );
</script>
