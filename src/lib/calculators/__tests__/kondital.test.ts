// Added: 2026-09-21 - Kondital (VO2-max) beregner.
import {
  computeKondital,
  estimateMaxPulse,
  classifyKondital,
  buildKonditalBands,
} from "../kondital";

describe("computeKondital", () => {
  it("estimates the max pulse from age, since we never ask for it", () => {
    const result = computeKondital({
      method: "restingPulse",
      gender: "male",
      age: "30",
      restingPulse: "60",
    });

    expect(result).toMatchObject({
      ok: true,
      // 15,3 x (187 / 60)
      kondital: 47.7,
      maxPulse: estimateMaxPulse(30),
    });
  });

  it("lands on a lower estimated max pulse — and kondital — for an older visitor", () => {
    const younger = computeKondital({
      method: "restingPulse",
      gender: "male",
      age: "30",
      restingPulse: "60",
    });
    const older = computeKondital({
      method: "restingPulse",
      gender: "male",
      age: "60",
      restingPulse: "60",
    });

    if (!younger.ok || !older.ok) throw new Error("Begge beregninger skal lykkes");
    expect(older.maxPulse).toBeLessThan(younger.maxPulse!);
    expect(older.kondital).toBeLessThan(younger.kondital);
  });

  it("converts a Cooper test distance to kondital", () => {
    const result = computeKondital({
      method: "cooper",
      gender: "male",
      age: "30",
      distanceMeters: "2400",
    });

    // (2400 - 504,9) / 44,73
    expect(result).toMatchObject({ ok: true, kondital: 42.4, category: "God" });
  });

  it("adds absolute oxygen uptake only when a weight is given", () => {
    const withWeight = computeKondital({
      method: "cooper",
      gender: "male",
      age: "30",
      distanceMeters: "2400",
      weightKg: "80",
    });
    const withoutWeight = computeKondital({
      method: "cooper",
      gender: "male",
      age: "30",
      distanceMeters: "2400",
    });

    expect(withWeight).toMatchObject({ litersPerMinute: 3.39 });
    expect(withoutWeight).toMatchObject({ litersPerMinute: null });
  });

  it("accepts Danish comma decimals", () => {
    const result = computeKondital({
      method: "restingPulse",
      gender: "female",
      age: "42,5",
      restingPulse: "58",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects input it cannot turn into a kondital", () => {
    expect(
      computeKondital({
        method: "restingPulse",
        gender: "",
        age: "30",
        restingPulse: "60",
      })
    ).toMatchObject({ ok: false });

    expect(
      computeKondital({
        method: "restingPulse",
        gender: "male",
        age: "30",
        restingPulse: "5",
      })
    ).toMatchObject({ ok: false });

    expect(
      computeKondital({
        method: "cooper",
        gender: "male",
        age: "30",
        distanceMeters: "50",
      })
    ).toMatchObject({ ok: false });
  });

  it("refuses a resting pulse outside the plausible range", () => {
    expect(
      computeKondital({
        method: "restingPulse",
        gender: "male",
        age: "30",
        restingPulse: "180",
      })
    ).toMatchObject({
      ok: false,
      message: expect.stringContaining("hvilepuls mellem 30 og 120"),
    });
  });
});

describe("kondital reference bands", () => {
  it("classifies the same number differently by age and sex", () => {
    // A 35 year old woman and man with identical kondital are not in the same band.
    expect(classifyKondital("female", 35, 42)).toBe("Fremragende");
    expect(classifyKondital("male", 35, 42)).toBe("God");
  });

  it("returns an open-ended lowest and highest band for the visitor's age group", () => {
    const { ageGroupLabel, bands } = buildKonditalBands("female", 65);

    expect(ageGroupLabel).toBe("60 år og derover");
    expect(bands).toHaveLength(6);
    expect(bands[0]).toMatchObject({ label: "Meget lav", min: null });
    expect(bands[5]).toMatchObject({ label: "Fremragende", max: null });
  });

  it("puts the calculated kondital inside the band it reports", () => {
    const result = computeKondital({
      method: "cooper",
      gender: "male",
      age: "45",
      distanceMeters: "2600",
    });

    if (!result.ok) throw new Error("expected a result");

    const band = result.bands.find((candidate) => candidate.label === result.category);
    expect(band).toBeDefined();
    expect(result.kondital).toBeGreaterThanOrEqual(band?.min ?? 0);
    expect(result.kondital).toBeLessThan(band?.max ?? Infinity);
  });
});
