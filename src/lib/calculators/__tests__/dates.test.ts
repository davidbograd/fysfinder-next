import {
  addDays,
  daysBetween,
  formatDanishDate,
  formatDanishDateRange,
  formatDanishWeekday,
  parseIsoDate,
  todayIsoDate,
} from "../dates";

describe("calendar date helpers", () => {
  it("reads date-field values and rejects impossible dates", () => {
    expect(parseIsoDate("2026-04-01")?.toISOString()).toBe(
      "2026-04-01T00:00:00.000Z"
    );
    expect(parseIsoDate("2026-02-31")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate("1/4/2026")).toBeNull();
  });

  it("counts whole days across the switch to daylight saving time", () => {
    const beforeSwitch = parseIsoDate("2026-03-28")!;
    expect(daysBetween(beforeSwitch, addDays(beforeSwitch, 2))).toBe(2);
    expect(formatDanishDate(addDays(beforeSwitch, 2))).toBe("30. marts 2026");
  });

  it("writes dates the Danish way", () => {
    const date = parseIsoDate("2027-01-08")!;
    expect(formatDanishDate(date)).toBe("8. januar 2027");
    expect(formatDanishWeekday(date)).toBe("fredag");
    expect(
      formatDanishDateRange(parseIsoDate("2026-11-09")!, parseIsoDate("2026-11-14")!)
    ).toBe("9.–14. november");
    expect(
      formatDanishDateRange(parseIsoDate("2026-10-28")!, parseIsoDate("2026-11-02")!)
    ).toBe("28. oktober – 2. november");
  });

  it("uses the visitor's own calendar day for today", () => {
    expect(todayIsoDate(new Date(2026, 9, 19, 23, 30))).toBe("2026-10-19");
  });
});
