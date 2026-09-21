// Every calculator form accepts both "82,5" and "82.5"; the body-fat calculator
// already owns that parser, so the tools share one input tolerance.
export { parseNumLoose as parseDecimal } from "@/lib/bodyFat";

/**
 * Keeps a text field numeric while it is being typed: digits only, at most one
 * decimal separator, shown with the Danish comma.
 */
export function sanitizeNumericInput(
  value: string,
  { allowDecimal = true }: { allowDecimal?: boolean } = {}
): string {
  const digitsAndSeparators = value.replace(/[^\d.,]/g, "");

  if (!allowDecimal) {
    return digitsAndSeparators.replace(/[.,]/g, "");
  }

  const [whole, ...fractions] = digitsAndSeparators
    .replace(/\./g, ",")
    .split(",");

  return fractions.length > 0 ? `${whole},${fractions.join("")}` : whole;
}
