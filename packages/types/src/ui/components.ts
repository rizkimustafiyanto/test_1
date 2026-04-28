import type { CardType, GridDirection } from '../config/card.js';
import type { VariantKey } from '../config/theme.js';
import type {
  ButtonSize,
  ButtonType,
  ButtonVariant,
  FieldSize,
  IconType,
  Rounded,
  TextSize,
} from '../config/ui.js';

export interface BadgeProps {
  variantText?: VariantKey;
  variantBGColor?: VariantKey;
  variantHover?: VariantKey;
  textSize?: TextSize;
  rounded?: Rounded;
}

export interface ButtonProps {
  type?: ButtonType;
  variant?: ButtonVariant;
  label?: string;
  icon?: IconType | null;
  isLoading?: boolean;
  loading?: boolean;
  disabled?: boolean;
  customClass?: string;
  iconClass?: string;
  size?: ButtonSize;
  noBg?: boolean;
  noBorder?: boolean;
  noHover?: boolean;
  ignoreVariant?: boolean;
  rounded?: Rounded;
}

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  buttonLabel?: string;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
}

export interface CardProps {
  type?: CardType;
  size?: FieldSize;
  gridDirection?: GridDirection;
  cols?: number;
  width?: string;
  height?: string;
  gap?: number;
  classOverride?: string;
  styleOverride?: Record<string, string | number>;
  variant?: VariantKey;
  hasRing?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export type ChartType = 'line' | 'bar' | 'area' | 'donut' | 'pie';

export interface ChartProps {
  type?: ChartType;
  height?: string | number;
  categories?: (string | number)[];
  data?: (string | number)[];
  hoverOnly?: boolean;
  format?: 'raw' | 'currency' | 'percent' | 'custom';
  currency?: string;
  locale?: string;
  customFormatter?: ((val: number) => string) | null;
}

export interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  modelValue?: string | number | Date | any[];
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: string;
  type?: string;
  placeholder?: string;
  icon?: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  variant?: VariantKey;
  rounded?: Rounded;
  size?: FieldSize;
  sizeVariant?: FieldSize;
  telCountries?: TelCountryOption[];
  helper?: string;
  errorMessage?: string;
  successMessage?: string;
  touched?: boolean;
  submitted?: boolean;
  loading?: boolean;
  readonly?: boolean;
}

export interface OtpInputProps {
  id?: string;
  name?: string;
  label?: string;
  modelValue?: string;
  length?: number;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  helper?: string;
  errorMessage?: string;
  successMessage?: string;
  touched?: boolean;
  submitted?: boolean;
  autocomplete?: string;
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  placeholderChar?: string;
}

export interface InputSizeClass {
  font: string;
  wrapper: string;
  icon: string;
}

export interface TelCountryOption {
  code: string;
  label: string;
}

export type SpinnerType = 'full' | 'mini';

export interface LoadingSpinnerProps {
  type?: SpinnerType;
  message?: string;
}

export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  title?: string | null;
  message: string;
  tone: NotificationTone;
  createdAt: Date;
  readAt?: Date | null;
  dismissible?: boolean;
  targetPath?: string | null;
}

export interface NavbarMenuItem {
  key: string;
  label: string;
  icon?: string;
  children?: NavbarMenuItem[];
}

export interface NavbarProps {
  active?: string;
  title?: string;
  logoSrc?: string;
  menuItems?: NavbarMenuItem[];
}

export interface PaginationState {
  currentPage?: number;
  limit?: number;
  totalData?: number;
}

export interface PaginationProps {
  pagination?: PaginationState;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export interface RadioOption<Value = string | number | boolean> {
  label: string;
  value: Value;
}

export interface RadioButtonProps<Value = string | number | boolean> {
  modelValue?: Value;
  label?: string;
  options: RadioOption<Value>[];
  type?: 'horizontal' | 'vertical';
  variant?: string;
  noBorder?: boolean;
  sizeVariant?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
}

export interface ResponseModalProps {
  visible: boolean;
  status: string;
  message: string;
}

export interface ContentModalMetaItem {
  label: string;
  value: string;
}

export interface ContentModalPayload {
  title: string;
  subtitle?: string | null;
  dateLabel?: string | null;
  imageSrc?: string | null;
  imageAlt?: string | null;
  contentText?: string | null;
  contentHtml?: string | null;
  meta?: ContentModalMetaItem[];
}

export interface ContentModalState {
  isOpen: boolean;
  payload: ContentModalPayload | null;
}

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: string;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  modelValue?: string | number;
  options?: SelectOption[];
  placeholder?: string;
  type?: 'default' | 'search';
  searchPlaceholder?: string;
  onSearch?: (val: string) => void;
  emptyStateText?: string;
  notFoundText?: string;
  clearable?: boolean;
  clearValue?: string | number;
  disabled?: boolean;
  sizeVariant?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  required?: boolean;
  helper?: string;
  errorMessage?: string;
  successMessage?: string;
  touched?: boolean;
  submitted?: boolean;
  loading?: boolean;
}
