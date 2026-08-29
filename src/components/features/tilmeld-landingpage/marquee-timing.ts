// Updated: 2026-08-30 - Derive marquee duration from the measured loop distance.

/**
 * Horizontal speed of the logo marquee. The duration is derived from this so the
 * perceived speed stays the same no matter how wide the logo strip grows, and so
 * narrow viewports get the same px/s as wide ones.
 */
export const MARQUEE_SPEED_PX_PER_SECOND = 45;

/**
 * A duration of 0 means "do not animate" — the caller has nothing measurable to
 * scroll yet.
 */
export function getMarqueeDurationSeconds(
  loopDistancePx: number,
  pxPerSecond: number = MARQUEE_SPEED_PX_PER_SECOND
): number {
  if (!Number.isFinite(loopDistancePx) || loopDistancePx <= 0) {
    return 0;
  }

  if (!Number.isFinite(pxPerSecond) || pxPerSecond <= 0) {
    return 0;
  }

  return loopDistancePx / pxPerSecond;
}
