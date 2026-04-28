<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="id"
      class="ui-label flex items-center gap-1"
      :class="[themeClass.text.secondary, disabled ? 'opacity-70' : '']"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="ui-caption text-red-500">*</span>
    </label>

    <slot />

    <p v-if="showError" class="ui-error mt-1 text-red-600 dark:text-red-400">
      {{ resolvedErrorMessage }}
    </p>
    <p v-else-if="showSuccess" class="ui-helper mt-1 text-emerald-600 dark:text-emerald-400">
      {{ successMessage }}
    </p>
    <p v-else-if="helper" class="ui-helper mt-1" :class="themeClass.text.subtleMeta">
      {{ helper }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    id?: string;
    label?: string;
    required?: boolean;
    helper?: string;
    errorMessage?: string;
    successMessage?: string;
    touched?: boolean;
    submitted?: boolean;
    invalid?: boolean;
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    id: '',
    label: '',
    required: false,
    helper: '',
    errorMessage: '',
    successMessage: '',
    touched: undefined,
    submitted: false,
    invalid: undefined,
    disabled: false,
  });

  const themeClass = useColorClass();

  const resolvedErrorMessage = computed(() => String(props.errorMessage || '').trim());
  const showError = computed(() => {
    if (!resolvedErrorMessage.value) return false;
    return Boolean(props.touched) || Boolean(props.submitted);
  });
  const showSuccess = computed(
    () => !showError.value && Boolean(props.successMessage) && props.invalid === false
  );
</script>
