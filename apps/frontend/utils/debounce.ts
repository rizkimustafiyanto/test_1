export function createDebouncer<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void | Promise<void>,
  delay = 250
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      void callback(...args);
    }, delay);
  };
}
