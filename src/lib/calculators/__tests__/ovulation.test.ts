import { formatDanishDate } from "../dates";
import { computeOvulation } from "../ovulation";

describe("computeOvulation", () => {
  it("places ovulation 14 days before the next period with a six-day fertile window", () => {
    const result = computeOvulation({
      lastPeriodStart: "2026-10-01",
      cycleLength: "28",
      today: "2026-10-03",
    });

    if (!result.ok) throw new Error(result.message);
    expect(formatDanishDate(result.upcoming.ovulation)).toBe("15. oktober 2026");
    expect(formatDanishDate(result.upcoming.fertileStart)).toBe("10. oktober 2026");
    expect(formatDanishDate(result.upcoming.peakStart)).toBe("13. oktober 2026");
    expect(formatDanishDate(result.upcoming.nextPeriod)).toBe("29. oktober 2026");
    expect(result.daysUntilOvulation).toBe(12);
    expect(result.isFertileToday).toBe(false);
    expect(result.cycles).toHaveLength(3);
  });

  it("counts back from the next period, so a long cycle ovulates later", () => {
    const result = computeOvulation({
      lastPeriodStart: "2026-10-01",
      cycleLength: "35",
      today: "2026-10-03",
    });

    if (!result.ok) throw new Error(result.message);
    expect(formatDanishDate(result.upcoming.ovulation)).toBe("22. oktober 2026");
    // Terminen flyttes med cyklussens afvigelse fra 28 dage
    expect(formatDanishDate(result.upcoming.dueDateIfConceived)).toBe("15. juli 2027");
  });

  it("uses a shorter luteal phase when the visitor knows hers", () => {
    const result = computeOvulation({
      lastPeriodStart: "2026-10-01",
      cycleLength: "28",
      lutealPhase: "12",
      today: "2026-10-03",
    });

    if (!result.ok) throw new Error(result.message);
    expect(formatDanishDate(result.upcoming.ovulation)).toBe("17. oktober 2026");
  });

  it("skips to the next cycle once this cycle's ovulation has passed", () => {
    const result = computeOvulation({
      lastPeriodStart: "2026-10-01",
      cycleLength: "28",
      today: "2026-10-20",
    });

    if (!result.ok) throw new Error(result.message);
    expect(formatDanishDate(result.upcoming.periodStart)).toBe("29. oktober 2026");
    expect(formatDanishDate(result.upcoming.ovulation)).toBe("12. november 2026");
  });

  it("flags today as fertile inside the window", () => {
    const result = computeOvulation({
      lastPeriodStart: "2026-10-01",
      cycleLength: "28",
      today: "2026-10-12",
    });

    if (!result.ok) throw new Error(result.message);
    expect(result.isFertileToday).toBe(true);
  });

  it("refuses dates in the future, stale dates and impossible cycles", () => {
    const today = "2026-10-03";
    expect(
      computeOvulation({ lastPeriodStart: "2026-10-05", cycleLength: "28", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("fremtiden") });
    expect(
      computeOvulation({ lastPeriodStart: "2026-05-01", cycleLength: "28", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("3 måneder") });
    expect(
      computeOvulation({ lastPeriodStart: "2026-10-01", cycleLength: "15", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("cykluslængde") });
    expect(
      computeOvulation({ lastPeriodStart: "2026-10-01", cycleLength: "21", lutealPhase: "16", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("Lutealfasen") });
  });
});
