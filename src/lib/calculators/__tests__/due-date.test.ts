import { formatDanishDate } from "../dates";
import { computeDueDate } from "../due-date";

describe("computeDueDate", () => {
  it("puts the due date 280 days after the last period, as the Danish guideline does", () => {
    const result = computeDueDate({
      method: "lastPeriod",
      date: "2026-04-01",
      cycleLength: "",
      today: "2026-06-24",
    });

    if (!result.ok) throw new Error(result.message);
    expect(formatDanishDate(result.dueDate)).toBe("6. januar 2027");
    // 84 dage = 12+0, og man er i 13. uge
    expect(result).toMatchObject({
      gestationalWeeks: 12,
      gestationalDays: 0,
      currentWeek: 13,
      trimester: 1,
      daysUntilDue: 196,
      cycleAdjustmentDays: 0,
    });
  });

  it("moves the due date by the days a cycle differs from 28", () => {
    const shared = { method: "lastPeriod", date: "2026-04-01", today: "2026-06-24" } as const;
    const long = computeDueDate({ ...shared, cycleLength: "35" });
    const short = computeDueDate({ ...shared, cycleLength: "25" });

    if (!long.ok || !short.ok) throw new Error("expected results");
    expect(formatDanishDate(long.dueDate)).toBe("13. januar 2027");
    expect(formatDanishDate(short.dueDate)).toBe("3. januar 2027");
    expect(long.gestationalWeeks).toBe(11);
    expect(long.isCycleUncertain).toBe(true);
    expect(short.isCycleUncertain).toBe(false);
  });

  it("counts a known conception or fertility treatment as week 2+0", () => {
    const result = computeDueDate({
      method: "conception",
      date: "2026-04-15",
      today: "2026-06-24",
    });

    if (!result.ok) throw new Error(result.message);
    expect(formatDanishDate(result.dueDate)).toBe("6. januar 2027");
    expect(result.gestationalWeeks).toBe(12);
  });

  it("dates the scans from the start of the pregnancy and marks the ones that have passed", () => {
    const result = computeDueDate({
      method: "lastPeriod",
      date: "2026-04-01",
      today: "2026-06-24",
    });

    if (!result.ok) throw new Error(result.message);
    const nuchal = result.milestones[0];
    expect(nuchal.weeksLabel).toBe("11+2 – 13+6");
    expect(formatDanishDate(nuchal.start)).toBe("19. juni 2026");
    expect(nuchal.isPassed).toBe(false);
    expect(result.milestones.find((m) => m.label === "Termin")?.weeksLabel).toBe("40+0");
  });

  it("refuses future dates, dates long ago and impossible cycles", () => {
    const today = "2026-06-24";
    expect(
      computeDueDate({ method: "lastPeriod", date: "2026-07-01", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("fremtiden") });
    expect(
      computeDueDate({ method: "lastPeriod", date: "2025-06-01", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("44 uger") });
    expect(
      computeDueDate({ method: "lastPeriod", date: "2026-04-01", cycleLength: "60", today })
    ).toMatchObject({ ok: false, message: expect.stringContaining("cykluslængde") });
  });
});
