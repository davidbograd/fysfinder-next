import { bmiCategory } from "@/lib/calculators/bmi";
import { computeKondital } from "@/lib/calculators/kondital";
import { computeRestingMetabolicRate } from "@/lib/calculators/resting-metabolic-rate";
import type { KonditalSuccess } from "@/lib/calculators/kondital";
import type { RestingMetabolicRateSuccess } from "@/lib/calculators/resting-metabolic-rate";
import {
  buildBmiShareUrl,
  buildBodyFatShareUrl,
  buildKonditalShareUrl,
  buildPaceShareUrl,
  buildRestingMetabolicRateShareUrl,
  buildRmShareUrl,
  parseToolShareParams,
} from "../tool-share";

function parse(url: string) {
  const { pathname, searchParams } = new URL(url, "https://www.fysfinder.dk");
  return parseToolShareParams(pathname.split("/").pop()!, searchParams);
}

describe("tool share images", () => {
  it("puts BMI 24.9 in normal weight and 25.0 in overweight", () => {
    expect(bmiCategory(24.9)).toBe("Normal vægt");
    expect(bmiCategory(24.95)).toBe("Normal vægt");
    expect(bmiCategory(25)).toBe("Overvægtig");
    expect(parse(buildBmiShareUrl(29.9))).toMatchObject({
      value: "29,9",
      badge: "Overvægtig",
    });
  });

  it("links the kondital to an age group and sex – never the exact age", () => {
    const result = computeKondital({
      gender: "male",
      age: "35",
      method: "restingPulse",
      restingPulse: "58",
    }) as KonditalSuccess;
    const url = buildKonditalShareUrl(result);

    expect(url).not.toContain("35");
    expect(parse(url)).toMatchObject({
      value: "48,5",
      badge: "Meget god",
      panelTitle: "Mænd, 30-39 år",
    });
  });

  it("keeps weight and height out of the resting metabolic rate link", () => {
    const result = computeRestingMetabolicRate({
      gender: "male",
      age: "35",
      heightCm: "180",
      weightKg: "80",
    }) as RestingMetabolicRateSuccess;
    const url = buildRestingMetabolicRateShareUrl(result);

    expect(url).toBe("/api/og/resultat/hvilestofskifte?kcal=1755&kj=7343&time=73");
    expect(parse(url)).toMatchObject({ value: "1.755 kcal" });
  });

  it("formats the run pace and the RM loads on the server", () => {
    expect(parse(buildPaceShareUrl("loeb", 10, 2910))).toMatchObject({
      label: "Mit løb",
      value: "4:51 /km",
      caption: "10 km på 48:30",
    });
    expect(parse(buildRmShareUrl(100))?.rows).toContainEqual({
      name: "5 RM",
      value: "87 kg",
      highlighted: false,
    });
  });

  it("draws the child between the parents on the height image", () => {
    const card = parse("/api/og/resultat/hoejde?cm=182.5&lav=174&hoej=191&barn=pige&mor=170&far=182");

    expect(card?.figures).toEqual([
      { label: "Mor", heightCm: 170 },
      { label: "Pige", heightCm: 182.5, highlighted: true },
      { label: "Far", heightCm: 182 },
    ]);
  });

  it("shows the category table on both the BMI and the body fat image", () => {
    expect(parse(buildBmiShareUrl(22.9))?.rows?.map((row) => row.value)).toEqual([
      "Under 18,5",
      "18,5 – 25,0",
      "25,0 – 30,0",
      "30,0 og derover",
    ]);
    expect(parse(buildBodyFatShareUrl(16.2, "male"))).toMatchObject({
      badge: "Fitness",
      panelTitle: "Kategorier for mænd",
    });
  });

  it.each([
    "/api/og/resultat/ukendt?bmi=22",
    "/api/og/resultat/toString?bmi=22",
    "/api/og/resultat/bmi?bmi=abc",
    "/api/og/resultat/bmi?bmi=400",
    "/api/og/resultat/kondital?vo2=45&koen=male&gruppe=9",
    "/api/og/resultat/fedtprocent?fedt=18&koen=andet",
    "/api/og/resultat/aegloesning?aeg=2026-11-18&menst=2026-11-01",
    "/api/og/resultat/pace?type=sprint&km=10&tid=2910",
  ])("rejects %s", (url) => {
    expect(parse(url)).toBeNull();
  });
});
