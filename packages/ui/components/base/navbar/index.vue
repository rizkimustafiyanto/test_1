<template>
  <header
    class="fixed top-0 left-0 z-40 flex w-full items-center justify-between px-4 py-3 backdrop-blur-xl transition duration-300 sm:px-6 sm:py-4"
    :class="navShellClass"
  >
    <button type="button" class="flex items-center space-x-3 text-left" @click="emit('logo')">
      <img
        v-if="logoSrc"
        :src="logoSrc"
        :alt="title"
        class="h-11 w-11 rounded-xl object-cover shadow-sm"
        @error="onLogoError"
      />
      <span :class="['ui-subtitle max-w-55 truncate', themeClass.text.secondary]">
        {{ title }}
      </span>
    </button>

    <nav class="hidden items-center gap-1.5 xl:flex">
      <template v-for="item in resolvedMenuItems" :key="item.key">
        <div v-if="item.children && item.children.length" class="relative">
          <button
            type="button"
            class="z-10 px-0.5 focus:outline-none"
            @click="toggleDropdown(item.key)"
          >
            <div :class="[menuClass(item), menuItemLayoutClass]">
              <i v-if="item.icon" :class="iconClass(item.icon)" />
              <span class="truncate">{{ item.label }}</span>
              <i
                class="fas ml-1 h-3 w-3 shrink-0 text-center"
                :class="openDropdown === item.key ? 'fa-chevron-up' : 'fa-chevron-down'"
              />
            </div>
          </button>

          <transition name="fade-scale">
            <div
              v-show="openDropdown === item.key"
              :class="[
                'absolute top-full z-20 mt-2 min-w-55 rounded-xl border p-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.10)]',
                themeClass.borderColor,
                themeClass.dropdown,
              ]"
            >
              <button
                v-for="child in item.children"
                :key="child.key"
                type="button"
                :class="[
                  menuClass(child),
                  menuItemLayoutClass,
                  'w-full text-left whitespace-nowrap',
                ]"
                @click="navigateToMenu(child.key, { closeDropdown: true })"
              >
                <i v-if="child.icon" :class="iconClass(child.icon)" />
                <span class="truncate">{{ child.label }}</span>
              </button>
            </div>
          </transition>
        </div>

        <button
          v-else
          type="button"
          class="px-0.5"
          @click="navigateToMenu(item.key, { closeDropdown: true })"
        >
          <div :class="[menuClass(item), menuItemLayoutClass]">
            <i v-if="item.icon" :class="iconClass(item.icon)" />
            <span class="truncate">{{ item.label }}</span>
          </div>
        </button>
      </template>

      <div
        class="flex items-center gap-1 rounded-full border p-1 shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
        :class="controlGroupClass"
      >
        <button
          v-if="showNotifications"
          title="Notifications"
          class="nav-control relative"
          data-notification-toggle="true"
          :class="[
            controlIconClass,
            notificationEnabled ? themeClass.icon.info : themeClass.text.subtleMeta,
          ]"
          aria-label="Toggle notifications"
          @click="emit('toggle-notification')"
        >
          <i class="fas fa-bell nav-control-icon" />
          <BaseBadge
            v-if="unreadCount > 0"
            variant-text="danger"
            variant-b-g-color="softRose"
            rounded="full"
            text-size="xs"
            class="absolute -top-1 -right-1 min-w-4.5 px-1 py-0.5 text-center"
          >
            {{ unreadBadgeLabel }}
          </BaseBadge>
        </button>

        <button
          v-if="showThemeToggle"
          title="Toggle theme"
          class="nav-control"
          :class="[controlIconClass, themeClass.icon.warning]"
          @click="toggleTheme"
        >
          <i v-if="theme === 'light'" class="fas fa-sun nav-control-icon" />
          <i v-else class="fas fa-moon nav-control-icon" />
        </button>

        <BaseColorPicker
          v-if="showColorPicker"
          :button-class="`${controlIconClass} ${themeClass.icon.primary}`"
        />

        <button
          v-if="showLogout"
          title="Logout"
          class="nav-control"
          :class="[controlIconClass, themeClass.icon.danger]"
          @click="emit('logout')"
        >
          <i class="fas fa-right-from-bracket nav-control-icon" />
        </button>
      </div>
    </nav>

    <div class="flex gap-2 xl:hidden">
      <button
        v-if="showNotifications"
        title="Notifications"
        class="nav-control relative"
        data-notification-toggle="true"
        :class="[
          controlIconClass,
          notificationEnabled ? themeClass.icon.info : themeClass.text.subtleMeta,
        ]"
        aria-label="Toggle notifications"
        @click="emit('toggle-notification')"
      >
        <i class="fas fa-bell nav-control-icon" />
        <BaseBadge
          v-if="unreadCount > 0"
          variant-text="danger"
          variant-b-g-color="softRose"
          rounded="full"
          text-size="xs"
          class="absolute -top-1 -right-1 min-w-4.5 px-1 py-0.5 text-center"
        >
          {{ unreadBadgeLabel }}
        </BaseBadge>
      </button>

      <button
        v-if="showThemeToggle"
        title="Toggle Theme"
        class="nav-control"
        :class="[controlIconClass, themeClass.icon.orange]"
        @click="toggleTheme"
      >
        <i v-if="theme === 'light'" class="fas fa-sun nav-control-icon" />
        <i v-else class="fas fa-moon nav-control-icon" />
      </button>
      <BaseColorPicker
        v-if="showColorPicker"
        :button-class="`${controlIconClass} ${themeClass.icon.primary}`"
      />
      <button
        class="nav-control"
        :class="[controlIconClass, themeClass.icon.secondary]"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle navigation menu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <i class="fas fa-bars nav-control-icon" />
      </button>
    </div>
  </header>

  <transition name="fade-scale">
    <div
      v-show="mobileMenuOpen"
      :class="[
        'fixed top-18 right-0 left-0 z-30 max-h-[calc(100dvh-72px)] space-y-2 overflow-y-auto rounded-none px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.12)] sm:top-20 sm:max-h-[calc(100dvh-80px)] xl:hidden',
        mobilePanelClass,
      ]"
    >
      <template v-for="item in resolvedMenuItems" :key="item.key">
        <div v-if="item.children && item.children.length" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left',
              themeClass.text.secondary,
            ]"
            @click="toggleMobileDropdown(item.key)"
          >
            <span class="truncate">{{ item.label }}</span>
            <i
              class="fas ml-2 h-4 w-4 shrink-0 text-center"
              :class="openMobileDropdown === item.key ? 'fa-chevron-up' : 'fa-chevron-down'"
            />
          </button>
          <transition name="fade-scale">
            <div v-show="openMobileDropdown === item.key" class="space-y-1 px-2 pb-1">
              <button
                v-for="child in item.children"
                :key="child.key"
                type="button"
                :class="[menuClass(child, true), menuItemLayoutClass]"
                @click="navigateToMenu(child.key, { closeMobile: true })"
              >
                <i v-if="child.icon" :class="iconClass(child.icon)" />
                <span class="truncate">{{ child.label }}</span>
              </button>
            </div>
          </transition>
        </div>

        <button
          v-else
          :class="[menuClass(item, true), menuItemLayoutClass]"
          @click="navigateToMenu(item.key, { closeMobile: true })"
        >
          <i v-if="item.icon" :class="iconClass(item.icon)" />
          <span class="truncate">{{ item.label }}</span>
        </button>
      </template>

      <button
        v-if="showLogout"
        type="button"
        :class="[
          'mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2',
          themeClass.icon.danger,
          themeClass.backgroundless.danger,
        ]"
        @click="emit('logout')"
      >
        <i class="fas fa-right-from-bracket h-4 w-4" />
        Logout
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useResponsive } from '../../../../../apps/frontend/composables/useResponsive';
  import type { NavbarMenuItem } from '@flowforge/types';

  type NavbarProps = {
    title?: string;
    logoSrc?: string | null;
    active?: string | null;
    menuItems?: NavbarMenuItem[];
    unreadCount?: number;
    notificationEnabled?: boolean;
    showNotifications?: boolean;
    showThemeToggle?: boolean;
    showColorPicker?: boolean;
    showLogout?: boolean;
  };

  const props = withDefaults(defineProps<NavbarProps>(), {
    title: 'Dashboard',
    logoSrc: null,
    active: null,
    menuItems: () => [],
    unreadCount: 0,
    notificationEnabled: true,
    showNotifications: true,
    showThemeToggle: true,
    showColorPicker: true,
    showLogout: true,
  });

  const emit = defineEmits<{
    (e: 'change', menuKey: string): void;
    (e: 'logout'): void;
    (e: 'toggle-notification'): void;
    (e: 'logo'): void;
  }>();

  const themeClass = useColorClass();
  const themeStore = useThemeStore();
  const { isXlUp } = useResponsive();

  const mobileMenuOpen = ref(false);
  const openDropdown = ref<string | null>(null);
  const openMobileDropdown = ref<string | null>(null);
  const menuItemLayoutClass = 'flex items-center gap-2.5';

  const resolvedMenuItems = computed<NavbarMenuItem[]>(() =>
    Array.isArray(props.menuItems) ? props.menuItems : []
  );

  watch(isXlUp, (isDesktopLike) => {
    if (!isDesktopLike) return;
    mobileMenuOpen.value = false;
    openMobileDropdown.value = null;
  });

  watch(
    () => props.active,
    () => {
      mobileMenuOpen.value = false;
      openDropdown.value = null;
      openMobileDropdown.value = null;
    }
  );

  const toggleDropdown = (key: string) =>
    (openDropdown.value = openDropdown.value === key ? null : key);
  const toggleMobileDropdown = (key: string) =>
    (openMobileDropdown.value = openMobileDropdown.value === key ? null : key);

  const navigateToMenu = (
    menuKey: string,
    opts?: { closeMobile?: boolean; closeDropdown?: boolean }
  ) => {
    emit('change', menuKey);

    if (opts?.closeMobile) {
      mobileMenuOpen.value = false;
      openMobileDropdown.value = null;
    }

    if (opts?.closeDropdown) {
      openDropdown.value = null;
    }
  };

  const activePath = computed(() => props.active ?? '');

  const isPathActive = (itemKey: string, activeKey: string) => {
    if (!activeKey) return false;
    if (itemKey === activeKey) return true;
    if (!itemKey.startsWith('/')) return false;
    if (itemKey === '/store') return false;
    return activeKey.startsWith(`${itemKey}/`);
  };

  const isMenuActive = (item: NavbarMenuItem): boolean => {
    if (isPathActive(item.key, activePath.value)) return true;
    if (item.children) return item.children.some(isMenuActive);
    return false;
  };

  const menuClass = (item: NavbarMenuItem, mobile = false) => {
    const base = mobile
      ? 'block w-full rounded-xl border px-4 py-2.5 ui-caption transition-colors duration-200'
      : 'rounded-xl border px-3 py-2 ui-caption transition-colors duration-200';
    const active = isMenuActive(item);
    if (active) {
      return `${base} ${themeClass.value.button.teal} ${themeClass.value.border.primary} shadow-[0_1px_2px_rgba(15,23,42,0.08)]`;
    }
    return `${base} ${themeClass.value.border.secondary} ${themeClass.value.text.subtleMeta} ${themeClass.value.backgroundless.secondary} hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/70 dark:hover:text-slate-100`;
  };
  const iconClass = (icon: string) => `fas fa-${icon} h-4 w-4 shrink-0 text-center`;

  const logoSrc = ref(props.logoSrc || '');
  function onLogoError(e: Event) {
    const target = e.target as HTMLImageElement;
    target.src = '';
  }

  watch(
    () => props.logoSrc,
    (next) => {
      logoSrc.value = next || '';
    }
  );

  const unreadBadgeLabel = computed(() =>
    props.unreadCount > 99 ? '99+' : String(props.unreadCount || 0)
  );

  const theme = computed(() => themeStore.theme);
  const navShellClass = computed(() =>
    theme.value === 'dark'
      ? 'border-b border-slate-700/70 bg-slate-900/78 shadow-[0_8px_22px_rgba(2,6,23,0.30)]'
      : 'border-b border-slate-200/80 bg-white/82 shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
  );
  const mobilePanelClass = computed(() =>
    theme.value === 'dark'
      ? 'border-t border-slate-700/70 bg-slate-900/96'
      : 'border-t border-slate-200/80 bg-white/96'
  );
  const controlGroupClass = computed(() =>
    theme.value === 'dark' ? 'border-slate-700/80 bg-slate-900/72' : 'border-slate-200 bg-white/88'
  );
  const controlIconClass = computed(() =>
    theme.value === 'dark' ? 'bg-slate-800/70 border-slate-700/80' : 'bg-white border-slate-200'
  );
  function toggleTheme() {
    themeStore.toggleTheme();
  }
</script>

<style scoped>
  .nav-control {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    border-width: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.09);
    transition: all 0.2s ease;
  }

  .nav-control:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.11);
  }

  .nav-control-icon {
    width: 20px;
    height: 20px;
    line-height: 1;
    font-size: 18px;
  }

  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }
</style>
