import { computeWattPerKg } from "../watt-per-kg";

describe("computeWattPerKg", () => {
  it("divides FTP by body weight and finds the level", () => {
    const result = computeWattPerKg({
      source: "ftp",
      gender: "male",
      watts: "250",
      weightKg: "75",
    });

    expect(result).toMatchObject({
      ok: true,
      ftpWatts: 250,
      wattsPerKg: 3.33,
      level: "Godt trænet",
      nextLevel: { label: "Meget godt trænet", wattsPerKg: 3.8, extraWatts: 35, lessKg: 9.3 },
    });
  });

  it("estimates FTP from a 20-minute test and a ramp test", () => {
    const shared = { gender: "female", weightKg: "60" } as const;

    expect(
      computeWattPerKg({ ...shared, source: "test20", watts: "200" })
    ).toMatchObject({ ftpWatts: 190, wattsPerKg: 3.17 });
    expect(
      computeWattPerKg({ ...shared, source: "ramp", watts: "260" })
    ).toMatchObject({ ftpWatts: 195, wattsPerKg: 3.25 });
  });

  it("rates the same W/kg higher for women than for men", () => {
    const shared = { source: "ftp", watts: "210", weightKg: "70" } as const;
    const male = computeWattPerKg({ ...shared, gender: "male" });
    const female = computeWattPerKg({ ...shared, gender: "female" });

    if (!male.ok || !female.ok) throw new Error("expected results");
    expect(male.level).toBe("Motionist");
    expect(female.level).toBe("Godt trænet");
  });

  it("has no next level at the top and always contains the rider in a band", () => {
    const result = computeWattPerKg({
      source: "ftp",
      gender: "male",
      watts: "450",
      weightKg: "70",
    });

    if (!result.ok) throw new Error(result.message);
    expect(result.level).toBe("Verdensklasse");
    expect(result.nextLevel).toBeNull();
    expect(result.bands.at(-1)).toMatchObject({ min: 5.7, max: null });
  });

  it("asks for sex, watts and weight instead of guessing", () => {
    expect(
      computeWattPerKg({ source: "ftp", gender: "", watts: "250", weightKg: "75" })
    ).toMatchObject({ ok: false });
    expect(
      computeWattPerKg({ source: "ftp", gender: "male", watts: "5", weightKg: "75" })
    ).toMatchObject({ ok: false, message: expect.stringContaining("watt") });
    expect(
      computeWattPerKg({ source: "ftp", gender: "male", watts: "250", weightKg: "10" })
    ).toMatchObject({ ok: false, message: expect.stringContaining("vægt") });
  });
});
