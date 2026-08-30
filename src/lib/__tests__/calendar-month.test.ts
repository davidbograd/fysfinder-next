import {
  getCalendarMonthBounds,
  getPreviousCalendarMonthBounds,
  parsePeriodYm,
  titleCaseDanishMonth,
  wasOwnedDuringPeriod,
} from "../calendar-month";

describe("parsePeriodYm", () => {
  it("parses a valid YYYY-MM period", () => {
    expect(parsePeriodYm("2026-07")).toEqual({ year: 2026, month: 7 });
  });

  it("rejects invalid periods", () => {
    expect(() => parsePeriodYm("2026-13")).toThrow(/Ugyldig/);
    expect(() => parsePeriodYm("july")).toThrow(/Ugyldig/);
  });
});

describe("getCalendarMonthBounds", () => {
  it("uses Europe/Copenhagen start and end for August", () => {
    const bounds = getCalendarMonthBounds(2026, 8);

    expect(bounds.periodYm).toBe("2026-08");
    expect(bounds.monthLabelDa).toBe("august");
    expect(titleCaseDanishMonth(bounds.monthLabelDa)).toBe("August");
    expect(bounds.startIso).toBe("2026-07-31T22:00:00.000Z");
    expect(bounds.endIso).toBe("2026-08-31T21:59:59.999Z");
  });

  it("uses CET offset for January", () => {
    const bounds = getCalendarMonthBounds(2026, 1);

    expect(bounds.startIso).toBe("2025-12-31T23:00:00.000Z");
    expect(bounds.endIso).toBe("2026-01-31T22:59:59.999Z");
  });
});

describe("getPreviousCalendarMonthBounds", () => {
  it("returns August when run on 2 September in Copenhagen", () => {
    const bounds = getPreviousCalendarMonthBounds(
      new Date("2026-09-02T07:00:00.000Z")
    );

    expect(bounds.periodYm).toBe("2026-08");
    expect(bounds.monthLabelDa).toBe("august");
  });

  it("wraps the year from early January to December", () => {
    const bounds = getPreviousCalendarMonthBounds(
      new Date("2026-01-02T10:00:00.000Z")
    );

    expect(bounds.periodYm).toBe("2025-12");
    expect(bounds.monthLabelDa).toBe("december");
  });
});

describe("wasOwnedDuringPeriod", () => {
  const periodEnd = "2026-08-31T21:59:59.999Z";

  it("includes clinics owned before the period ends", () => {
    expect(wasOwnedDuringPeriod("2026-08-20T12:00:00.000Z", periodEnd)).toBe(
      true
    );
  });

  it("excludes clinics owned after the period ends", () => {
    expect(wasOwnedDuringPeriod("2026-09-01T00:00:00.000Z", periodEnd)).toBe(
      false
    );
  });
});
