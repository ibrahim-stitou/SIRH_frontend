// Utility: convert optional string to nullable number
export function toNullableNumber(v?: string): number | null {
  return v === undefined || v === '' ? null : parseFloat(v);
}

// Utility: strict numeric parsing for required fields
export function safeNumber(value: string, fieldLabel: string): number {
  if (value === '' || isNaN(Number(value))) {
    throw new Error(`Valeur invalide pour ${fieldLabel}`);
  }
  return parseFloat(value);
}

export {};

