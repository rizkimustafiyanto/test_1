<template>
  <div class="space-y-2">
    <div
      class="flex flex-col gap-2 rounded-xl border border-dashed p-3"
      :class="[themeClass.border.airy, themeClass.background.secondary]"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <p class="ui-label" :class="themeClass.text.secondary">
            {{ label }}
          </p>
          <p class="ui-helper" :class="themeClass.text.subtleMeta">
            {{ fileLabel }}
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <BaseButton
            variant="mist"
            :size="sizeVariant"
            :disabled="disabled"
            icon="fa-solid fa-file-arrow-up"
            @click="triggerSelect"
          >
            Pilih File
          </BaseButton>
          <BaseButton
            v-if="modelValue"
            variant="mist"
            :size="sizeVariant"
            :disabled="disabled"
            icon="fa-solid fa-xmark"
            @click="clearFile"
          />
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        :disabled="disabled"
        @change="handleFileChange"
      />
    </div>

    <p v-if="helper && !errorMessage" class="ui-helper" :class="themeClass.text.subtleMeta">
      {{ helper }}
    </p>
    <p v-else-if="errorMessage" class="ui-error" :class="themeClass.text.danger">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  const themeClass = useColorClass();

  const props = defineProps<{
    modelValue?: File | null;
    accept?: string;
    label?: string;
    helper?: string;
    maxSizeMb?: number;
    allowedExtensions?: string[];
    sizeVariant?: 'xs' | 'sm' | 'md' | 'lg';
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: File | null): void;
    (e: 'validation-error', message: string): void;
  }>();

  const fileInput = ref<HTMLInputElement | null>(null);

  const label = computed(() => props.label ?? 'Upload File');
  const errorMessage = ref('');
  const fileLabel = computed(() => {
    if (!props.modelValue) return 'Belum ada file dipilih';
    const sizeKb = Math.round(props.modelValue.size / 1024);
    return `${props.modelValue.name} (${sizeKb} KB)`;
  });

  const triggerSelect = () => {
    fileInput.value?.click();
  };

  const clearFile = () => {
    if (fileInput.value) fileInput.value.value = '';
    errorMessage.value = '';
    emit('update:modelValue', null);
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    if (!file) {
      clearFile();
      return;
    }

    if (props.allowedExtensions?.length) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const allowed = props.allowedExtensions.map((v) => v.toLowerCase());
      if (!allowed.includes(ext)) {
        const message = `Ekstensi file tidak didukung. Gunakan: ${allowed.join(', ')}`;
        errorMessage.value = message;
        emit('validation-error', message);
        if (fileInput.value) fileInput.value.value = '';
        emit('update:modelValue', null);
        return;
      }
    }

    if (props.maxSizeMb) {
      const maxBytes = props.maxSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        const message = `Ukuran file terlalu besar. Maksimal ${props.maxSizeMb}MB`;
        errorMessage.value = message;
        emit('validation-error', message);
        if (fileInput.value) fileInput.value.value = '';
        emit('update:modelValue', null);
        return;
      }
    }

    errorMessage.value = '';
    emit('update:modelValue', file);
  };
</script>
