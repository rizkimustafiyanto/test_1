declare module '#imports' {
  export function useState<T>(key: string, init?: () => T): import('vue').Ref<T>;
}
