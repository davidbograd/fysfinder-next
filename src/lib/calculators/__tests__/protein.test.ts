// Added: 2026-09-21 - Proteinberegner (dagligt proteinbehov).
import {
  computeProteinNeed,
  DEFAULT_MEALS_PER_DAY,
  proteinRangePerKg,
} from "../protein";

describe("computeProteinNeed", () => {
  it("turns the g/kg range into a daily range, a target and a per-meal portion", () => {
    const result = computeProteinNeed({
      weightKg: "80",
      age: "30",
      goal: "muskelopbygning",
      activity: "haard",
      mealsPerDay: "4",
    });

    // 1,8-2,2 g/kg for 80 kg
    expect(result).toMatchObject({
      ok: true,
      gramsPerKgLow: 1.8,
      gramsPerKgHigh: 2.2,
      gramsPerDayLow: 144,
      gramsPerDayHigh: 176,
      gramsPerDayTarget: 160,
      gramsPerMeal: 40,
      kcalFromProtein: 640,
    });
  });

  it("asks for more protein during weight loss than during maintenance", () => {
    const shared = {
      weightKg: "80",
      age: "30",
      activity: "moderat",
      mealsPerDay: "",
    } as const;

    const maintenance = computeProteinNeed({ ...shared, goal: "vedligehold" });
    const weightLoss = computeProteinNeed({ ...shared, goal: "vaegttab" });

    if (!maintenance.ok || !weightLoss.ok) throw new Error("expected results");
    expect(weightLoss.gramsPerDayTarget).toBeGreaterThan(
      maintenance.gramsPerDayTarget
    );
  });

  it("raises the floor from 65 years", () => {
    const younger = proteinRangePerKg("vedligehold", "stillesiddende", 40);
    const senior = proteinRangePerKg("vedligehold", "stillesiddende", 70);

    expect(younger).toMatchObject({ low: 0.8, isSeniorAdjusted: false });
    expect(senior).toMatchObject({ low: 1.2, high: 1.5, isSeniorAdjusted: true });
  });

  it("does not lower an already higher recommendation for seniors", () => {
    const senior = proteinRangePerKg("muskelopbygning", "haard", 70);

    expect(senior).toMatchObject({
      low: 1.8,
      high: 2.2,
      isSeniorAdjusted: false,
    });
  });

  it("falls back to the default number of meals when the field is empty", () => {
    const result = computeProteinNeed({
      weightKg: "70",
      age: "30",
      goal: "vedligehold",
      activity: "let",
      mealsPerDay: "",
    });

    expect(result).toMatchObject({
      ok: true,
      mealsPerDay: DEFAULT_MEALS_PER_DAY,
    });
  });

  it("adds the NNR 2023 grams for pregnancy and breastfeeding on top of the daily values", () => {
    const base = {
      weightKg: "64",
      age: "30",
      goal: "vedligehold",
      activity: "stillesiddende",
      mealsPerDay: "4",
    } as const;

    const notPregnant = computeProteinNeed(base);
    const thirdTrimester = computeProteinNeed({ ...base, pregnancy: "trimester3" });
    const fullBreastfeeding = computeProteinNeed({ ...base, lactation: "fuld" });
    const partialBreastfeeding = computeProteinNeed({ ...base, lactation: "delvis" });

    if (
      !notPregnant.ok ||
      !thirdTrimester.ok ||
      !fullBreastfeeding.ok ||
      !partialBreastfeeding.ok
    ) {
      throw new Error("expected results");
    }

    expect(notPregnant).toMatchObject({ pregnancyExtraGrams: 0, lactationExtraGrams: 0 });
    expect(thirdTrimester.gramsPerDayTarget).toBe(notPregnant.gramsPerDayTarget + 28);
    expect(thirdTrimester.gramsPerDayLow).toBe(notPregnant.gramsPerDayLow + 28);
    expect(thirdTrimester.gramsPerKgLow).toBe(notPregnant.gramsPerKgLow);
    expect(fullBreastfeeding.gramsPerDayTarget).toBe(notPregnant.gramsPerDayTarget + 19);
    expect(partialBreastfeeding.gramsPerDayTarget).toBe(notPregnant.gramsPerDayTarget + 13);
  });

  it("rejects weights and meal counts it cannot work with", () => {
    const base = {
      age: "30",
      goal: "vedligehold",
      activity: "let",
      mealsPerDay: "4",
    } as const;

    expect(computeProteinNeed({ ...base, weightKg: "" })).toMatchObject({
      ok: false,
    });
    expect(computeProteinNeed({ ...base, weightKg: "5" })).toMatchObject({
      ok: false,
    });
    expect(
      computeProteinNeed({ ...base, weightKg: "70", mealsPerDay: "12" })
    ).toMatchObject({ ok: false });
  });
});
