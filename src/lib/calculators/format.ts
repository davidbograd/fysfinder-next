/** Dansk decimalkomma, fx 47,7. */
export function formatDecimal(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace(".", ",");
}

/** Viser kun decimaler, når der er nogen: 100 -> "100", 82,5 -> "82,5". */
export function formatCompact(value: number, maxDecimals = 1): string {
  const factor = 10 ** maxDecimals;
  const rounded = Math.round(value * factor) / factor;
  return Number.isInteger(rounded)
    ? String(rounded)
    : formatDecimal(rounded, maxDecimals);
}

/** Dansk tusindtalsseparator, fx 1.780. */
export function formatInteger(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
