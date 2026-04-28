<template>
  <section
    v-show="visible"
    :class="[
      'fixed top-18 right-3 left-3 z-50 max-h-[min(70dvh,30rem)] overflow-hidden rounded-2xl border shadow-[0_18px_34px_rgba(15,23,42,0.16)] sm:top-21 sm:right-6 sm:left-auto sm:w-[24rem]',
      panelClass,
    ]"
    aria-label="Notifications"
  >
    <header
      :class="['flex items-center justify-between border-b px-4 py-3', themeClass.border.secondary]"
    >
      <p class="ui-caption tracking-wide uppercase" :class="themeClass.text.secondary">
        Notifications
      </p>
      <div class="flex items-center gap-2">
        <BaseBadge
          :variant-text="enabled ? 'info' : 'warning'"
          :variant-b-g-color="enabled ? 'softBlue' : 'softYellow'"
          rounded="full"
          text-size="xs"
          class="px-2 py-1"
        >
          {{ enabled ? `${unreadCount} unread` : 'Off' }}
        </BaseBadge>
        <button
          v-if="enabled"
          type="button"
          class="ui-caption rounded-lg px-2 py-1 transition hover:opacity-80"
          :class="themeClass.text.subtleMeta"
          :disabled="items.length === 0"
          @click="$emit('mark-all')"
        >
          Mark all read
        </button>
      </div>
    </header>

    <div class="max-h-[min(56dvh,24rem)] overflow-y-auto p-2">
      <div
        v-if="!enabled"
        class="rounded-xl border px-4 py-6 text-center"
        :class="[themeClass.border.secondary, themeClass.background.airy]"
      >
        <p class="ui-label" :class="themeClass.text.secondary">Notifikasi dinonaktifkan</p>
        <p class="ui-body-sm mt-1" :class="themeClass.text.subtleMeta">
          Aktifkan kembali dari Settings atau langsung dari sini.
        </p>
        <BaseButton size="sm" variant="secondary" class="mt-3" @click="$emit('enable')">
          Aktifkan Notifikasi
        </BaseButton>
      </div>

      <div
        v-else-if="items.length === 0"
        class="rounded-xl border px-4 py-6 text-center"
        :class="[themeClass.border.secondary, themeClass.background.airy]"
      >
        <p class="ui-body-sm" :class="themeClass.text.subtleMeta">Tidak ada notifikasi unread.</p>
      </div>

      <ul v-else class="space-y-1.5">
        <li v-for="item in items" :key="item.id">
          <BaseNotificationItem
            :item="item"
            @mark-read="$emit('mark-read', item.id)"
            @mark-unread="$emit('mark-unread', item.id)"
            @dismiss="$emit('dismiss', item.id)"
            @open-target="$emit('open-target', item.id)"
          />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { NotificationItem } from '@flowforge/types';

  type Props = {
    visible?: boolean;
    enabled?: boolean;
    unreadCount?: number;
    items?: NotificationItem[];
    panelClass?: string;
  };

  withDefaults(defineProps<Props>(), {
    visible: false,
    enabled: true,
    unreadCount: 0,
    items: () => [],
    panelClass: '',
  });

  defineEmits<{
    (e: 'mark-all'): void;
    (e: 'enable'): void;
    (e: 'mark-read', id: string): void;
    (e: 'mark-unread', id: string): void;
    (e: 'dismiss', id: string): void;
    (e: 'open-target', id: string): void;
  }>();

  const themeClass = useColorClass();
</script>
