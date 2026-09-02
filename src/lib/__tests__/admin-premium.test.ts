import { resolvePremiumGrantEndDate } from "@/lib/admin-premium";

describe("resolvePremiumGrantEndDate", () => {
  // Built from local parts so month math assertions do not depend on the
  // machine timezone.
  const now = new Date(2026, 8, 2, 10, 0, 0);

  it("turns a preset month count into an end date", () => {
    const result = resolvePremiumGrantEndDate({ now, durationMonths: 3 });

    if ("error" in result) throw new Error(result.error);
    expect(result.endDate.getFullYear()).toBe(2026);
    expect(result.endDate.getMonth()).toBe(11);
    expect(result.endDate.getDate()).toBe(2);
  });

  it("clamps to the last day of the month when the start day does not exist there", () => {
    const endOfJanuary = new Date(2026, 0, 31, 10, 0, 0);

    const result = resolvePremiumGrantEndDate({
      now: endOfJanuary,
      durationMonths: 1,
    });

    if ("error" in result) throw new Error(result.error);
    expect(result.endDate.getMonth()).toBe(1);
    expect(result.endDate.getDate()).toBe(28);
  });

  it("rejects a month count that is not one of the presets", () => {
    expect(resolvePremiumGrantEndDate({ now, durationMonths: 7 })).toEqual({
      error: "Vælg en gyldig periode",
    });
  });

  it("runs a custom end date to the end of the chosen day", () => {
    const result = resolvePremiumGrantEndDate({ now, customEndDate: "2026-12-24" });

    if ("error" in result) throw new Error(result.error);
    expect(result.endDate.toISOString()).toBe("2026-12-24T23:59:59.999Z");
  });

  it("rejects a custom end date in the past", () => {
    expect(resolvePremiumGrantEndDate({ now, customEndDate: "2020-01-01" })).toEqual({
      error: "Slutdatoen skal ligge i fremtiden",
    });
  });

  it("rejects a custom end date further out than five years", () => {
    expect(resolvePremiumGrantEndDate({ now, customEndDate: "2099-01-01" })).toEqual({
      error: "Slutdatoen kan højst være 5 år frem",
    });
  });

  it("rejects a calendar date that does not exist instead of rolling it over", () => {
    expect(resolvePremiumGrantEndDate({ now, customEndDate: "2027-02-31" })).toEqual({
      error: "Slutdatoen er ikke en gyldig dato",
    });
  });

  it("requires either a preset or a custom end date", () => {
    expect(resolvePremiumGrantEndDate({ now })).toEqual({
      error: "Vælg en periode eller en slutdato",
    });
  });
});
