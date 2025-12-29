// Utility: safe number formatting with optional suffix
export function formatNumber(val: unknown, digits = 2, suffix = ''): string {
  return typeof val === 'number' && isFinite(val as number)
    ? (val as number).toFixed(digits) + (suffix ? ` ${suffix}` : '')
    : '-';
}

export {};
