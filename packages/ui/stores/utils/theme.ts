import { useState } from '#imports';

export function useThemeStore() {
  const themeState = useState<'light' | 'dark'>('theme-mode', () => 'light');

  return {
    get theme() {
      return themeState.value;
    },
    toggleTheme() {
      themeState.value = themeState.value === 'light' ? 'dark' : 'light';
    },
  };
}
