jest.mock("@/components/features/styrkeoevelser/StyrkeoevelserMdxBody", () => ({
  StyrkeoevelserMdxBody: () => null,
}));

import { generateMetadata } from "../page";

describe("styrkeoevelser exercise metadata", () => {
  it("uses the '<øvelse> styrkeøvelse | Sådan gør du →' meta title", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "bicep-curls" }),
    });

    expect(metadata.title).toBe("Bicep curls styrkeøvelse | Sådan gør du →");
  });

  it("leaves body part pages on their own meta title", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "arm" }),
    });

    expect(metadata.title).toBe(
      "Armøvelser → Gode øvelser til styrke og træning af arme"
    );
  });
});
