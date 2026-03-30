// Added: 2026-03-30 - Simple slug helper mock for Jest compatibility.
export function slug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
