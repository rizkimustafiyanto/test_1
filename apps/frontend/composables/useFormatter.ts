export function useFormatter() {
  const formatCurrency = (
    value: number,
    options?: {
      currency?: string;
      locale?: string;
    }
  ) => {
    const locale = options?.locale || 'id-ID';
    const currency = options?.currency || 'IDR';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return {
    formatCurrency,
  };
}
