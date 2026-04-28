<template>
  <article
    class="overflow-hidden rounded-xl border p-3 shadow-[0_4px_14px_rgba(15,23,42,0.04)]"
    :class="[
      themeClass.border.secondary,
      item.readAt ? themeClass.backgroundless.secondary : themeClass.background.airy,
    ]"
  >
    <div class="flex items-start gap-3">
      <div
        class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
        :class="toneIconBoxClass(item.tone)"
      >
        <i :class="[toneIcon(item.tone), 'text-xs leading-none', toneIconClass(item.tone)]" />
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p class="ui-caption truncate font-semibold" :class="themeClass.text.secondary">
            {{ item.title || toneLabel(item.tone) }}
          </p>
          <span
            v-if="showTimestamp"
            class="ui-caption shrink-0 whitespace-nowrap"
            :class="themeClass.text.subtleMeta"
          >
            {{ formattedTime }}
          </span>
        </div>

        <p class="ui-body-sm break-words" :class="themeClass.text.subtleMeta">
          {{ item.message }}
        </p>

        <div v-if="showActions" class="flex flex-wrap items-center gap-2 pt-1">
          <button
            v-if="item.readAt === null"
            type="button"
            class="ui-caption rounded-md px-2 py-1 whitespace-nowrap transition hover:opacity-80"
            :class="themeClass.text.info"
            @click="$emit('mark-read', item.id)"
          >
            Mark read
          </button>
          <button
            v-else
            type="button"
            class="ui-caption rounded-md px-2 py-1 whitespace-nowrap transition hover:opacity-80"
            :class="themeClass.text.info"
            @click="$emit('mark-unread', item.id)"
          >
            Mark unread
          </button>
          <button
            v-if="item.dismissible"
            type="button"
            class="ui-caption rounded-md px-2 py-1 whitespace-nowrap transition hover:opacity-80"
            :class="themeClass.text.danger"
            @click="$emit('dismiss', item.id)"
          >
            Dismiss
          </button>
          <button
            v-if="item.targetPath"
            type="button"
            class="ui-caption rounded-md px-2 py-1 whitespace-nowrap transition hover:opacity-80"
            :class="themeClass.text.secondary"
            @click="$emit('open-target', item.id)"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { NotificationItem, NotificationTone } from '@flowforge/types';

  const props = withDefaults(
    defineProps<{
      item: NotificationItem;
      showActions?: boolean;
      showTimestamp?: boolean;
    }>(),
    {
      showActions: true,
      showTimestamp: true,
    }
  );

  defineEmits<{
    (e: 'mark-read', id: string): void;
    (e: 'mark-unread', id: string): void;
    (e: 'dismiss', id: string): void;
    (e: 'open-target', id: string): void;
  }>();

  const themeClass = useColorClass();

  const formattedTime = computed(() =>
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(props.item.createdAt)
  );

  const toneLabel = (tone: NotificationTone): string => {
    if (tone === 'success') return 'Success';
    if (tone === 'error') return 'Error';
    if (tone === 'warning') return 'Warning';
    return 'Info';
  };

  const toneIcon = (tone: NotificationTone): string => {
    if (tone === 'success') return 'fas fa-circle-check';
    if (tone === 'error') return 'fas fa-circle-xmark';
    if (tone === 'warning') return 'fas fa-triangle-exclamation';
    return 'fas fa-circle-info';
  };

  const toneIconClass = (tone: NotificationTone): string => {
    if (tone === 'success') return themeClass.value.text.success;
    if (tone === 'error') return themeClass.value.text.danger;
    if (tone === 'warning') return themeClass.value.text.warning;
    return themeClass.value.text.info;
  };

  const toneIconBoxClass = (tone: NotificationTone): string => {
    if (tone === 'success') return themeClass.value.border.success;
    if (tone === 'error') return themeClass.value.border.danger;
    if (tone === 'warning') return themeClass.value.border.warning;
    return themeClass.value.border.info;
  };
</script>
