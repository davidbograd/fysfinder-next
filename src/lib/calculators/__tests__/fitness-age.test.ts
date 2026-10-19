import {
  activityIndex,
  averageVo2ForAge,
  bodyAgeForVo2,
  computeFitnessAge,
  estimateVo2,
  FitnessAgeInput,
} from "../fitness-age";

const activeMan: FitnessAgeInput = {
  gender: "male",
  age: "40",
  waistCm: "90",
  restingPulse: "65",
  frequency: "flereGange",
  intensity: "moderat",
  duration: "lang",
};

describe("fitness age (bodyage)", () => {
  it("scores activity the way NTNU's own calculator explains it", () => {
    // NTNU's eksempel: nesten hver dag x 30 min+ x moderat = 3 x 1,5 x 5
    expect(
      activityIndex({ frequency: "dagligt", intensity: "moderat", duration: "lang" })
    ).toBe(22.5);
    expect(
      activityIndex({ frequency: "sjaeldent", intensity: "haard", duration: "lang" })
    ).toBe(0);
  });

  it("uses the HUNT waist equations for men and women", () => {
    expect(estimateVo2("male", 40, 90, 65, 15)).toBeCloseTo(48.535, 3);
    expect(estimateVo2("female", 40, 80, 70, 7.5)).toBeCloseTo(37.641, 3);
  });

  it("maps a VO2 back to the age where it is the HUNT3 average", () => {
    expect(bodyAgeForVo2("male", 46.6)).toBe(45);
    expect(bodyAgeForVo2("female", 33.7)).toBe(55);
    expect(averageVo2ForAge("male", 50)).toBeCloseTo(44.25, 2);
    expect(bodyAgeForVo2("male", 80)).toBe(20);
    expect(bodyAgeForVo2("female", 5)).toBe(90);
  });

  it("gives an active 40-year-old man a younger body age", () => {
    const result = computeFitnessAge(activeMan);

    expect(result).toMatchObject({
      ok: true,
      bodyAge: 35,
      difference: -5,
      estimatedVo2: 48.5,
      averageVo2ForAge: 47.6,
      activityIndex: 15,
    });
  });

  it("gives a sedentary profile an older body age and shows what helps most", () => {
    const result = computeFitnessAge({
      ...activeMan,
      waistCm: "100",
      restingPulse: "75",
      frequency: "sjaeldent",
      intensity: "let",
      duration: "kort",
    });

    if (!result.ok) throw new Error(result.message);
    expect(result.bodyAge).toBe(61);
    expect(result.levers.map((lever) => lever.key)).toEqual([
      "activity",
      "waist",
      "pulse",
    ]);
    expect(result.levers[0].label).toContain("2–3 gange om ugen");
    for (const lever of result.levers) {
      expect(lever.bodyAge).toBeLessThan(result.bodyAge);
    }
  });

  it("only accepts the adult ages and measurements the model was built on", () => {
    expect(computeFitnessAge({ ...activeMan, age: "16" })).toMatchObject({
      ok: false,
      message: expect.stringContaining("20 og 90"),
    });
    expect(computeFitnessAge({ ...activeMan, waistCm: "35" })).toMatchObject({
      ok: false,
    });
    expect(computeFitnessAge({ ...activeMan, gender: "" })).toMatchObject({
      ok: false,
    });
  });
});
