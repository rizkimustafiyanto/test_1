import { useState } from '#imports';

import type { VariantKey } from '@flowforge/types';

export function useColorStore() {
  const variantState = useState<VariantKey>('theme-variant', () => 'primary');

  return {
    get variant() {
      return variantState.value;
    },
    setVariant(variant: VariantKey) {
      variantState.value = variant;
    },
  };
}
