import { computeMacros, MacroSuccess } from "@/lib/calculators/macros";
import { buildMacroShareUrl, parseMacroShareParams } from "../macro-share";

const result = computeMacros({
  calorieSource: "estimate",
  kcal: "",
  gender: "male",
  heightCm: "180",
  weightKg: "75",
  age: "35",
  activity: "moderat",
  goal: "vedligehold",
  split: "proteinfokus",
}) as MacroSuccess;

describe("macro share link", () => {
  it("carries the calorie target and macros – never age, weight or height", () => {
    const url = buildMacroShareUrl(result);

    expect(url).toMatch(/^\/api\/og\/makro\?kcal=\d+&protein=\d+-\d+&kulhydrat=\d+-\d+&fedt=\d+-\d+$/);
    expect(url).not.toMatch(/=(35|75|180)(&|$)/);
  });

  it("round-trips the numbers shown on the page", () => {
    const content = parseMacroShareParams(
      new URL(buildMacroShareUrl(result), "https://x.dk").searchParams
    );

    expect(content?.kcalPerDay).toBe(result.kcalPerDay);
    expect(content?.macros.protein).toEqual({
      grams: result.macros.protein.grams,
      pct: result.macros.protein.pct,
    });
  });

  it.each([
    "protein=100-20&kulhydrat=300-50&fedt=80-30",
    "kcal=100&protein=100-20&kulhydrat=300-50&fedt=80-30",
    "kcal=2500&protein=100-120&kulhydrat=300-50&fedt=80-30",
    "kcal=2500&protein=abc&kulhydrat=300-50&fedt=80-30",
    "kcal=2500&protein=100-20&kulhydrat=300-50",
  ])("rejects %p", (query) => {
    expect(parseMacroShareParams(new URLSearchParams(query))).toBeNull();
  });
});
