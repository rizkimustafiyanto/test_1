<template>
  <BaseModal
    :model-value="modelValue"
    :title="payload?.title || 'Detail'"
    :size="size || '3xl'"
    @update:model-value="emit('update:modelValue', $event)"
    @close="emit('close')"
  >
    <div class="space-y-4 sm:space-y-5">
      <div class="space-y-1">
        <p v-if="payload?.subtitle" class="ui-caption" :class="themeClass.text.subtleMeta">
          {{ payload.subtitle }}
        </p>
        <p v-if="payload?.dateLabel" class="ui-caption ui-tabular" :class="themeClass.text.stone">
          {{ payload.dateLabel }}
        </p>
      </div>

      <div
        v-if="payload?.imageSrc"
        class="overflow-hidden rounded-xl border"
        :class="themeClass.border.airy"
      >
        <img
          :src="payload.imageSrc"
          :alt="payload.imageAlt || payload.title"
          class="max-h-[42dvh] w-full object-cover"
        />
      </div>

      <div
        v-if="payload?.meta?.length"
        class="grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-2"
        :class="[themeClass.background.airy, themeClass.border.airy]"
      >
        <div v-for="item in payload.meta" :key="`${item.label}-${item.value}`" class="min-w-0">
          <p class="ui-caption" :class="themeClass.text.subtleMeta">{{ item.label }}</p>
          <p class="ui-body-sm break-words" :class="themeClass.text.secondary">{{ item.value }}</p>
        </div>
      </div>

      <div class="rounded-xl p-1 sm:p-2">
        <slot name="content" :payload="payload">
          <div
            v-if="payload?.contentHtml"
            ref="htmlContainer"
            class="ui-body leading-relaxed break-words whitespace-pre-wrap"
            :class="themeClass.text.secondary"
          />
          <p
            v-else-if="payload?.contentText"
            class="ui-body leading-relaxed break-words whitespace-pre-wrap"
            :class="themeClass.text.secondary"
          >
            {{ payload.contentText }}
          </p>
          <p v-else class="ui-caption italic" :class="themeClass.text.subtleMeta">
            Tidak ada detail tambahan.
          </p>
        </slot>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { ContentModalPayload } from '@flowforge/types';

  const props = defineProps<{
    modelValue: boolean;
    payload: ContentModalPayload | null;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'close'): void;
  }>();

  const themeClass = useColorClass();
  const htmlContainer = ref<HTMLElement | null>(null);

  const FORBIDDEN_TAGS = new Set([
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'link',
    'meta',
    'base',
    'form',
  ]);

  const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'formaction']);

  const isUnsafeUrl = (value: string): boolean => {
    const normalized = value.trim().toLowerCase();
    return normalized.startsWith('javascript:') || normalized.startsWith('vbscript:');
  };

  const sanitizeHtml = (html: string): string => {
    if (!html || typeof window === 'undefined') return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const elements = doc.body.querySelectorAll('*');
    elements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();

      if (FORBIDDEN_TAGS.has(tagName)) {
        el.remove();
        return;
      }

      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value || '';

        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }

        if (URL_ATTRS.has(name) && isUnsafeUrl(value)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  };

  watch(
    () => [htmlContainer.value, props.payload?.contentHtml] as const,
    () => {
      if (!htmlContainer.value) return;
      htmlContainer.value.innerHTML = sanitizeHtml(props.payload?.contentHtml || '');
    },
    { immediate: true }
  );
</script>
