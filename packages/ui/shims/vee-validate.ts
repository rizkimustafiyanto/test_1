import { ref, type Ref } from 'vue';

export type FieldMeta<TValue = unknown> = {
  touched?: boolean;
  valid?: boolean;
  validated?: boolean;
  initialValue?: TValue;
};

export function useField<TValue = unknown>(
  _name: string,
  _rules?: unknown,
  _options?: Record<string, unknown>
): {
  value: Ref<TValue>;
  errorMessage: Ref<string | undefined>;
  meta: FieldMeta<TValue>;
  setValue: (value: TValue, shouldValidate?: boolean) => void;
  setTouched: (value: boolean) => void;
  validate: () => Promise<unknown>;
  handleBlur: () => void;
} {
  const value = ref<TValue>() as Ref<TValue>;
  const errorMessage = ref<string>();
  const meta: FieldMeta<TValue> = {
    touched: false,
    valid: true,
    validated: false,
  };

  return {
    value,
    errorMessage,
    meta,
    setValue(nextValue: TValue) {
      value.value = nextValue;
    },
    setTouched(touched: boolean) {
      meta.touched = touched;
      meta.validated = touched;
    },
    async validate() {
      meta.valid = !errorMessage.value;
      meta.validated = true;
      return meta.valid;
    },
    handleBlur() {
      meta.touched = true;
    },
  };
}
