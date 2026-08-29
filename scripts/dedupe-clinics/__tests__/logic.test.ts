// Unit tests for one-time clinic duplicate classification and keeper selection.
// Updated: covers Hjernerystelsesfyssen never-merge, high-confidence vs review, and keeper priority.

import { collectMergeJobs } from "../merge-plan";
import {
  addressesAreSimilar,
  citiesAreSame,
  classifyGroup,
  classifyGroups,
  mergeFillableFields,
  namesAreSimilar,
  normalizeName,
  pickKeeper,
  type ClinicCandidate,
} from "../logic";

function clinic(
  overrides: Partial<ClinicCandidate> & Pick<ClinicCandidate, "clinics_id" | "klinikNavn">
): ClinicCandidate {
  return {
    klinikNavnSlug: overrides.klinikNavnSlug ?? "slug",
    lokation: overrides.lokation ?? "Aarhus C",
    adresse: overrides.adresse ?? "Karupvej 2",
    tlf: null,
    email: null,
    website: null,
    om_os: null,
    logo_url: null,
    google_place_id: overrides.google_place_id ?? "place-1",
    verified_klinik: false,
    created_at: overrides.created_at ?? "2025-03-02T00:00:00.000Z",
    owners: 0,
    premium: 0,
    team: 0,
    specialties: 0,
    events: 0,
    ...overrides,
  };
}

describe("name similarity", () => {
  it("treats ApS / I/S / v/ variants as the same clinic name", () => {
    expect(normalizeName("Aarhus Rygklinik ApS")).toBe("aarhus rygklinik");
    expect(
      namesAreSimilar("Aarhus Rygklinik", "Aarhus Rygklinik ApS")
    ).toBe(true);
    expect(
      namesAreSimilar(
        "Langeskov Fysioterapi",
        "Langeskov Fysioterapi/ Gitte Skræm Haaber og John Ernst Jacobsen"
      )
    ).toBe(true);
    expect(
      namesAreSimilar("Smertefri.nu", "Smertefri.nu v/Thomas Ferrold")
    ).toBe(true);
  });

  it("does not treat a single letter as contained in a longer name", () => {
    expect(
      namesAreSimilar("b", "Klinik For Fysioterapi Fredericia")
    ).toBe(false);
  });

  it("does not match unrelated brands that only share a city", () => {
    expect(
      namesAreSimilar("FysioDanmark Nørrebro", "FYSIQ Nørrebro")
    ).toBe(false);
  });
});

describe("address and city similarity", () => {
  it("matches the same street and house number despite floor or letter suffixes", () => {
    expect(addressesAreSimilar("Nørgårdsvej 8", "Nørgårdsvej 8A")).toBe(true);
    expect(addressesAreSimilar("Hobrovej 13 B", "Hobrovej 13B")).toBe(true);
    expect(
      addressesAreSimilar("Vesterbro Torv 1-3, 6. sal", "6, Vesterbro Torv 1-3")
    ).toBe(true);
    expect(addressesAreSimilar("Åboulevarden 39,2 th", "Åboulevarden 39")).toBe(
      true
    );
  });

  it("treats Allé and Alle as the same street", () => {
    expect(addressesAreSimilar("Linde Allé 23", "Linde Alle 23")).toBe(true);
  });

  it("does not match different house numbers on the same street", () => {
    expect(addressesAreSimilar("Havnegade 28", "Havnegade 30")).toBe(false);
  });

  it("treats Nykøbing F as the same city as Nykøbing Falster", () => {
    expect(citiesAreSame("Nykøbing F", "Nykøbing Falster")).toBe(true);
    expect(citiesAreSame("Aarhus C", "Aarhus N")).toBe(false);
  });
});

describe("classifyGroup", () => {
  it("never merges any Hjernerystelsesfyssen location", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "aarhus",
        klinikNavn: "Hjernerystelsesfyssen Aarhus",
        lokation: "Aarhus C",
        adresse: "Kirkedammen 29A",
        owners: 1,
        premium: 1,
        verified_klinik: true,
      }),
      clinic({
        clinics_id: "odense",
        klinikNavn: "Hjernerystelsesfyssen Odense",
        lokation: "Odense S",
        adresse: "Kratholmvej 49",
        owners: 1,
        premium: 1,
        verified_klinik: true,
      }),
    ]);

    expect(group.decision).toBe("always_keep");
    expect(group.reason).toBe("hjernerystelsesfyssen_hard_keep");
    expect(group.keeper).toBeNull();
    expect(group.drops).toEqual([]);
  });

  it("marks same-city near-duplicates as high confidence", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "keep",
        klinikNavn: "Aarhus Rygklinik",
        lokation: "Aarhus C",
        adresse: "Karupvej 2c",
        specialties: 3,
        events: 74,
      }),
      clinic({
        clinics_id: "drop",
        klinikNavn: "Aarhus Rygklinik ApS",
        lokation: "Aarhus C",
        adresse: "Karupvej 2 st",
        created_at: "2025-03-03T00:00:00.000Z",
      }),
    ]);

    expect(group.decision).toBe("high_confidence");
    expect(group.keeper?.clinics_id).toBe("keep");
    expect(group.drops.map((row) => row.clinics_id)).toEqual(["drop"]);
  });

  it("sends different cities to review", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "home",
        klinikNavn: "Henrik Lauridsen",
        lokation: "Skødstrup",
        adresse: "Bondehaven 19 D",
      }),
      clinic({
        clinics_id: "mobile",
        klinikNavn: "Mobile Fysioterapeut v/Henrik Lauridsen",
        lokation: "Aarhus N",
        adresse: "Kastedvej 37",
      }),
    ]);

    expect(group.decision).toBe("needs_review");
    expect(group.reason).toBe("different_city");
  });

  it("sends dissimilar names and streets to review", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "bredgade",
        klinikNavn: "Bredgade Fysioterapi",
        lokation: "Roskilde",
        adresse: "Bredgade 23 A, st. th",
      }),
      clinic({
        clinics_id: "meningsfuld",
        klinikNavn: "Meningsfuld fysioterapi",
        lokation: "Roskilde",
        adresse: "Stændertorvet 5, 1",
      }),
    ]);

    expect(group.decision).toBe("needs_review");
    expect(group.reason).toBe("dissimilar_name_or_address");
  });

  it("never auto-merges when two rows have owners", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "a",
        klinikNavn: "Same Clinic",
        owners: 1,
      }),
      clinic({
        clinics_id: "b",
        klinikNavn: "Same Clinic ApS",
        owners: 1,
      }),
    ]);

    expect(group.decision).toBe("needs_review");
    expect(group.reason).toBe("multiple_owners");
  });

  it("sends a mixed triple with one dissimilar address to review", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "a",
        klinikNavn: "Åløkkens Fysioterapi",
        lokation: "Odense C",
        adresse: "Thorslundsvej 2B",
      }),
      clinic({
        clinics_id: "b",
        klinikNavn: "Aaløkken Fysioterapi",
        lokation: "Odense C",
        adresse: "Thorslundsvej 2B",
      }),
      clinic({
        clinics_id: "c",
        klinikNavn: "Åløkkens Fysioterapi - massage",
        lokation: "Odense C",
        adresse: "Rugårdsvej 103A",
      }),
    ]);

    expect(group.decision).toBe("needs_review");
    expect(group.reason).toBe("dissimilar_name_or_address");
  });

  it("never auto-merges when two rows have premium", () => {
    const group = classifyGroup([
      clinic({
        clinics_id: "a",
        klinikNavn: "Same Clinic",
        premium: 1,
      }),
      clinic({
        clinics_id: "b",
        klinikNavn: "Same Clinic ApS",
        premium: 1,
      }),
    ]);

    expect(group.decision).toBe("needs_review");
    expect(group.reason).toBe("multiple_premium");
  });
});

describe("pickKeeper", () => {
  it("prefers owner, then premium, then verified, then richer profile", () => {
    const owned = clinic({
      clinics_id: "owned",
      klinikNavn: "Smertefri.nu v/Thomas Ferrold",
      owners: 1,
      verified_klinik: false,
    });
    const verified = clinic({
      clinics_id: "verified",
      klinikNavn: "Smertefri.nu",
      verified_klinik: true,
    });

    expect(pickKeeper([verified, owned]).clinics_id).toBe("owned");

    const premium = clinic({
      clinics_id: "premium",
      klinikNavn: "Clinic Premium",
      premium: 1,
    });
    const plainVerified = clinic({
      clinics_id: "plain-verified",
      klinikNavn: "Clinic",
      verified_klinik: true,
    });
    expect(pickKeeper([plainVerified, premium]).clinics_id).toBe("premium");

    const withSpecialties = clinic({
      clinics_id: "specialties",
      klinikNavn: "Protreatment Aarhus C",
      specialties: 5,
    });
    const longName = clinic({
      clinics_id: "long",
      klinikNavn: "ProTreatment Aarhus C | Fysioterapi & Genoptræning",
      specialties: 1,
    });
    expect(pickKeeper([longName, withSpecialties]).clinics_id).toBe(
      "specialties"
    );
  });

  it("prefers the shorter cleaner name when other signals tie", () => {
    const shortName = clinic({
      clinics_id: "short",
      klinikNavn: "Back2Sport",
    });
    const longName = clinic({
      clinics_id: "long",
      klinikNavn: "Back2Sport ApS",
    });
    expect(pickKeeper([longName, shortName]).clinics_id).toBe("short");
  });
});

describe("classifyGroups and fillable merge", () => {
  it("only groups clinics that share a Place ID", () => {
    const groups = classifyGroups([
      clinic({
        clinics_id: "a",
        klinikNavn: "Aarhus Rygklinik",
        google_place_id: "shared",
      }),
      clinic({
        clinics_id: "b",
        klinikNavn: "Aarhus Rygklinik ApS",
        google_place_id: "shared",
      }),
      clinic({
        clinics_id: "solo",
        klinikNavn: "Unrelated Clinic",
        google_place_id: "other",
      }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].decision).toBe("high_confidence");
    expect(groups[0].drops).toHaveLength(1);
  });

  it("fills empty keeper fields from the loser and never overwrites", () => {
    const updates = mergeFillableFields(
      {
        tlf: "+45 11 11 11 11",
        email: null,
        website: "",
        om_os: "Keeper about",
        logo_url: null,
        mandag: "08-16",
        tirsdag: null,
        onsdag: null,
        torsdag: null,
        fredag: null,
        lørdag: null,
        søndag: null,
      },
      {
        tlf: "+45 99 99 99 99",
        email: "info@clinic.dk",
        website: "https://clinic.dk",
        om_os: "Loser about",
        logo_url: "https://logo",
        mandag: "09-17",
        tirsdag: "09-17",
        onsdag: null,
        torsdag: null,
        fredag: null,
        lørdag: null,
        søndag: null,
      }
    );

    expect(updates).toEqual({
      email: "info@clinic.dk",
      website: "https://clinic.dk",
      logo_url: "https://logo",
      tirsdag: "09-17",
    });
  });
});

describe("collectMergeJobs", () => {
  it("keeps Hovedstadens Sportsklinik when that extra pair is approved", () => {
    const hovedstadens = clinic({
      clinics_id: "hovedstadens",
      klinikNavn: "Hovedstadens Sportsklinik",
      klinikNavnSlug: "hovedstadens-sportsklinik",
      google_place_id: "sport",
    });
    const frederiksberg = clinic({
      clinics_id: "frederiksberg",
      klinikNavn: "Frederiksberg Sportsklinik",
      klinikNavnSlug: "frederiksberg-sportsklinik",
      google_place_id: "sport",
    });

    const jobs = collectMergeJobs(
      [
        {
          google_place_id: "sport",
          decision: "needs_review",
          reason: "dissimilar_name_or_address",
          keeper: hovedstadens,
          drops: [frederiksberg],
          clinics: [hovedstadens, frederiksberg],
        },
      ],
      [
        {
          keeperId: "hovedstadens",
          droppedId: "frederiksberg",
          note: "Hovedstadens Sportsklinik keeps that name",
        },
      ],
      [hovedstadens, frederiksberg]
    );

    expect(jobs).toHaveLength(1);
    expect(jobs[0].keeper.klinikNavn).toBe("Hovedstadens Sportsklinik");
    expect(jobs[0].dropped.klinikNavn).toBe("Frederiksberg Sportsklinik");
  });
});
