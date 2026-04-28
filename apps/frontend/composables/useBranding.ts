export function useBranding() {
  const brandStyle = {
    background:
      'radial-gradient(circle at top, rgba(20,184,166,0.14), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
    color: 'var(--brand, #0f766e)',
  } as const;

  return {
    brandStyle,
  };
}
