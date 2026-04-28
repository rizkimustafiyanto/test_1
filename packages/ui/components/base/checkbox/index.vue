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
    <label class="inline-flex items-center gap-2">
      <input
        :id="id"
        :name="name"
        type="checkbox"
        :checked="model"
        :disabled="isDisabled"
        class="h-4 w-4 rounded border transition focus:ring-2"
        :class="checkboxClass"
        @change="onChange"
        @blur="onBlur"
      />
      <span v-if="caption" class="ui-body-sm" :class="themeClass.text.secondary">
        {{ caption }}
      </span>
    </label>
  </BaseFormField>
</template>

<script setup lang="ts">
  import { computed, watch } from 'vue';
  import type { FieldMeta } from 'vee-validate';
  import { useField } from 'vee-validate';
  import { useColorClass } from '../../../theme/useColorClass';

  interface Props {
    id?: string;
    name?: string;
    label?: string;
    caption?: string;
    modelValue?: boolean;
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
    caption: '',
    modelValue: false,
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

  const checkboxClass = computed(() => {
    if (hasError.value) return 'border-red-500 text-red-500 focus:ring-red-500';
    if (hasSuccess.value) return 'border-emerald-500 text-emerald-500 focus:ring-emerald-500';
    return 'border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-600';
  });

  const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    model.value = target.checked;
    if (field) {
      field.setTouched(true);
      void field.validate();
    }
  };

  const onBlur = () => {
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
