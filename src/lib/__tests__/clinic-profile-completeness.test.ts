import {
  CLINIC_PROFILE_RECOMMENDATION_ORDER,
  computeClinicProfileCompleteness,
  getClinicProfileCompletenessAriaDa,
  getClinicProfileCompletenessNudgeDa,
} from "../clinic-profile-completeness";

const emptyInput = {
  email: null,
  tlf: null,
  website: null,
  om_os: null,
  mandag: null,
  tirsdag: null,
  onsdag: null,
  torsdag: null,
  fredag: null,
  lørdag: null,
  søndag: null,
  førsteKons: null,
  opfølgning: null,
  specialtyCount: 0,
  teamMemberCount: 0,
  acceptedInsuranceCount: 0,
  totalInsuranceTypesCount: 1,
};

describe("computeClinicProfileCompleteness", () => {
  it("returns 0% when everything is empty", () => {
    const r = computeClinicProfileCompleteness(emptyInput);
    expect(r.completedCount).toBe(0);
    expect(r.totalCount).toBe(7);
    expect(r.percent).toBe(0);
    expect(r.missingKeys).toHaveLength(7);
    expect(r.missingKeys).toEqual(CLINIC_PROFILE_RECOMMENDATION_ORDER);
  });

  it("counts contact when only email is set", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      email: "k@k.dk",
    });
    expect(r.missingKeys).not.toContain("contact");
    expect(r.completedCount).toBe(1);
  });

  it("counts contact when only phone is set", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      tlf: "12 34 56 78",
    });
    expect(r.missingKeys).not.toContain("contact");
  });

  it("counts contact when only website is set", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      website: "https://klinik.dk",
    });
    expect(r.missingKeys).not.toContain("contact");
  });

  it("does not count contact when all contact fields are blank", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      email: "   ",
      tlf: "",
      website: null,
    });
    expect(r.missingKeys).toContain("contact");
  });

  it("counts about when om_os has any real text (no minimum length)", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      om_os: "Kort tekst.",
    });
    expect(r.missingKeys).not.toContain("about");
  });

  it("counts about when om_os is HTML with text inside", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      om_os: "<p>Velkommen til os.</p>",
    });
    expect(r.missingKeys).not.toContain("about");
  });

  it("does not count about when om_os is empty or only whitespace / tags", () => {
    expect(
      computeClinicProfileCompleteness({ ...emptyInput, om_os: "" }).missingKeys
    ).toContain("about");
    expect(
      computeClinicProfileCompleteness({ ...emptyInput, om_os: "   " }).missingKeys
    ).toContain("about");
    expect(
      computeClinicProfileCompleteness({ ...emptyInput, om_os: "<p></p>" }).missingKeys
    ).toContain("about");
  });

  it("counts opening hours when any day is set", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      mandag: "08–16",
    });
    expect(r.missingKeys).not.toContain("openingHours");
  });

  it("counts specialties and team from counts", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      specialtyCount: 1,
      teamMemberCount: 1,
    });
    expect(r.missingKeys).not.toContain("specialties");
    expect(r.missingKeys).not.toContain("team");
  });

  it("counts insurances when at least one accepted and types exist", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      acceptedInsuranceCount: 1,
      totalInsuranceTypesCount: 3,
    });
    expect(r.missingKeys).not.toContain("insurances");
  });

  it("counts insurances as satisfied when there are no insurance types to configure", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      acceptedInsuranceCount: 0,
      totalInsuranceTypesCount: 0,
    });
    expect(r.missingKeys).not.toContain("insurances");
  });

  it("counts pricing when both price fields are set", () => {
    const partial = computeClinicProfileCompleteness({
      ...emptyInput,
      førsteKons: "500 kr.",
      opfølgning: null,
    });
    expect(partial.missingKeys).toContain("pricing");

    const full = computeClinicProfileCompleteness({
      ...emptyInput,
      førsteKons: "500 kr.",
      opfølgning: "400 kr.",
    });
    expect(full.missingKeys).not.toContain("pricing");
  });

  it("counts pricing when ydernummer is true even without price fields", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      ydernummer: true,
      førsteKons: null,
      opfølgning: null,
    });
    expect(r.missingKeys).not.toContain("pricing");
  });

  it("does not count pricing from ydernummer when ydernummer is false", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      ydernummer: false,
      førsteKons: null,
      opfølgning: null,
    });
    expect(r.missingKeys).toContain("pricing");
  });

  it("sorts missing keys by recommendation priority", () => {
    const r = computeClinicProfileCompleteness({
      ...emptyInput,
      email: "a@b.dk",
      om_os: null,
      mandag: "9-17",
      specialtyCount: 1,
      teamMemberCount: 1,
    });
    expect(r.missingKeys).toEqual(["pricing", "about", "insurances"]);
  });

  it("returns 100% when all criteria are met", () => {
    const r = computeClinicProfileCompleteness({
      email: "a@b.dk",
      tlf: null,
      website: null,
      om_os: "Om os tekst",
      mandag: "9-15",
      tirsdag: null,
      onsdag: null,
      torsdag: null,
      fredag: null,
      lørdag: null,
      søndag: null,
      førsteKons: "500",
      opfølgning: "400",
      ydernummer: false,
      specialtyCount: 2,
      teamMemberCount: 1,
      acceptedInsuranceCount: 1,
      totalInsuranceTypesCount: 5,
    });
    expect(r.percent).toBe(100);
    expect(r.missingKeys).toHaveLength(0);
  });
});

describe("getClinicProfileCompletenessNudgeDa", () => {
  it("returns empty when nothing missing", () => {
    expect(getClinicProfileCompletenessNudgeDa([])).toBe("");
  });

  it("ignores contact (dashboard uses a dedicated warning for that)", () => {
    expect(getClinicProfileCompletenessNudgeDa(["contact"])).toBe("");
  });

  it("skips contact and uses the next missing items", () => {
    expect(getClinicProfileCompletenessNudgeDa(["contact", "team"])).toBe(
      "Tilføj f.eks. team."
    );
  });

  it("formats one and two hints from non-contact keys", () => {
    expect(getClinicProfileCompletenessNudgeDa(["pricing"])).toContain("priser");
    expect(getClinicProfileCompletenessNudgeDa(["pricing", "specialties"])).toMatch(
      /priser/
    );
    expect(getClinicProfileCompletenessNudgeDa(["pricing", "specialties"])).toMatch(
      /specialer/
    );
  });
});

describe("getClinicProfileCompletenessAriaDa", () => {
  it("includes counts in Danish", () => {
    expect(
      getClinicProfileCompletenessAriaDa({
        completedCount: 3,
        totalCount: 7,
        percent: 43,
        missingKeys: ["contact", "about", "team"],
      })
    ).toBe("3 af 7 trin fuldført på klinikprofilen");
  });
});
