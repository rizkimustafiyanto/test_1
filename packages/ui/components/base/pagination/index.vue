<template>
  <nav
    v-if="totalPages > 0"
    class="flex w-full items-center justify-between gap-3 overflow-x-auto pt-4"
    aria-label="Table navigation"
  >
    <span
      :class="['font-medium', labelClass, themeClass.text.dark]"
      :title="`Tampil ${display.from}-${display.to} dari ${display.total}`"
    >
      <span class="font-semibold">{{ display.from }}</span>
      -
      <span class="font-semibold">{{ display.to }}</span>
      /
      <span class="font-semibold">{{ display.total }}</span>
    </span>

    <ul :class="['inline-flex items-center gap-1', ulClass]">
      <li>
        <button
          :disabled="display.page <= 1"
          :class="[
            btnClass,
            themeClass.button.secondary,
            'flex items-center gap-1 rounded-xl shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
          ]"
          @click="$emit('page-change', display.page - 1)"
        >
          <i :class="['fa-solid fa-chevron-left', themeClass.icon.primary]" />
          Prev
        </button>
      </li>

      <li v-for="p in visiblePages" :key="p">
        <button
          :class="[
            btnClass,
            p === display.page ? themeClass.button.primary : themeClass.button.secondary,
            'min-w-8 rounded-xl shadow-sm',
          ]"
          @click="$emit('page-change', p)"
        >
          {{ p }}
        </button>
      </li>

      <li>
        <button
          :disabled="display.page >= totalPages"
          :class="[
            btnClass,
            themeClass.button.secondary,
            'flex items-center gap-1 rounded-xl shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
          ]"
          @click="$emit('page-change', display.page + 1)"
        >
          Next
          <i :class="['fa-solid fa-chevron-right', themeClass.icon.primary]" />
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useColorClass } from '../../../theme/useColorClass';
  import { FIELD_TYPOGRAPHY_BY_SIZE } from '../../../theme/typography';
  import type { PaginationProps } from '@flowforge/types';

  const themeClass = useColorClass();

  const props = defineProps<PaginationProps>();
  defineEmits<{
    (e: 'page-change', page: number): void;
  }>();

  const totalPages = computed(() => {
    if (!props.pagination?.totalData || !props.pagination?.limit) return 1;
    return Math.ceil(props.pagination.totalData / props.pagination.limit);
  });

  const display = computed(() => {
    if (!props.pagination) return { from: 0, to: 0, total: 0, page: 1 };
    const { currentPage = 1, limit = 10, totalData = 0 } = props.pagination;
    const from = totalData === 0 ? 0 : (currentPage - 1) * limit + 1;
    const to = Math.min(currentPage * limit, totalData);
    return { from, to, total: totalData, page: currentPage };
  });

  const sizeMap = {
    xs: {
      btn: 'px-1.5 h-6 ui-button-xs',
      ul: 'h-6',
      label: FIELD_TYPOGRAPHY_BY_SIZE.xs.paginationLabel,
    },
    sm: {
      btn: 'px-2.5 h-7 ui-button-sm',
      ul: 'h-7',
      label: FIELD_TYPOGRAPHY_BY_SIZE.sm.paginationLabel,
    },
    md: {
      btn: 'px-3 h-9 ui-button-md',
      ul: 'h-9',
      label: FIELD_TYPOGRAPHY_BY_SIZE.md.paginationLabel,
    },
    lg: {
      btn: 'px-4 h-10 ui-button-lg',
      ul: 'h-10',
      label: FIELD_TYPOGRAPHY_BY_SIZE.lg.paginationLabel,
    },
  } as const;

  const btnClass = computed(() => sizeMap[props.size ?? 'md'].btn);
  const ulClass = computed(() => sizeMap[props.size ?? 'md'].ul);
  const labelClass = computed(() => sizeMap[props.size ?? 'md'].label);
  const visiblePages = computed(() => {
    const total = totalPages.value;
    const current = display.value.page;
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const pages: number[] = [];
    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }
    return pages;
  });
</script>
