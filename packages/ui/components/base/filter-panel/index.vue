<template>
  <div class="space-y-2">
    <div
      v-if="summary"
      class="filter-summary ui-caption inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      :class="summaryClass"
    >
      <i class="fa-solid fa-filter ui-helper" />
      <span class="truncate">{{ summary }}</span>
    </div>

    <transition name="slide-fade">
      <div
        v-if="show"
        class="filter-shell mb-3 rounded-2xl border p-3 shadow-sm sm:p-3.5"
        :class="themeClass.border.airy"
      >
        <div class="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <BaseSelect
            v-if="limitable"
            class="w-full"
            :model-value="limit"
            :options="limitOptions"
            placeholder="Jumlah data"
            title="Jumlah data"
            :size-variant="sizeVariant"
            @update:model-value="handleLimitChange"
          />
          <BaseInput
            v-if="dateRangeable"
            class="w-full"
            :model-value="startDate"
            type="date"
            :size-variant="sizeVariant"
            placeholder="Dari"
            title="Dari"
            @update:model-value="handleStartDate"
          />
          <BaseInput
            v-if="dateRangeable"
            class="w-full"
            :model-value="endDate"
            type="date"
            :size-variant="sizeVariant"
            placeholder="Sampai"
            title="Sampai"
            @update:model-value="handleEndDate"
          />
          <BaseSelect
            v-if="yearable"
            class="w-full"
            :model-value="year"
            :options="yearOptions"
            placeholder="Tahun"
            :title="'Tahun'"
            :size-variant="sizeVariant"
            @update:model-value="handleYearChange"
          />
          <div class="flex w-full justify-start lg:justify-end">
            <BaseButton
              v-if="summary"
              size="sm"
              variant="mist"
              class="w-full justify-center sm:w-auto lg:min-w-[136px]"
              icon="fa-solid fa-rotate-left"
              @click="emit('reset')"
            >
              Reset Filter
            </BaseButton>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  const themeClass = useColorClass();

  defineProps<{
    show: boolean;
    summary?: string;
    summaryClass?: string;
    sizeVariant?: 'xs' | 'sm' | 'md' | 'lg';
    dateRangeable?: boolean;
    yearable?: boolean;
    yearOptions?: Array<{ label: string; value: string | number }>;
    limitable?: boolean;
    limitOptions?: Array<{ label: string; value: string | number }>;
    limit?: string | number;
    startDate?: string;
    endDate?: string;
    year?: string | number;
  }>();

  const emit = defineEmits<{
    (e: 'update:startDate', value: string): void;
    (e: 'update:endDate', value: string): void;
    (e: 'update:year', value: string | number): void;
    (e: 'update:limit', value: string | number): void;
    (e: 'date-change'): void;
    (e: 'year-change', value: string | number): void;
    (e: 'limit-change', value: string | number): void;
    (e: 'reset'): void;
  }>();

  const handleStartDate = (value: string | number | any[]) => {
    emit('update:startDate', String(value ?? ''));
    emit('date-change');
  };

  const handleEndDate = (value: string | number | any[]) => {
    emit('update:endDate', String(value ?? ''));
    emit('date-change');
  };

  const handleYearChange = (value: string | number | any[]) => {
    emit('update:year', value as string | number);
    emit('year-change', value as string | number);
  };

  const handleLimitChange = (value: string | number | any[]) => {
    const nextValue = value as string | number;
    emit('update:limit', nextValue);
    emit('limit-change', nextValue);
  };
</script>

<style scoped>
  .filter-summary {
    border: 1px solid var(--brand-border);
    background: var(--brand-surface-40);
  }

  .filter-shell {
    background: linear-gradient(to bottom, var(--brand-surface-45), var(--brand-surface-30));
  }

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
