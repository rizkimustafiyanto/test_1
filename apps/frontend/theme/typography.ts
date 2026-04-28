type TypographyScale = {
  button: string;
  buttonIcon: string;
  badge: string;
  input: string;
  select: string;
  radio: string;
  paginationLabel: string;
  table: string;
  tableHeader: string;
  tableEmpty: string;
};

export const FIELD_CONTROL_BY_SIZE = {
  xl: {
    height: 'h-14',
    px: 'px-5',
    iconSquare: 'h-14 w-14',
    radius: 'rounded-2xl',
    clearButton: 'h-8 w-8',
  },
  lg: {
    height: 'h-12',
    px: 'px-4',
    iconSquare: 'h-12 w-12',
    radius: 'rounded-xl',
    clearButton: 'h-7 w-7',
  },
  md: {
    height: 'h-11',
    px: 'px-4',
    iconSquare: 'h-11 w-11',
    radius: 'rounded-xl',
    clearButton: 'h-7 w-7',
  },
  sm: {
    height: 'h-10',
    px: 'px-3',
    iconSquare: 'h-10 w-10',
    radius: 'rounded-lg',
    clearButton: 'h-6 w-6',
  },
  xs: {
    height: 'h-9',
    px: 'px-3',
    iconSquare: 'h-9 w-9',
    radius: 'rounded-lg',
    clearButton: 'h-5 w-5',
  },
} as const;

export const FIELD_TYPOGRAPHY_BY_SIZE: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', TypographyScale> =
  {
    xl: {
      button: 'text-base font-semibold',
      buttonIcon: 'text-base',
      badge: 'text-sm font-medium',
      input: 'text-base',
      select: 'text-base',
      radio: 'text-base',
      paginationLabel: 'text-sm',
      table: 'text-base',
      tableHeader: 'text-sm font-semibold tracking-wide',
      tableEmpty: 'text-sm',
    },
    lg: {
      button: 'text-sm font-semibold',
      buttonIcon: 'text-sm',
      badge: 'text-sm font-medium',
      input: 'text-sm',
      select: 'text-sm',
      radio: 'text-sm',
      paginationLabel: 'text-sm',
      table: 'text-sm',
      tableHeader: 'text-xs font-semibold tracking-wide',
      tableEmpty: 'text-sm',
    },
    md: {
      button: 'text-sm font-semibold',
      buttonIcon: 'text-sm',
      badge: 'text-xs font-medium',
      input: 'text-sm',
      select: 'text-sm',
      radio: 'text-sm',
      paginationLabel: 'text-xs',
      table: 'text-sm',
      tableHeader: 'text-xs font-semibold tracking-wide',
      tableEmpty: 'text-sm',
    },
    sm: {
      button: 'text-xs font-semibold',
      buttonIcon: 'text-xs',
      badge: 'text-xs font-medium',
      input: 'text-xs',
      select: 'text-xs',
      radio: 'text-xs',
      paginationLabel: 'text-xs',
      table: 'text-xs',
      tableHeader: 'text-[11px] font-semibold tracking-wide',
      tableEmpty: 'text-xs',
    },
    xs: {
      button: 'text-xs font-semibold',
      buttonIcon: 'text-xs',
      badge: 'text-[11px] font-medium',
      input: 'text-xs',
      select: 'text-xs',
      radio: 'text-xs',
      paginationLabel: 'text-[11px]',
      table: 'text-xs',
      tableHeader: 'text-[10px] font-semibold tracking-wide',
      tableEmpty: 'text-xs',
    },
  };

export function isNumericCell(key: string, value: unknown): boolean {
  if (typeof value === 'number') return true;
  if (value === null || value === undefined) return false;

  const normalizedKey = key.toLowerCase();
  if (
    normalizedKey.includes('amount') ||
    normalizedKey.includes('total') ||
    normalizedKey.includes('price') ||
    normalizedKey.includes('count') ||
    normalizedKey.includes('qty') ||
    normalizedKey.includes('number')
  ) {
    return true;
  }

  if (typeof value === 'string') {
    return /^-?\d+([.,]\d+)?$/.test(value.trim());
  }

  return false;
}
