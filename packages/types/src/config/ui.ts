import type { VariantKey } from './theme.js';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

export type FieldSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonType = 'button' | 'submit' | 'reset';
export type ButtonVariant = VariantKey;
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type IconType = string | string[];

export interface Tab {
  label: string;
  value: string;
}

export interface Pagination {
  limit?: number;
  [key: string]: any;
}

export interface Column {
  key: string;
  label: string;
}
