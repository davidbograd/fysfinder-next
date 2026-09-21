// Added: 2026-09-21 - Hoejdeberegner (forventet sluthoejde ud fra foraeldrenes hoejde).
import { computeAdultHeight, PREDICTION_MARGIN_CM } from "../adult-height";

describe("computeAdultHeight", () => {
  it("adds half the sex adjustment for a boy", () => {
    const result = computeAdultHeight({
      sex: "boy",
      motherHeightCm: "170",
      fatherHeightCm: "182",
    });

    // (170 + 182 + 13) / 2
    expect(result).toMatchObject({
      ok: true,
      predictedHeightCm: 182.5,
      parentAverageCm: 176,
      rangeLowCm: 174,
      rangeHighCm: 191,
    });
  });

  it("subtracts half the sex adjustment for a girl", () => {
    const result = computeAdultHeight({
      sex: "girl",
      motherHeightCm: "170",
      fatherHeightCm: "182",
    });

    expect(result).toMatchObject({
      ok: true,
      predictedHeightCm: 169.5,
      rangeLowCm: 161,
      rangeHighCm: 178,
    });
  });

  it("keeps boys and girls exactly the sex adjustment apart", () => {
    const boy = computeAdultHeight({
      sex: "boy",
      motherHeightCm: "165",
      fatherHeightCm: "178",
    });
    const girl = computeAdultHeight({
      sex: "girl",
      motherHeightCm: "165",
      fatherHeightCm: "178",
    });

    if (!boy.ok || !girl.ok) throw new Error("expected results");
    expect(boy.predictedHeightCm - girl.predictedHeightCm).toBeCloseTo(13, 5);
    expect(boy.rangeHighCm - boy.predictedHeightCm).toBeCloseTo(
      PREDICTION_MARGIN_CM,
      5
    );
  });

  it("accepts Danish comma decimals", () => {
    const result = computeAdultHeight({
      sex: "girl",
      motherHeightCm: "167,5",
      fatherHeightCm: "180,5",
    });

    expect(result).toMatchObject({ ok: true, predictedHeightCm: 167.5 });
  });

  it("asks for the child's sex before calculating", () => {
    expect(
      computeAdultHeight({
        sex: "",
        motherHeightCm: "170",
        fatherHeightCm: "182",
      })
    ).toMatchObject({ ok: false });
  });

  it("rejects heights outside a plausible range", () => {
    expect(
      computeAdultHeight({
        sex: "boy",
        motherHeightCm: "17",
        fatherHeightCm: "182",
      })
    ).toMatchObject({ ok: false });

    expect(
      computeAdultHeight({
        sex: "boy",
        motherHeightCm: "170",
        fatherHeightCm: "",
      })
    ).toMatchObject({ ok: false });
  });
});
