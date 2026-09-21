// Added: 2026-09-21 - Muskelmasse beregner (maalebaand og Lee-ligningen).
import { computeMuscleMass } from "../muscle-mass";

describe("computeMuscleMass – simple method", () => {
  it("applies the Lee equation", () => {
    const result = computeMuscleMass({
      method: "simple",
      gender: "male",
      age: "30",
      heightCm: "180",
      weightKg: "80",
    });

    // 0,244 x 80 + 7,8 x 1,80 - 0,098 x 30 + 6,6 - 3,3
    expect(result).toMatchObject({
      ok: true,
      muscleMassKg: 33.9,
      muscleSharePct: 42.4,
      muscleIndex: 10.5,
      bodyFatPct: null,
    });
  });

  it("estimates less muscle for a woman with the same body", () => {
    const shared = { age: "30", heightCm: "170", weightKg: "70" } as const;
    const man = computeMuscleMass({ method: "simple", gender: "male", ...shared });
    const woman = computeMuscleMass({
      method: "simple",
      gender: "female",
      ...shared,
    });

    if (!man.ok || !woman.ok) throw new Error("expected results");
    expect(woman.muscleMassKg).toBeLessThan(man.muscleMassKg);
  });
});

describe("computeMuscleMass – tape method", () => {
  it("derives muscle mass from the measured body fat", () => {
    const result = computeMuscleMass({
      method: "tape",
      gender: "male",
      age: "30",
      heightCm: "180",
      weightKg: "80",
      neckCm: "38",
      waistCm: "85",
    });

    if (!result.ok) throw new Error(result.message);

    expect(result.bodyFatPct).toBeCloseTo(16.2, 1);
    expect(result.leanMassKg).toBeCloseTo(67, 0);
    // 53 % af den fedtfrie masse
    expect(result.muscleMassKg).toBeCloseTo(35.5, 1);
    expect(result.bodyFatCategory).toBe("Fitness");
  });

  it("lands close to the simple method for the same person", () => {
    const shared = {
      gender: "male",
      age: "30",
      heightCm: "180",
      weightKg: "80",
    } as const;

    const tape = computeMuscleMass({
      method: "tape",
      ...shared,
      neckCm: "38",
      waistCm: "85",
    });
    const simple = computeMuscleMass({ method: "simple", ...shared });

    if (!tape.ok || !simple.ok) throw new Error("expected results");
    expect(Math.abs(tape.muscleMassKg - simple.muscleMassKg)).toBeLessThan(3);
  });

  it("passes the body-fat validation message through for missing measurements", () => {
    const result = computeMuscleMass({
      method: "tape",
      gender: "female",
      age: "30",
      heightCm: "168",
      weightKg: "65",
      neckCm: "32",
      waistCm: "72",
    });

    expect(result).toMatchObject({
      ok: false,
      message: expect.stringContaining("hofte"),
    });
  });
});

describe("computeMuscleMass – shared validation", () => {
  it("rejects missing sex and implausible body data", () => {
    const base = {
      method: "simple",
      age: "30",
      heightCm: "180",
      weightKg: "80",
    } as const;

    expect(computeMuscleMass({ ...base, gender: "" })).toMatchObject({
      ok: false,
    });
    expect(
      computeMuscleMass({ ...base, gender: "male", weightKg: "5" })
    ).toMatchObject({ ok: false });
    expect(
      computeMuscleMass({ ...base, gender: "male", age: "3" })
    ).toMatchObject({ ok: false });
  });
});
