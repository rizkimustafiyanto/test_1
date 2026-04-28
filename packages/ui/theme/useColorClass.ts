import { computed } from 'vue';

function createVariantMap(
  overrides: Record<string, string> = {},
  fallback = 'text-slate-700'
): Record<string, string> {
  return {
    primary: fallback,
    secondary: fallback,
    muted: fallback,
    subtle: fallback,
    success: fallback,
    warning: fallback,
    danger: fallback,
    red: fallback,
    info: fallback,
    glass: fallback,
    mist: fallback,
    haze: fallback,
    smooth: fallback,
    softBlue: fallback,
    softGreen: fallback,
    softPink: fallback,
    pastel: fallback,
    airy: fallback,
    softYellow: fallback,
    softIndigo: fallback,
    meta: fallback,
    subtleMeta: fallback,
    ghost: fallback,
    gray: fallback,
    stone: fallback,
    lilac: fallback,
    teal: fallback,
    orange: fallback,
    lime: fallback,
    violet: fallback,
    indigo: fallback,
    brown: fallback,
    sky: fallback,
    dark: fallback,
    rose: fallback,
    softTeal: fallback,
    softOrange: fallback,
    softViolet: fallback,
    softCyan: fallback,
    softRose: fallback,
    default: fallback,
    ...overrides,
  };
}

export function useColorClass() {
  return computed(() => ({
    text: createVariantMap(
      {
        primary: 'text-slate-900',
        secondary: 'text-slate-700',
        success: 'text-emerald-700',
        warning: 'text-amber-700',
        danger: 'text-rose-700',
        info: 'text-sky-700',
        mist: 'text-sky-700',
        teal: 'text-teal-700',
        dark: 'text-slate-900',
        stone: 'text-stone-500',
        subtleMeta: 'text-slate-500',
      },
      'text-slate-700'
    ),
    background: createVariantMap(
      {
        primary: 'bg-slate-900',
        secondary: 'bg-white',
        success: 'bg-emerald-100',
        warning: 'bg-amber-100',
        danger: 'bg-rose-100',
        info: 'bg-sky-100',
        mist: 'bg-sky-100',
        airy: 'bg-slate-50',
        softBlue: 'bg-sky-100',
        softGreen: 'bg-emerald-100',
        softPink: 'bg-rose-100',
        softYellow: 'bg-amber-100',
        dark: 'bg-slate-900',
      },
      'bg-slate-50'
    ),
    backgroundless: createVariantMap(
      {
        secondary: 'bg-slate-50',
        mist: 'bg-sky-50',
        danger: 'bg-rose-50',
        dark: 'bg-slate-900/95',
      },
      'bg-transparent'
    ),
    hover: createVariantMap(
      {
        primary: 'hover:bg-slate-800',
        secondary: 'hover:bg-slate-100',
        success: 'hover:bg-emerald-200',
        warning: 'hover:bg-amber-200',
        danger: 'hover:bg-rose-200',
        info: 'hover:bg-sky-200',
        mist: 'hover:bg-sky-200',
        smooth: 'hover:bg-slate-100',
      },
      'hover:bg-slate-100'
    ),
    hoverless: createVariantMap({}, 'hover:bg-transparent'),
    borderColor: 'border-slate-200',
    border: createVariantMap(
      {
        primary: 'border border-slate-900',
        secondary: 'border border-slate-200',
        success: 'border border-emerald-200',
        warning: 'border border-amber-200',
        danger: 'border border-rose-200',
        info: 'border border-sky-200',
        mist: 'border border-sky-200',
        airy: 'border border-slate-100',
      },
      'border border-slate-200'
    ),
    borderless: createVariantMap({}, 'border-0'),
    input: createVariantMap(
      {
        primary: 'border-slate-300 bg-white text-slate-900 focus:ring-slate-300',
        secondary: 'border-slate-300 bg-white text-slate-900 focus:ring-slate-300',
        mist: 'border-sky-200 bg-sky-50 text-slate-900 focus:ring-sky-300',
      },
      'border-slate-300 bg-white text-slate-900 focus:ring-slate-300'
    ),
    select: createVariantMap(
      {
        mist: 'border-sky-200 bg-sky-50 text-slate-900 focus:ring-sky-300',
        dark: 'border-slate-200 bg-white text-slate-900',
      },
      'border-slate-300 bg-white text-slate-900'
    ),
    button: createVariantMap(
      {
        primary: 'bg-slate-900 text-white border border-slate-900',
        secondary: 'bg-white text-slate-900 border border-slate-200',
        success: 'bg-emerald-600 text-white border border-emerald-600',
        warning: 'bg-amber-500 text-white border border-amber-500',
        danger: 'bg-rose-600 text-white border border-rose-600',
        info: 'bg-sky-600 text-white border border-sky-600',
        mist: 'bg-sky-100 text-sky-800 border border-sky-200',
        teal: 'bg-teal-600 text-white border border-teal-600',
      },
      'bg-white text-slate-900 border border-slate-200'
    ),
    item: createVariantMap(
      {
        dark: 'bg-white text-slate-900',
      },
      'bg-white text-slate-900'
    ),
    icon: createVariantMap(
      {
        primary: 'text-slate-900',
        secondary: 'text-slate-600',
        success: 'text-emerald-600',
        warning: 'text-amber-600',
        danger: 'text-rose-600',
        info: 'text-sky-600',
        mist: 'text-sky-600',
      },
      'text-slate-600'
    ),
    dropdown: 'bg-white border border-slate-200 shadow-xl',
    tooltip: {
      primary: 'bg-slate-900 text-white',
      dark: 'bg-slate-900 text-white',
    },
    scrollbar: createVariantMap({}, 'scrollbar-thin scrollbar-thumb-slate-300'),
    ring: createVariantMap(
      {
        primary: 'ring-slate-900/10',
        secondary: 'ring-slate-200',
        success: 'ring-emerald-300',
        warning: 'ring-amber-300',
        danger: 'ring-rose-300',
        info: 'ring-sky-300',
        mist: 'ring-sky-300',
      },
      'ring-slate-200'
    ),
    baseDiv: createVariantMap(
      {
        default: 'bg-white border border-slate-200',
        secondary: 'bg-white border border-slate-200',
        mist: 'bg-sky-50 border border-sky-100',
        success: 'bg-emerald-50 border border-emerald-100',
        warning: 'bg-amber-50 border border-amber-100',
        danger: 'bg-rose-50 border border-rose-100',
        dark: 'bg-slate-900 border border-slate-800',
      },
      'bg-white border border-slate-200'
    ),
    thead: 'bg-slate-50',
    trHover: 'hover:bg-slate-50',
  }));
}
