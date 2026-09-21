// Added: 2026-09-21 - Hvilestofskifte beregner (Mifflin-St Jeor).
import { computeRestingMetabolicRate } from "../resting-metabolic-rate";

describe("computeRestingMetabolicRate", () => {
  it("uses Mifflin-St Jeor for men", () => {
    const result = computeRestingMetabolicRate({
      gender: "male",
      age: "30",
      heightCm: "180",
      weightKg: "80",
    });

    // 10 x 80 + 6,25 x 180 - 5 x 30 + 5
    expect(result).toMatchObject({
      ok: true,
      kcalPerDay: 1780,
      kjPerDay: 7448,
      kcalPerHour: 74.2,
      kcalPerKgPerDay: 22.3,
    });
  });

  it("echoes back the values it calculated on", () => {
    const result = computeRestingMetabolicRate({
      gender: "male",
      age: "31",
      heightCm: "193",
      weightKg: "100",
    });

    expect(result).toMatchObject({
      ok: true,
      profile: { gender: "male", age: 31, heightCm: 193, weightKg: 100 },
    });
  });

  it("uses the women's constant", () => {
    const result = computeRestingMetabolicRate({
      gender: "female",
      age: "30",
      heightCm: "168",
      weightKg: "65",
    });

    // 10 x 65 + 6,25 x 168 - 5 x 30 - 161
    expect(result).toMatchObject({ ok: true, kcalPerDay: 1389 });
  });

  it("returns a lower resting metabolism for a woman with the same body", () => {
    const shared = { age: "40", heightCm: "175", weightKg: "75" } as const;
    const man = computeRestingMetabolicRate({ gender: "male", ...shared });
    const woman = computeRestingMetabolicRate({ gender: "female", ...shared });

    if (!man.ok || !woman.ok) throw new Error("expected results");
    expect(woman.kcalPerDay).toBeLessThan(man.kcalPerDay);
  });

  it("drops with age when everything else is equal", () => {
    const young = computeRestingMetabolicRate({
      gender: "male",
      age: "25",
      heightCm: "180",
      weightKg: "80",
    });
    const older = computeRestingMetabolicRate({
      gender: "male",
      age: "65",
      heightCm: "180",
      weightKg: "80",
    });

    if (!young.ok || !older.ok) throw new Error("expected results");
    expect(older.kcalPerDay).toBeLessThan(young.kcalPerDay);
  });

  it("asks for the missing pieces instead of guessing", () => {
    expect(
      computeRestingMetabolicRate({
        gender: "",
        age: "30",
        heightCm: "180",
        weightKg: "80",
      })
    ).toMatchObject({ ok: false });

    expect(
      computeRestingMetabolicRate({
        gender: "male",
        age: "30",
        heightCm: "18",
        weightKg: "80",
      })
    ).toMatchObject({ ok: false });

    expect(
      computeRestingMetabolicRate({
        gender: "male",
        age: "30",
        heightCm: "180",
        weightKg: "",
      })
    ).toMatchObject({ ok: false });
  });
});
