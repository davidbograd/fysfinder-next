import { computeDueDate, DueDateSuccess } from "@/lib/calculators/due-date";
import {
  buildDueDateShareUrl,
  canShareDueDate,
  parseDueDateShareParams,
} from "../due-date-share";

function dueDate(date: string, today = "2026-11-06"): DueDateSuccess {
  const result = computeDueDate({ method: "lastPeriod", date, today });
  if (!result.ok) throw new Error(result.message);
  return result;
}

describe("due date share link", () => {
  it("only carries the due date and the elapsed days – never the period date", () => {
    const url = buildDueDateShareUrl(dueDate("2026-10-07"));

    expect(url).toBe("/api/og/termin?termin=2027-07-14&dag=30");
    expect(url).not.toContain("2026-10-07");
  });

  it("leaves out the week for a planned pregnancy", () => {
    expect(buildDueDateShareUrl(dueDate("2026-12-01"))).toBe(
      "/api/og/termin?termin=2027-09-07"
    );
  });

  it("does not offer sharing once the pregnancy has ended", () => {
    expect(canShareDueDate(dueDate("2025-01-01"))).toBe(false);
    expect(canShareDueDate(dueDate("2026-10-07"))).toBe(true);
  });

  it("round-trips the progress shown on the card", () => {
    const content = parseDueDateShareParams(
      new URLSearchParams("termin=2027-06-30&dag=200")
    );

    expect(content?.progress).toEqual({
      elapsedDays: 200,
      weeks: 28,
      days: 4,
      currentWeek: 29,
      trimester: 3,
      progressPct: 71,
    });
  });

  it.each([
    "",
    "termin=2027-02-30",
    "termin=1990-01-01",
    "termin=2027-06-30&dag=-1",
    "termin=2027-06-30&dag=1.5",
    "termin=2027-06-30&dag=294",
  ])("rejects %p", (query) => {
    expect(parseDueDateShareParams(new URLSearchParams(query))).toBeNull();
  });
});
