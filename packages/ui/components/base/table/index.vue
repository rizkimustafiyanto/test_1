<template>
  <div
    :class="[
      'relative overflow-x-auto shadow-lg sm:rounded-xl',
      (themeClass.baseDiv as Record<string, string>)['secondary'],
      sizeClass.wrapper,
    ]"
  >
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-2" :class="sizeClass.header">
      <div class="flex min-w-0 flex-1 flex-row items-center gap-2">
        <BaseInput
          v-if="searchable"
          v-model="searchQuery"
          placeholder="Cari..."
          :size-variant="sizeVariant"
          @update:model-value="handleSearchQuery"
        />
      </div>

      <BaseButton
        v-if="hasFilterControls"
        variant="mist"
        :size="sizeVariant"
        icon="fa-solid fa-sliders"
        class="shrink-0"
        title="Filter"
        @click="toggleFilters"
      />
    </div>
    <div
      v-if="filtersSummary"
      class="ui-helper mt-1 inline-flex items-center gap-2 rounded-full px-2.5 py-1 shadow-sm"
      :class="[themeClass.backgroundless.secondary, themeClass.text.subtleMeta]"
    >
      <i class="fa-solid fa-filter" />
      {{ filtersSummary }}
    </div>

    <transition name="slide-fade">
      <div
        v-if="showFilters"
        class="mt-2 mb-2 rounded-2xl p-4 shadow-md"
        :class="(themeClass.baseDiv as Record<string, string>)['mist']"
      >
        <div class="grid gap-3" :class="'grid-cols-1 md:grid-cols-2 xl:grid-cols-6'">
          <div v-if="showStatusFilter" class="space-y-1">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Status</p>
            <BaseSelect
              v-model="selectedDropdownValue"
              :options="dropdownItems"
              :placeholder="dropdownLabel"
              :size-variant="sizeVariant"
              @update:model-value="handleDropdownSelect"
            />
          </div>
          <div v-if="showYear" class="space-y-1">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Tahun</p>
            <BaseSelect
              v-model="selectedYear"
              :options="yearOptions"
              placeholder="Tahun"
              :title="'Tahun'"
              :size-variant="sizeVariant"
              @update:model-value="handleYearChange"
            />
          </div>
          <div v-if="showDateRange" class="space-y-1">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Dari</p>
            <BaseInput
              v-model="startDate"
              type="date"
              :size-variant="sizeVariant"
              placeholder="Dari"
              title="Dari"
              @update:model-value="handleDateRangeChange"
            />
          </div>
          <div v-if="showDateRange" class="space-y-1">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Sampai</p>
            <BaseInput
              v-model="endDate"
              type="date"
              :size-variant="sizeVariant"
              placeholder="Sampai"
              title="Sampai"
              @update:model-value="handleDateRangeChange"
            />
          </div>
          <div v-if="showLimit" class="space-y-1">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Tampilan</p>
            <BaseSelect
              v-model="localLimit"
              :options="limitOptions"
              placeholder="Limit"
              :title="'Tampilan Per Halaman'"
              :theme-class="themeClass.select"
              :size-variant="sizeVariant"
              @update:model-value="applyLimit"
            />
          </div>
          <div v-if="showExport || showImport" class="space-y-1">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Aksi</p>
            <div class="flex items-center gap-2">
              <BaseButton
                v-if="showExport"
                variant="mist"
                :size="sizeVariant"
                icon="fa-solid fa-download"
                @click="$emit('export')"
              >
                Export
              </BaseButton>
              <BaseButton
                v-if="showImport"
                variant="mist"
                :size="sizeVariant"
                icon="fa-solid fa-file-arrow-up"
                @click="$emit('import')"
              >
                Import
              </BaseButton>
            </div>
          </div>
          <div v-if="hasExtraFiltersSlot" class="space-y-1 md:col-span-2 xl:col-span-2">
            <p class="ui-caption" :class="themeClass.text.subtleMeta">Prioritas</p>
            <slot name="filters-extra" />
          </div>
        </div>

        <div v-if="filtersSummary" class="mt-3 flex justify-end">
          <BaseButton
            variant="mist"
            :size="sizeVariant"
            icon="fa-solid fa-rotate-left"
            @click="emit('reset-filters')"
          >
            Reset Filter
          </BaseButton>
        </div>
      </div>
    </transition>

    <!-- Table -->
    <div v-if="!loading && items?.length">
      <div class="space-y-3 md:hidden">
        <template v-if="hasMobileCardSlot">
          <slot
            v-for="item in items"
            :key="item.id"
            :name="'mobile-card'"
            :item="item"
            :value="item"
          />
        </template>
        <template v-else>
          <div
            v-for="item in items"
            :key="item.id"
            class="space-y-2 rounded-xl p-3 shadow-md"
            :class="(themeClass.baseDiv as Record<string, string>)['secondary']"
          >
            <div
              v-for="col in computedColumns"
              :key="col.key"
              class="space-y-1"
              :class="col.key === 'actions' ? ['mt-1 pt-2'] : ''"
            >
              <p class="ui-table-header uppercase" :class="themeClass.text.subtleMeta">
                {{ col.label }}
              </p>
              <div
                :class="[
                  themeClass.text.secondary,
                  'ui-table-cell',
                  getCellClass(col.key, item[col.key]),
                ]"
              >
                <slot :name="col.key" :value="item[col.key]" :item="item">
                  {{ item[col.key] }}
                </slot>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="hidden w-full overflow-x-auto md:block">
        <table
          class="w-full min-w-max overflow-hidden rounded-xl text-left shadow-md"
          :class="sizeClass.font"
        >
          <thead class="sticky top-0 z-[1] uppercase" :class="[themeClass.thead, sizeClass.thead]">
            <tr>
              <th
                v-for="col in computedColumns"
                :key="col.key"
                :class="[themeClass.text.secondary, sizeClass.th, sizeClass.thead]"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
              class="transition-all duration-150"
              :class="[themeClass.trHover]"
            >
              <td
                v-for="col in computedColumns"
                :key="col.key"
                :class="[
                  themeClass.text.secondary,
                  sizeClass.td,
                  getCellClass(col.key, item[col.key]),
                ]"
              >
                <slot :name="col.key" :value="item[col.key]" :item="item">
                  {{ item[col.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseLoadingSpinner v-else-if="loading" type="mini" class="mx-auto my-4" />

    <div
      v-else
      class="rounded-lg text-center shadow-sm"
      :class="[
        themeClass.text.secondary,
        (themeClass.baseDiv as Record<string, string>)['mist'],
        sizeClass.empty,
      ]"
    >
      <i :class="['fa-solid fa-inbox mb-2', themeClass.icon.secondary, sizeClass.emptyIcon]" />
      Tidak ada data ditemukan.
    </div>

    <BasePagination
      v-if="!loading && items?.length && pagination"
      :pagination="pagination"
      class="mt-4"
      :size="paginationSize"
      @page-change="$emit('page-change', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useSlots } from 'vue';
  import BaseLoadingSpinner from '../loading-spinner/index.vue';
  import type { Column, Pagination } from '@flowforge/types';
  import { FIELD_TYPOGRAPHY_BY_SIZE, isNumericCell } from '../../../theme/typography';

  const themeClass = useColorClass();

  const props = defineProps<{
    items?: Record<string, any>[];
    columns?: (string | Column)[];
    loading?: boolean;
    pagination?: Pagination;
    searchable?: boolean;
    choosable?: boolean;
    limitable?: boolean;
    exportable?: boolean;
    importable?: boolean;
    showStatusFilter?: boolean;
    showDateRange?: boolean;
    showYear?: boolean;
    showLimit?: boolean;
    showExport?: boolean;
    showImport?: boolean;
    dropdownLabel?: string;
    dropdownItems?: any[];
    sizeVariant?: 'xs' | 'sm' | 'md' | 'lg';
    dateRangeable?: boolean;
    yearable?: boolean;
    yearOptions?: Array<{ label: string; value: string | number }>;
    filtersSummary?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void;
    (e: 'search', value: string): void;
    (e: 'page-change', value: number): void;
    (e: 'dropdown-select', value: any): void;
    (e: 'limit-change', value: number): void;
    (e: 'export'): void;
    (e: 'import'): void;
    (e: 'date-range-change', value: { startDate: string; endDate: string }): void;
    (e: 'year-change', value: string | number): void;
    (e: 'reset-filters'): void;
  }>();
  const slots = useSlots();

  const searchQuery = ref('');
  const debouncedSearch = createDebouncer((val: string) => emit('search', val), 400);
  const handleSearchQuery = (value: string | number | any[]) => {
    searchQuery.value = String(value ?? '');
    debouncedSearch(String(value ?? ''));
  };

  const selectedDropdownValue = ref<any>(null);
  const handleDropdownSelect = (value: string | number | any[]) => {
    selectedDropdownValue.value = value;
    emit('dropdown-select', value);
  };

  const localLimit = ref<number>(props.pagination?.limit || 10);
  const limitOptions = [5, 10, 20, 50, 100].map((n) => ({
    label: String(n),
    value: n,
  }));
  const applyLimit = (value: string | number | any[]) => {
    const val = typeof value === 'number' ? value : Number(value);
    if (!isNaN(val)) {
      localLimit.value = val;
      emit('limit-change', val);
    }
  };

  const startDate = ref<string>('');
  const endDate = ref<string>('');
  const handleDateRangeChange = () => {
    if (startDate.value || endDate.value) {
      selectedYear.value = '';
    }
    emit('date-range-change', { startDate: startDate.value, endDate: endDate.value });
  };

  const selectedYear = ref<string | number>('');
  const yearOptions = computed(
    () =>
      props.yearOptions ?? [
        { label: 'Semua Tahun', value: '' },
        ...Array.from({ length: 6 }).map((_, idx) => {
          const y = new Date().getFullYear() - idx;
          return { label: String(y), value: y };
        }),
      ]
  );
  const handleYearChange = (value: string | number | any[]) => {
    selectedYear.value = value as string | number;
    if (String(selectedYear.value).trim() !== '') {
      startDate.value = '';
      endDate.value = '';
    }
    emit('year-change', selectedYear.value);
  };

  const showFilters = ref(false);
  const showStatusFilter = computed(() => props.showStatusFilter ?? props.choosable);
  const showDateRange = computed(() => props.showDateRange ?? props.dateRangeable);
  const showYear = computed(() => props.showYear ?? props.yearable);
  const showLimit = computed(() => props.showLimit ?? props.limitable);
  const showExport = computed(() => props.showExport ?? props.exportable);
  const showImport = computed(() => props.showImport ?? props.importable);
  const hasExtraFiltersSlot = computed(() => typeof slots['filters-extra'] === 'function');
  const hasFilterControls = computed(
    () =>
      showStatusFilter.value ||
      showDateRange.value ||
      showYear.value ||
      showLimit.value ||
      showExport.value ||
      showImport.value ||
      hasExtraFiltersSlot.value ||
      !!props.filtersSummary
  );
  const toggleFilters = () => {
    showFilters.value = !showFilters.value;
  };

  const computedKeys = computed(() => (props.items?.length ? Object.keys(props.items[0]) : []));
  const computedColumns = computed<Column[]>(() => {
    if (props.columns?.length) {
      return props.columns.map((c) => (typeof c === 'string' ? { key: c, label: c } : c));
    }
    return computedKeys.value.map((key) => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
    }));
  });

  const sizeClass = computed(() => {
    const sizes: Record<string, any> = {
      xs: {
        wrapper: `p-1 ${FIELD_TYPOGRAPHY_BY_SIZE.xs.table}`,
        header: 'pb-1',
        font: FIELD_TYPOGRAPHY_BY_SIZE.xs.table,
        thead: `${FIELD_TYPOGRAPHY_BY_SIZE.xs.tableHeader} uppercase`,
        th: 'px-2 py-1',
        td: 'px-2 py-1',
        empty: `p-2 ${FIELD_TYPOGRAPHY_BY_SIZE.xs.tableEmpty}`,
        emptyIcon: 'text-lg',
      },
      sm: {
        wrapper: `p-2 ${FIELD_TYPOGRAPHY_BY_SIZE.sm.table}`,
        header: 'pb-2',
        font: FIELD_TYPOGRAPHY_BY_SIZE.sm.table,
        thead: `${FIELD_TYPOGRAPHY_BY_SIZE.sm.tableHeader} uppercase`,
        th: 'px-3 py-2',
        td: 'px-3 py-2',
        empty: `p-4 ${FIELD_TYPOGRAPHY_BY_SIZE.sm.tableEmpty}`,
        emptyIcon: 'text-xl',
      },
      md: {
        wrapper: `p-4 ${FIELD_TYPOGRAPHY_BY_SIZE.md.table}`,
        header: 'pb-2',
        font: FIELD_TYPOGRAPHY_BY_SIZE.md.table,
        thead: `${FIELD_TYPOGRAPHY_BY_SIZE.md.tableHeader} uppercase`,
        th: 'px-4 py-3',
        td: 'px-4 py-3',
        empty: `p-6 ${FIELD_TYPOGRAPHY_BY_SIZE.md.tableEmpty}`,
        emptyIcon: 'text-2xl',
      },
      lg: {
        wrapper: `p-6 ${FIELD_TYPOGRAPHY_BY_SIZE.lg.table}`,
        header: 'pb-3',
        font: FIELD_TYPOGRAPHY_BY_SIZE.lg.table,
        thead: `${FIELD_TYPOGRAPHY_BY_SIZE.lg.tableHeader} uppercase`,
        th: 'px-6 py-4',
        td: 'px-6 py-4',
        empty: `p-8 ${FIELD_TYPOGRAPHY_BY_SIZE.lg.tableEmpty}`,
        emptyIcon: 'text-3xl',
      },
    };
    return sizes[props.sizeVariant || 'md'];
  });

  const getCellClass = (key: string, value: unknown): string => {
    if (key === 'actions') return 'text-left';
    if (isNumericCell(key, value)) return 'text-right ui-tabular';
    return 'text-left';
  };

  const paginationSize = computed<'xs' | 'sm' | 'md' | 'lg'>(() => props.sizeVariant || 'md');
  const hasMobileCardSlot = computed(() => typeof slots['mobile-card'] === 'function');
</script>

<style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 180ms ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
  }
</style>
