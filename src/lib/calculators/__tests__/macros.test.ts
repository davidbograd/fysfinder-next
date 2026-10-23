import { computeMacros, MacroInput } from "../macros";
import { mifflinStJeor } from "../resting-metabolic-rate";

const base: MacroInput = {
  calorieSource: "known",
  kcal: "2500",
  weightKg: "80",
  age: "30",
  activity: "moderat",
  goal: "vedligehold",
  split: "proteinfokus",
};

describe("computeMacros", () => {
  it("sets protein from body weight, fat to 30 % and gives the rest to carbs", () => {
    const result = computeMacros(base);

    // Vedligehold, moderat: 1,2-1,6 g/kg -> 1,4 g/kg x 80 kg = 112 g
    expect(result).toMatchObject({
      ok: true,
      kcalPerDay: 2500,
      maintenanceKcal: null,
      proteinPerKg: 1.4,
      macros: {
        protein: { grams: 112, kcal: 448, pct: 18 },
        fat: { grams: 83, kcal: 750, pct: 30 },
        carbs: { grams: 326, kcal: 1302, pct: 52 },
      },
      outsideNnr: [],
    });
  });

  it("needs no weight or age for a known calorie target with the NNR split", () => {
    const result = computeMacros({ ...base, split: "nnr", weightKg: "", age: "" });

    expect(result).toMatchObject({
      ok: true,
      proteinPerKg: null,
      profile: { weightKg: null, age: null },
      macros: { protein: { grams: 94, pct: 15 } },
    });
    expect(
      computeMacros({ ...base, split: "proteinfokus", weightKg: "", age: "" })
    ).toMatchObject({ ok: false });
  });

  it("follows NNR 2023's 15/33/52 split", () => {
    const result = computeMacros({ ...base, split: "nnr" });

    expect(result).toMatchObject({
      macros: {
        protein: { grams: 94, pct: 15 },
        fat: { grams: 92, pct: 33 },
        carbs: { grams: 325, pct: 52 },
      },
    });
  });

  it("flags low-carb fat and carbs outside the Nordic ranges", () => {
    const result = computeMacros({ ...base, split: "lavkulhydrat" });

    if (!result.ok) throw new Error(result.message);
    expect(result.macros.carbs.pct).toBe(25);
    expect(result.macros.fat.pct).toBe(57);
    expect(result.outsideNnr).toEqual(["carbs", "fat"]);
  });

  it("estimates calories with Mifflin-St Jeor and the goal's deficit", () => {
    const result = computeMacros({
      ...base,
      calorieSource: "estimate",
      kcal: "",
      gender: "male",
      heightCm: "180",
      goal: "vaegttab",
    });

    const maintenance = Math.round(mifflinStJeor("male", 80, 180, 30) * 1.55);
    expect(result).toMatchObject({
      ok: true,
      maintenanceKcal: maintenance,
      kcalPerDay: maintenance - 500,
    });
  });

  it("refuses a split the calories cannot cover", () => {
    const result = computeMacros({
      ...base,
      kcal: "1200",
      weightKg: "120",
      goal: "vaegttab",
      activity: "haard",
    });

    expect(result).toMatchObject({
      ok: false,
      message: expect.stringContaining("proteinbehov"),
    });
  });

  it("asks for the missing calorie inputs", () => {
    expect(computeMacros({ ...base, kcal: "300" })).toMatchObject({
      ok: false,
      message: expect.stringContaining("kalorietal"),
    });
    expect(
      computeMacros({ ...base, calorieSource: "estimate", gender: "", heightCm: "180" })
    ).toMatchObject({ ok: false, message: expect.stringContaining("køn") });
  });
});
