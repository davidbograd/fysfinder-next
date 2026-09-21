/**
 * Display, legacy dual-write and schema.org output for structured opening hours.
 */

import {
  formatOpeningHoursDa,
  hasAnyKnownOpeningHours,
  isClosedAllWeek,
  legacyColumnsToOpeningHours,
  openingHoursToLegacyColumns,
  openingHoursToSchemaOrg,
  resolveClinicOpeningHours,
} from "../format";
import type { OpeningHours } from "../types";

const HERNING: OpeningHours = {
  mon: [{ open: "08:00", close: "18:00" }],
  tue: [{ open: "08:00", close: "18:00" }],
  wed: [{ open: "08:00", close: "18:00" }],
  thu: [{ open: "08:00", close: "18:00" }],
  fri: [{ open: "08:00", close: "14:00" }],
  sat: [],
  sun: [],
};

describe("formatOpeningHoursDa", () => {
  it("renders Danish typography and distinguishes closed from unknown", () => {
    const rows = formatOpeningHoursDa({ mon: [{ open: "08:00", close: "18:00" }], tue: [] });

    expect(rows[0]).toEqual({ day: "mon", label: "Mandag", hours: "08.00–18.00" });
    expect(rows[1]).toEqual({ day: "tue", label: "Tirsdag", hours: "Lukket" });
    expect(rows[2]).toEqual({ day: "wed", label: "Onsdag", hours: null });
  });

  it("joins split shifts on one line", () => {
    const rows = formatOpeningHoursDa({
      mon: [
        { open: "08:00", close: "12:00" },
        { open: "13:00", close: "17:00" },
      ],
    });

    expect(rows[0].hours).toBe("08.00–12.00, 13.00–17.00");
  });

  it("labels a full day rather than printing 00.00–24.00", () => {
    const rows = formatOpeningHoursDa({ mon: [{ open: "00:00", close: "24:00" }] });

    expect(rows[0].hours).toBe("Åbent 24 timer");
  });
});

describe("openingHoursToLegacyColumns", () => {
  it("writes null for unknown days instead of 'Lukket'", () => {
    const columns = openingHoursToLegacyColumns({ mon: [{ open: "08:00", close: "18:00" }] });

    expect(columns.mandag).toBe("08.00–18.00");
    expect(columns.tirsdag).toBeNull();
  });

  it("writes 'Lukket' only for days Google explicitly reports as closed", () => {
    const columns = openingHoursToLegacyColumns(HERNING);

    expect(columns.fredag).toBe("08.00–14.00");
    expect(columns.lørdag).toBe("Lukket");
    expect(columns.søndag).toBe("Lukket");
  });
});

describe("legacyColumnsToOpeningHours", () => {
  it("reads rows written in any of the historical formats", () => {
    const hours = legacyColumnsToOpeningHours({
      mandag: "08.00–18.00",
      tirsdag: "08:00 – 17:00",
      onsdag: "09:00-17:00",
      torsdag: "7-19",
      fredag: "Lukket",
      lørdag: null,
    });

    expect(hours).toEqual({
      mon: [{ open: "08:00", close: "18:00" }],
      tue: [{ open: "08:00", close: "17:00" }],
      wed: [{ open: "09:00", close: "17:00" }],
      thu: [{ open: "07:00", close: "19:00" }],
      fri: [],
    });
  });

  it("returns null when the row has no usable hours", () => {
    expect(legacyColumnsToOpeningHours({})).toBeNull();
    expect(legacyColumnsToOpeningHours(null)).toBeNull();
  });
});

describe("openingHoursToSchemaOrg", () => {
  it("emits ISO times only for days the clinic is open", () => {
    expect(openingHoursToSchemaOrg(HERNING)).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "08:00", closes: "14:00" },
    ]);
  });

  it("never emits a Danish label as a time (regression for opens: 'Lukket')", () => {
    const specs = openingHoursToSchemaOrg({ mon: [], tue: [{ open: "08:00", close: "18:00" }] });

    for (const spec of specs) {
      expect(spec.opens).toMatch(/^\d{2}:\d{2}$/);
      expect(spec.closes).toMatch(/^\d{2}:\d{2}$/);
    }
    expect(specs).toHaveLength(1);
  });

  it("converts end-of-day to a time schema.org accepts", () => {
    expect(openingHoursToSchemaOrg({ mon: [{ open: "00:00", close: "24:00" }] })).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "00:00", closes: "23:59" },
    ]);
  });

  it("emits one entry per range for split shifts", () => {
    const specs = openingHoursToSchemaOrg({
      mon: [
        { open: "08:00", close: "12:00" },
        { open: "13:00", close: "17:00" },
      ],
    });

    expect(specs).toHaveLength(2);
    expect(specs.every((s) => s.dayOfWeek === "Monday")).toBe(true);
  });
});

describe("hasAnyKnownOpeningHours / isClosedAllWeek", () => {
  it("separates 'no data' from 'closed all week'", () => {
    expect(hasAnyKnownOpeningHours(null)).toBe(false);
    expect(hasAnyKnownOpeningHours({})).toBe(false);
    expect(hasAnyKnownOpeningHours({ mon: [] })).toBe(true);

    expect(isClosedAllWeek(null)).toBe(false);
    expect(isClosedAllWeek(HERNING)).toBe(false);
    expect(
      isClosedAllWeek({ mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] })
    ).toBe(true);
  });
});

describe("resolveClinicOpeningHours", () => {
  it("prefers the structured column", () => {
    const hours = resolveClinicOpeningHours({
      opening_hours: { mon: [{ open: "08:00", close: "18:00" }] },
      mandag: "09:00-17:00",
    });

    expect(hours?.mon).toEqual([{ open: "08:00", close: "18:00" }]);
  });

  it("falls back to the legacy columns while the backfill is in progress", () => {
    const hours = resolveClinicOpeningHours({
      opening_hours: null,
      mandag: "09:00-17:00",
    });

    expect(hours?.mon).toEqual([{ open: "09:00", close: "17:00" }]);
  });

  it("returns null when neither source has data", () => {
    expect(resolveClinicOpeningHours({ opening_hours: null })).toBeNull();
  });
});
