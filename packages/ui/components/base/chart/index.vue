<template>
  <ClientOnly>
    <component
      :is="AsyncApexChart"
      :type="type"
      :height="height"
      :options="resolvedOptions"
      :series="resolvedSeries"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent } from 'vue';
  import type { ApexOptions } from 'apexcharts';
  import { useFormatter } from '../../../../../apps/frontend/composables/useFormatter';
  import { useColorClass } from '../../../theme/useColorClass';
  import { useThemeStore } from '../../../stores/utils/theme';
  import type { ChartProps } from '@flowforge/types';

  const props = defineProps<ChartProps>();

  const themeStore = useThemeStore();
  const theme = computed(() => themeStore.theme || 'light');
  const themeClass = useColorClass();
  const AsyncApexChart = defineAsyncComponent(() => import('vue3-apexcharts'));

  const { formatCurrency } = useFormatter();

  const formatValue = (val: unknown): string | number => {
    if (typeof val !== 'number') return val as string;

    switch (props.format) {
      case 'currency':
        return formatCurrency(val, {
          currency: props.currency,
          locale: props.locale,
        });
      case 'percent':
        return `${val}%`;
      case 'custom':
        return props.customFormatter ? props.customFormatter(val) : val;
      default:
        return val;
    }
  };

  const resolvedSeries = computed(() => {
    if (props.type === 'donut' || props.type === 'pie') {
      return props.data?.map((v) => Number(v) || 0) ?? [];
    }

    return [
      {
        name: 'Data',
        data: props.data?.map((v) => Number(v) || 0) ?? [],
      },
    ];
  });

  const resolvedOptions = computed<ApexOptions>(() => {
    const common: ApexOptions = {
      theme: { mode: theme.value },

      legend: {
        position: 'bottom',
        labels: { colors: themeClass.value.text.subtleMeta },
      },

      tooltip: {
        y: {
          formatter: (val: number) => String(formatValue(val)),
        },
      },
    };

    if (props.type === 'donut' || props.type === 'pie') {
      return {
        ...common,
        stroke: {
          show: true,
          colors: [theme.value === 'dark' ? '#1e1e1e' : '#fff'],
          width: 2,
        },

        chart: { type: props.type },

        labels: props.categories?.map(String),

        dataLabels: {
          enabled: !props.hoverOnly,
          formatter: (val: number, opts: { w: { config: { series?: unknown[] } }; seriesIndex: number }) =>
            String(formatValue(opts.w.config.series?.[opts.seriesIndex] ?? 0)),
        },

        tooltip: {
          enabled: true,
          y: {
            formatter: (val: number) => String(formatValue(val)),
          },
        },
      };
    }

    return {
      ...common,

      chart: { type: props.type, toolbar: { show: false } },

      dataLabels: {
        enabled: !props.hoverOnly,
        formatter: (val: number) => String(formatValue(val)),
      },

      xaxis: {
        categories: props.categories?.map(String),
        labels: { style: { colors: themeClass.value.text.subtleMeta } },
      },

      yaxis: {
        labels: {
          style: { colors: themeClass.value.text.subtleMeta },
          formatter: (val: number) => String(formatValue(val)),
        },
      },

      stroke: { curve: 'smooth', width: 3 },
    };
  });
</script>
