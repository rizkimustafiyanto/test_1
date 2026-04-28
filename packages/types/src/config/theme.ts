export type ThemeMode = 'light' | 'dark';

export type VariantKey =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'subtle'
  | 'success'
  | 'warning'
  | 'danger'
  | 'red'
  | 'info'
  | 'glass'
  | 'mist'
  | 'haze'
  | 'smooth'
  | 'softBlue'
  | 'softGreen'
  | 'softPink'
  | 'pastel'
  | 'airy'
  | 'softYellow'
  | 'softIndigo'
  | 'meta'
  | 'subtleMeta'
  | 'ghost'
  | 'gray'
  | 'stone'
  | 'lilac'
  | 'teal'
  | 'orange'
  | 'lime'
  | 'violet'
  | 'indigo'
  | 'brown'
  | 'sky'
  | 'dark'
  | 'rose'
  | 'softTeal'
  | 'softOrange'
  | 'softViolet'
  | 'softCyan'
  | 'softRose';

export interface VariantModeClasses {
  light: string;
  dark: string;
}

export type Variants = Record<VariantKey, VariantModeClasses>;

export type VariantMap = Record<VariantKey, string>;

export interface ThemeClass {
  baseDiv: {
    default: string;
    muted: string;
  } & VariantMap;

  thead: string;
  trHover: string;

  borderColor: string;
  border: VariantMap;
  borderless: VariantMap;

  background: VariantMap;
  backgroundless: VariantMap;

  text: VariantMap;
  textless: VariantMap;

  hoverText: VariantMap;
  hoverTextLess: VariantMap;

  hover: VariantMap;
  hoverless: VariantMap;

  input: VariantMap;
  select: VariantMap;

  button: VariantMap;
  item: VariantMap;
  icon: VariantMap;

  dropdown: string;

  tooltip: {
    primary: string;
    dark: string;
  };

  scrollbar: VariantMap;
  ring: VariantMap;
}
