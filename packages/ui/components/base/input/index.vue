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
    <div class="relative">
      <div
        v-if="icon && type !== 'textarea' && type !== 'file' && type !== 'date' && type !== 'tel'"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
      >
        <i
          :class="[
            'fa-solid',
            `fa-${icon}`,
            hasError ? 'text-red-500' : themeClass.icon.primary,
            sizeClass.icon,
          ]"
        />
      </div>

      <template v-if="type === 'textarea'">
        <textarea
          :id="id"
          :name="name"
          :placeholder="placeholder"
          :value="textValue"
          :disabled="isDisabled"
          :readonly="readonly"
          :autocomplete="autocomplete"
          :rows="rows"
          class="block w-full resize-y border align-top leading-normal shadow-sm transition focus:-translate-y-[1px] focus:ring-2 focus:outline-none"
          :class="[inputClass, roundedClass, sizeClass.font, sizeClass.wrapper, 'py-2.5']"
          :required="required"
          @input="handleInput"
          @blur="handleBlur"
        />
      </template>

      <template v-else-if="type === 'file'">
        <div class="relative w-full">
          <input
            :id="id"
            ref="inputRef"
            type="file"
            class="hidden"
            :name="name"
            :accept="accept"
            :disabled="isDisabled"
            :required="required"
            @change="handleFileChange"
            @blur="handleBlur"
          />

          <label
            :for="id"
            class="flex w-full items-center justify-center gap-2 border-2 border-dashed text-center shadow-sm transition focus-within:ring-2 hover:opacity-90 hover:shadow-md"
            :class="[
              inputClass,
              roundedClass,
              sizeClass.wrapper,
              controlHeightClass,
              isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
            ]"
          >
            <i
              :class="[
                'fa-solid fa-upload',
                hasError ? 'text-red-500' : themeClass.icon.primary,
                sizeClass.icon,
              ]"
            />
            <span :class="sizeClass.font">{{ loading ? 'Uploading...' : 'Upload File' }}</span>
          </label>
        </div>
      </template>

      <template v-else-if="type === 'tel'">
        <div class="flex w-full">
          <div class="relative shrink-0">
            <i
              :class="[
                'fa-solid fa-earth-asia pointer-events-none absolute top-1/2 left-3 -translate-y-1/2',
                hasError ? 'text-red-500' : themeClass.icon.primary,
                sizeClass.icon,
              ]"
            />
            <select
              :id="id ? `${id}-country` : undefined"
              v-model="selectedDialCode"
              :disabled="isDisabled"
              class="h-full rounded-l-xl border pr-7 pl-9 shadow-sm transition focus:ring-2 focus:outline-none"
              :class="[inputClass, sizeClass.font, sizeClass.wrapper, controlHeightClass]"
              @change="handleCountryCodeChange"
              @blur="handleBlur"
            >
              <option
                v-for="country in telCountryOptions"
                :key="country.code"
                :value="country.code"
              >
                +{{ country.code }} ({{ country.label }})
              </option>
            </select>
          </div>

          <input
            :id="id"
            ref="inputRef"
            type="tel"
            :name="name"
            inputmode="numeric"
            :placeholder="placeholder"
            :value="telLocalValue"
            :disabled="isDisabled"
            :readonly="readonly"
            :autocomplete="autocomplete"
            class="w-full rounded-r-xl border border-l-0 shadow-sm transition focus:ring-2 focus:outline-none"
            :class="[inputClass, sizeClass.font, sizeClass.wrapper, controlHeightClass]"
            :required="required"
            @input="updateTelValue"
            @blur="handleBlur"
          />
        </div>
      </template>

      <template v-else>
        <input
          :id="id"
          ref="inputRef"
          :type="computedType"
          :name="name"
          :placeholder="placeholder"
          :max="max"
          :min="min"
          :step="step"
          :value="formattedValue"
          :disabled="isDisabled"
          :readonly="readonly"
          :autocomplete="autocomplete"
          class="w-full border shadow-sm transition focus:-translate-y-[1px] focus:ring-2 focus:outline-none"
          :class="[
            inputClass,
            roundedClass,
            sizeClass.font,
            sizeClass.wrapper,
            controlHeightClass,
            { 'pl-10': icon, 'pr-10': isPassword },
          ]"
          :required="required"
          @input="handleInput"
          @blur="handleBlur"
        />

        <button
          v-if="isPassword"
          type="button"
          class="absolute inset-y-0 right-0 inline-flex h-full w-10 items-center justify-center"
          :disabled="isDisabled"
          @click="togglePassword"
        >
          <i
            :class="[
              'fa-solid',
              showPassword ? 'fa-eye-slash' : 'fa-eye',
              hasError ? 'text-red-500' : themeClass.icon.primary,
              sizeClass.icon,
            ]"
          />
        </button>
      </template>
    </div>
  </BaseFormField>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import type { FieldMeta } from 'vee-validate';
  import { useField } from 'vee-validate';
  import { useColorClass } from '../../../theme/useColorClass';
  import { FIELD_CONTROL_BY_SIZE, FIELD_TYPOGRAPHY_BY_SIZE } from '../../../theme/typography';
  import type { InputProps, InputSizeClass, TelCountryOption } from '@flowforge/types';

  const themeClass = useColorClass();
  const props = withDefaults(defineProps<InputProps>(), {
    id: '',
    name: undefined,
    type: 'text',
    label: '',
    modelValue: '',
    rows: '3',
    placeholder: '',
    icon: '',
    accept: '',
    required: false,
    disabled: false,
    variant: 'mist',
    autocomplete: 'off',
    rounded: 'xl',
    size: undefined,
    sizeVariant: 'md',
    helper: '',
    errorMessage: '',
    successMessage: '',
    touched: undefined,
    submitted: false,
    loading: false,
    readonly: false,
    min: undefined,
    max: undefined,
    step: undefined,
    telCountries: undefined,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | any[]): void;
    (e: 'update:file', file: File): void;
  }>();

  const field = props.name ? useField<string | number | Date | any[]>(props.name) : null;
  const fieldMeta = computed<FieldMeta<unknown> | undefined>(() => field?.meta);
  const showPassword = ref(false);
  const inputRef = ref<HTMLInputElement | null>(null);
  const telLocalValue = ref('');
  const defaultTelCountries: TelCountryOption[] = [
    { code: '62', label: 'ID' },
    { code: '65', label: 'SG' },
    { code: '60', label: 'MY' },
    { code: '1', label: 'US/CA' },
  ];

  const isPassword = computed(() => props.type === 'password');
  const computedType = computed(() =>
    isPassword.value ? (showPassword.value ? 'text' : 'password') : props.type
  );
  const activeSize = computed(() => props.size || props.sizeVariant || 'md');
  const roundedClass = computed(() => `rounded-${props.rounded || 'xl'}`);
  const telCountryOptions = computed<TelCountryOption[]>(() =>
    props.telCountries?.length ? props.telCountries : defaultTelCountries
  );
  const selectedDialCode = ref<string>(defaultTelCountries[0].code);
  const isDisabled = computed(() => props.disabled || props.loading);
  const model = computed({
    get: () => field?.value.value ?? props.modelValue,
    set: (value) => {
      emit('update:modelValue', value as string | number | any[]);
      if (field) field.setValue(value, false);
    },
  });

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

  const inputClass = computed(() => {
    const variantClass =
      themeClass.value.input?.[props.variant || 'mist'] || themeClass.value.input.mist;
    if (hasError.value) {
      return 'border-red-500 text-red-950 focus:ring-red-500 dark:border-red-400 dark:text-red-100 dark:focus:ring-red-400';
    }
    if (hasSuccess.value) {
      return `${variantClass} border-emerald-500 focus:ring-emerald-500 dark:border-emerald-400 dark:focus:ring-emerald-400`;
    }
    return variantClass;
  });

  const sizeClass = computed<InputSizeClass>(() => {
    const key = activeSize.value;
    return {
      font: FIELD_TYPOGRAPHY_BY_SIZE[key].input,
      wrapper: FIELD_CONTROL_BY_SIZE[key].px,
      icon: FIELD_TYPOGRAPHY_BY_SIZE[key].buttonIcon,
    };
  });
  const controlHeightClass = computed(() => FIELD_CONTROL_BY_SIZE[activeSize.value].height);
  const formattedValue = computed(() => {
    const value = model.value;
    if (props.type === 'date' && value instanceof Date) return value.toISOString().substring(0, 10);
    if (props.type === 'number' && typeof value === 'number') return value;
    if (value === null || value === undefined) return '';
    return String(value);
  });
  const textValue = computed(() => {
    const value = model.value;
    if (value === null || value === undefined) return '';
    return String(value);
  });

  function togglePassword() {
    showPassword.value = !showPassword.value;
  }

  function handleBlur() {
    if (field) {
      field.setTouched(true);
      void field.validate();
    }
  }

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (file) emit('update:file', file);
    handleBlur();
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    if (!target) return;

    if (props.type === 'number') {
      model.value = target.value === '' ? '' : Number(target.value);
      return;
    }
    if (props.type === 'date') {
      model.value = target.value ? target.value : '';
      return;
    }

    model.value = target.value;
  }

  function updateTelValue(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    telLocalValue.value = target.value.replace(/\D/g, '');
    emitPhoneNumber();
  }

  function handleCountryCodeChange() {
    emitPhoneNumber();
  }

  function emitPhoneNumber() {
    const local = telLocalValue.value.replace(/\D/g, '').replace(/^0+/, '');
    model.value = local ? `${selectedDialCode.value}${local}` : '';
  }

  function syncTelState(value: unknown) {
    const raw = String(value ?? '');
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      telLocalValue.value = '';
      return;
    }

    const sortedOptions = [...telCountryOptions.value].sort(
      (a, b) => b.code.length - a.code.length
    );
    const matched = sortedOptions.find((option) => digits.startsWith(option.code));
    if (matched) {
      selectedDialCode.value = matched.code;
      telLocalValue.value = digits.slice(matched.code.length);
      return;
    }
    telLocalValue.value = digits;
  }

  defineExpose({
    focus: () => inputRef.value?.focus?.(),
    $el: inputRef,
  });

  watch(
    () => [props.type, model.value, telCountryOptions.value] as const,
    ([type, value]) => {
      if (type !== 'tel') return;
      syncTelState(value);
    },
    { immediate: true }
  );

  watch(
    () => props.modelValue,
    (value) => {
      if (!field) return;
      if (value !== field.value.value) field.setValue(value, false);
    }
  );
</script>

<style scoped>
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
