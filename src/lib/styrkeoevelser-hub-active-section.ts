/** Pick the last section whose top has reached/crossed the sticky activation line. */
export function resolveActiveHubSectionId(
  sections: ReadonlyArray<{ id: string; top: number }>,
  activationLinePx: number
): string | null {
  let current: string | null = null;
  for (const section of sections) {
    if (section.top <= activationLinePx) {
      current = section.id;
    }
  }
  return current;
}
