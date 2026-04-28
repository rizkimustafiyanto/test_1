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
    <div
      ref="toggleRef"
      class="flex w-full items-center justify-between border shadow-sm transition-all duration-200"
      :data-field-name="name"
      :tabindex="isDisabled ? -1 : 0"
      :class="[
        selectClass,
        sizeClass.wrapper,
        sizeClass.font,
        sizeClass.radius,
        isDisabled
          ? 'cursor-not-allowed opacity-70'
          : 'cursor-pointer focus-within:ring-2 hover:-translate-y-[1px] hover:shadow-md',
      ]"
      @click="!isDisabled && toggleDropdown()"
    >
      <span class="block truncate" :class="sizeClass.font">
        {{ selectedLabel || placeholder || 'Pilih opsi' }}
      </span>
      <div class="flex items-center gap-2">
        <button
          v-if="clearable && hasSelection && !isDisabled"
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-md"
          :class="[themeClass.icon.secondary, sizeClass.icon, sizeClass.clearButton]"
          aria-label="Hapus pilihan"
          @click.stop="clearSelection"
        >
          <i class="fa-solid fa-xmark" />
        </button>
        <i
          :class="[
            dropdownOpen ? 'fa-solid fa-angle-up' : 'fa-solid fa-angle-down',
            sizeClass.icon,
            hasError ? 'text-red-500' : themeClass.icon.primary,
          ]"
        />
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="dropdownOpen && !isDisabled"
        ref="dropdownRef"
        :style="dropdownStyles"
        class="scrollbar-none absolute z-[1205] mt-1 max-h-60 overflow-auto rounded-xl border shadow-2xl"
        :class="[themeClass.select.dark, sizeClass.dropdown]"
      >
        <BaseInput
          v-if="type === 'search'"
          ref="searchInputRef"
          v-model="searchTerm"
          :placeholder="searchPlaceholder || 'Cari opsi...'"
          icon="magnifying-glass"
          class="sticky top-0 z-10 px-2 py-2"
          rounded="xl"
          :size-variant="sizeVariant"
        />

        <div
          v-if="isEmptyOptions"
          class="px-4 py-2 text-center"
          :class="[(themeClass.baseDiv as Record<string, string>)['dark'], sizeClass.font]"
        >
          {{ emptyMessage }}
        </div>

        <div
          v-for="option in normalizedOptions"
          :key="option.value"
          class="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 transition"
          :class="[themeClass.item.dark, sizeClass.option, themeClass.hover.smooth]"
          @click="selectOption(option)"
        >
          <i v-if="option.icon" :class="[option.icon, themeClass.icon.secondary]" />
          <span class="truncate">{{ option.label }}</span>
        </div>
      </div>
    </teleport>
  </BaseFormField>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
  import type { FieldMeta } from 'vee-validate';
  import { useField } from 'vee-validate';
  import { createDebouncer } from '../../../utils/debounce';
  import { useColorClass } from '../../../theme/useColorClass';
  import { FIELD_CONTROL_BY_SIZE, FIELD_TYPOGRAPHY_BY_SIZE } from '../../../theme/typography';
  import type { SelectOption, SelectProps } from '@flowforge/types';

  const themeClass = useColorClass();
  const props = withDefaults(defineProps<SelectProps>(), {
    id: '',
    name: undefined,
    label: '',
    modelValue: '',
    options: () => [],
    placeholder: 'Pilih opsi',
    type: 'default',
    searchPlaceholder: 'Cari...',
    onSearch: undefined,
    emptyStateText: '',
    notFoundText: '',
    clearable: false,
    clearValue: '',
    disabled: false,
    sizeVariant: 'md',
    required: false,
    helper: '',
    errorMessage: '',
    successMessage: '',
    touched: undefined,
    submitted: false,
    loading: false,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
  }>();

  const field = props.name ? useField<string | number>(props.name) : null;
  const fieldMeta = computed<FieldMeta<unknown> | undefined>(() => field?.meta);
  const dropdownOpen = ref(false);
  const toggleRef = ref<HTMLElement | null>(null);
  const dropdownRef = ref<HTMLElement | null>(null);
  const searchInputRef = ref<HTMLInputElement | null>(null);
  const searchTerm = ref('');
  const selectedLabelCache = ref<string>('');
  const dropdownStyles = reactive({ top: '0px', left: '0px', width: 'auto' });

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

  const model = computed({
    get: () => field?.value.value ?? props.modelValue ?? '',
    set: (value: string | number) => {
      emit('update:modelValue', value);
      if (field) field.setValue(value, false);
    },
  });

  const selectClass = computed(() => {
    if (hasError.value) {
      return 'border-red-500 text-red-950 focus:ring-red-500 dark:border-red-400 dark:text-red-100 dark:focus:ring-red-400';
    }
    if (hasSuccess.value) {
      return `${themeClass.value.select.mist} border-emerald-500 focus:ring-emerald-500 dark:border-emerald-400`;
    }
    return themeClass.value.select.mist;
  });

  const sizeClass = computed(() => {
    const key = props.sizeVariant || 'md';
    return {
      font: FIELD_TYPOGRAPHY_BY_SIZE[key].select,
      wrapper: `${FIELD_CONTROL_BY_SIZE[key].px} ${FIELD_CONTROL_BY_SIZE[key].height}`,
      radius: FIELD_CONTROL_BY_SIZE[key].radius,
      clearButton: FIELD_CONTROL_BY_SIZE[key].clearButton,
      option: FIELD_TYPOGRAPHY_BY_SIZE[key].select,
      icon: FIELD_TYPOGRAPHY_BY_SIZE[key].buttonIcon,
      dropdown: FIELD_TYPOGRAPHY_BY_SIZE[key].select,
    };
  });

  const normalizedOptions = computed(() => {
    const raw = props.options as unknown;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray((raw as { value?: unknown }).value)) {
      return (raw as { value: SelectOption[] }).value;
    }
    return [];
  });
  const selectedLabel = computed(() => {
    const found = normalizedOptions.value.find((opt) => opt.value === model.value)?.label ?? '';
    if (found) return found;
    if (hasSelection.value) return selectedLabelCache.value;
    return '';
  });
  const hasSelection = computed(
    () => model.value !== undefined && model.value !== null && String(model.value) !== ''
  );
  const isEmptyOptions = computed(() => normalizedOptions.value.length === 0);
  const emptyMessage = computed(() => {
    const contextLabel = props.label?.trim() || 'Data';
    const keyword = searchTerm.value.trim();
    if (props.type === 'search' && keyword.length > 0)
      return props.notFoundText || `${contextLabel} tidak ditemukan.`;
    return props.emptyStateText || `${contextLabel} masih kosong.`;
  });

  const toggleDropdown = async () => {
    dropdownOpen.value = !dropdownOpen.value;
    if (!dropdownOpen.value) return;
    await nextTick();
    positionDropdown();
    if (props.type === 'search' && searchInputRef.value) searchInputRef.value.focus();
  };

  const positionDropdown = () => {
    if (!toggleRef.value) return;
    const rect = toggleRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = dropdownRef.value ? Math.min(dropdownRef.value.scrollHeight, 240) : 240;

    dropdownStyles.top =
      spaceBelow < dropdownHeight
        ? `${rect.top + window.scrollY - dropdownHeight}px`
        : `${rect.bottom + window.scrollY}px`;
    dropdownStyles.left = `${rect.left + window.scrollX}px`;
    dropdownStyles.width = `${rect.width}px`;
  };

  const selectOption = (option: SelectOption) => {
    if (isDisabled.value) return;
    selectedLabelCache.value = option.label;
    model.value = option.value;
    if (field) {
      field.setTouched(true);
      void field.validate();
    }
    dropdownOpen.value = false;
  };

  const clearSelection = () => {
    selectedLabelCache.value = '';
    model.value = props.clearValue ?? '';
    if (field) {
      field.setTouched(true);
      void field.validate();
    }
    dropdownOpen.value = false;
  };

  const doSearch = createDebouncer(async (val: string) => {
    if (props.onSearch) await props.onSearch(val);
  }, 400);

  watch(searchTerm, (val) => {
    if (props.type === 'search') doSearch(val);
  });

  watch(
    () => props.modelValue,
    (value) => {
      if (!field) return;
      if (value !== field.value.value) field.setValue(value ?? '', false);
    }
  );

  watch(
    () => [model.value, normalizedOptions.value] as const,
    ([value, options]) => {
      const found = options.find((opt) => opt.value === value)?.label ?? '';
      if (found) selectedLabelCache.value = found;
      if (value === '' || value === null || value === undefined) selectedLabelCache.value = '';
    },
    { immediate: true }
  );

  const onClickOutside = (event: Event) => {
    if (!toggleRef.value || !dropdownRef.value) return;
    const target = event.target as Node;
    if (toggleRef.value.contains(target) || dropdownRef.value.contains(target)) return;
    dropdownOpen.value = false;
  };

  onMounted(() => {
    if (!import.meta.client) return;
    document.addEventListener('click', onClickOutside);
    window.addEventListener('resize', positionDropdown);
    window.addEventListener('scroll', positionDropdown, true);
  });

  onUnmounted(() => {
    if (!import.meta.client) return;
    document.removeEventListener('click', onClickOutside);
    window.removeEventListener('resize', positionDropdown);
    window.removeEventListener('scroll', positionDropdown, true);
  });
</script>
