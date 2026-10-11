import {
  buildLocationOgText,
  specialtyInSentence,
} from "@/lib/og/location-og-text";

describe("buildLocationOgText", () => {
  it("invites visitors to compare the clinics in a city", () => {
    const text = buildLocationOgText({
      locationName: "Aarhus C",
      clinicCount: 13,
      locationPreposition: "i",
    });
    expect(text.headline).toBe("Sammenlign 13 fysioterapiklinikker i Aarhus C");
    expect(text.specialtyLine).toBeNull();
    expect(text.alt).toBe(text.headline);
  });

  it("adds the specialty as its own line and in the alt text", () => {
    const text = buildLocationOgText({
      locationName: "Frederiksberg",
      clinicCount: 3,
      specialtyName: "Ryg",
      locationPreposition: "i",
    });
    expect(text.headline).toBe("Sammenlign 3 fysioterapiklinikker i Frederiksberg");
    expect(text.specialtyLine).toBe("med speciale i ryg");
    expect(text.alt).toBe(
      "Sammenlign 3 fysioterapiklinikker i Frederiksberg med speciale i ryg"
    );
  });

  it("uses the city's own i/på preposition", () => {
    expect(
      buildLocationOgText({ locationName: "Samsø", clinicCount: 2, locationPreposition: "på" })
        .headline
    ).toBe("Sammenlign 2 fysioterapiklinikker på Samsø");
    expect(
      buildLocationOgText({ locationName: "Odense", clinicCount: 40, locationPreposition: "i" })
        .headline
    ).toBe("Sammenlign 40 fysioterapiklinikker i Odense");
  });

  it("shows 1000+ when the Danmark listing hits the row cap", () => {
    const text = buildLocationOgText({
      locationName: "Danmark",
      clinicCount: 1000,
      isDanmark: true,
    });
    expect(text.headline).toBe("Sammenlign 1000+ fysioterapiklinikker i Danmark");
  });

  it("does not ask visitors to compare a single clinic", () => {
    const text = buildLocationOgText({
      locationName: "Skagen",
      clinicCount: 1,
      locationPreposition: "i",
    });
    expect(text.headline).toBe("Find din fysioterapeut i Skagen");
    expect(text.headline).not.toMatch(/Sammenlign|\d/);
  });

  it("points to nearby clinics when there are none in the city", () => {
    const text = buildLocationOgText({
      locationName: "Kirke Eskilstrup",
      clinicCount: 0,
      specialtyName: "Knæ",
      locationPreposition: "i",
    });
    expect(text.headline).toBe("Find fysioterapi nær Kirke Eskilstrup");
    expect(text.specialtyLine).toBe("med speciale i knæ");
  });
});

describe("buildLocationOgText with filters", () => {
  it("names the ydernummer filter on the Danmark page", () => {
    expect(
      buildLocationOgText({
        locationName: "Danmark",
        clinicCount: 243,
        isDanmark: true,
        filters: { ydernummer: true },
      }).headline
    ).toBe("Sammenlign 243 fysioterapiklinikker med ydernummer i Danmark");
  });

  it("names online treatment without a place on the Danmark online page", () => {
    expect(
      buildLocationOgText({
        locationName: "Danmark",
        clinicCount: 152,
        isDanmark: true,
        filters: { online: true },
      }).headline
    ).toBe("Sammenlign 152 fysioterapiklinikker med online behandling");
  });
});

describe("specialtyInSentence", () => {
  it("lowercases ordinary specialty names", () => {
    expect(specialtyInSentence("Knæ")).toBe("knæ");
    expect(specialtyInSentence("Ældre")).toBe("ældre");
    expect(specialtyInSentence("Discusprolaps i nakken")).toBe("discusprolaps i nakken");
  });

  it("keeps acronyms intact", () => {
    expect(specialtyInSentence("KOL")).toBe("KOL");
    expect(specialtyInSentence("PTSD")).toBe("PTSD");
    expect(specialtyInSentence("SI-led")).toBe("SI-led");
  });
});
