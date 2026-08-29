// Updated: 2026-08-30 - Covers duration derivation for the logo marquee.
import {
  MARQUEE_SPEED_PX_PER_SECOND,
  getMarqueeDurationSeconds,
} from "../marquee-timing";

describe("getMarqueeDurationSeconds", () => {
  it("derives the duration from the loop distance at the default speed", () => {
    expect(getMarqueeDurationSeconds(4424)).toBeCloseTo(
      4424 / MARQUEE_SPEED_PX_PER_SECOND
    );
  });

  it("keeps the speed constant as the strip grows", () => {
    const short = getMarqueeDurationSeconds(1000);
    const long = getMarqueeDurationSeconds(2000);

    expect(long).toBeCloseTo(short * 2);
  });

  it("honours an explicit speed", () => {
    expect(getMarqueeDurationSeconds(600, 30)).toBe(20);
  });

  it("returns 0 when there is nothing to scroll", () => {
    expect(getMarqueeDurationSeconds(0)).toBe(0);
    expect(getMarqueeDurationSeconds(-500)).toBe(0);
    expect(getMarqueeDurationSeconds(Number.NaN)).toBe(0);
    expect(getMarqueeDurationSeconds(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("returns 0 for a non-positive speed instead of dividing by zero", () => {
    expect(getMarqueeDurationSeconds(4424, 0)).toBe(0);
    expect(getMarqueeDurationSeconds(4424, -60)).toBe(0);
  });
});
