/**
 * Regression coverage for the Google Places hours import.
 *
 * The production bug: the sync requested Place Details without `languageCode`, Google
 * answered in English, the parser only recognised Danish day names, and every day fell
 * through to a hardcoded "Lukket" — marking ~1,550 clinics closed all week.
 */

import {
  parseGoogleOpeningHours,
  parseOpeningHoursDayText,
} from "../from-google";

/** Verbatim from the Places API for BeneFit Herning (place ChIJ8X7Ez_m7S0YRKnKyivNUm74). */
const HERNING_PERIODS = [
  { open: { day: 1, hour: 8, minute: 0 }, close: { day: 1, hour: 18, minute: 0 } },
  { open: { day: 2, hour: 8, minute: 0 }, close: { day: 2, hour: 18, minute: 0 } },
  { open: { day: 3, hour: 8, minute: 0 }, close: { day: 3, hour: 18, minute: 0 } },
  { open: { day: 4, hour: 8, minute: 0 }, close: { day: 4, hour: 18, minute: 0 } },
  { open: { day: 5, hour: 8, minute: 0 }, close: { day: 5, hour: 14, minute: 0 } },
];

const HERNING_ENGLISH_DESCRIPTIONS = [
  "Monday: 8:00 AM – 6:00 PM",
  "Tuesday: 8:00 AM – 6:00 PM",
  "Wednesday: 8:00 AM – 6:00 PM",
  "Thursday: 8:00 AM – 6:00 PM",
  "Friday: 8:00 AM – 2:00 PM",
  "Saturday: Closed",
  "Sunday: Closed",
];

const HERNING_DANISH_DESCRIPTIONS = [
  "mandag: 08.00–18.00",
  "tirsdag: 08.00–18.00",
  "onsdag: 08.00–18.00",
  "torsdag: 08.00–18.00",
  "fredag: 08.00–14.00",
  "lørdag: Lukket",
  "søndag: Lukket",
];

describe("parseGoogleOpeningHours", () => {
  it("reads periods, which carry no language at all", () => {
    const hours = parseGoogleOpeningHours({ periods: HERNING_PERIODS });

    expect(hours).toEqual({
      mon: [{ open: "08:00", close: "18:00" }],
      tue: [{ open: "08:00", close: "18:00" }],
      wed: [{ open: "08:00", close: "18:00" }],
      thu: [{ open: "08:00", close: "18:00" }],
      fri: [{ open: "08:00", close: "14:00" }],
      sat: [],
      sun: [],
    });
  });

  it("produces identical results for the English and Danish responses", () => {
    const fromEnglish = parseGoogleOpeningHours({
      weekdayDescriptions: HERNING_ENGLISH_DESCRIPTIONS,
    });
    const fromDanish = parseGoogleOpeningHours({
      weekdayDescriptions: HERNING_DANISH_DESCRIPTIONS,
    });

    expect(fromEnglish).toEqual(fromDanish);
    expect(fromEnglish?.mon).toEqual([{ open: "08:00", close: "18:00" }]);
    expect(fromEnglish?.fri).toEqual([{ open: "08:00", close: "14:00" }]);
  });

  it("does not report a clinic as closed when Google answers in English", () => {
    const hours = parseGoogleOpeningHours({
      weekdayDescriptions: HERNING_ENGLISH_DESCRIPTIONS,
    });

    expect(hours?.mon).not.toEqual([]);
    expect(hours?.sat).toEqual([]);
  });

  it("returns null when Google has no hours, so callers cannot write 'closed'", () => {
    expect(parseGoogleOpeningHours(undefined)).toBeNull();
    expect(parseGoogleOpeningHours(null)).toBeNull();
    expect(parseGoogleOpeningHours({})).toBeNull();
    expect(parseGoogleOpeningHours({ periods: [] })).toBeNull();
    expect(parseGoogleOpeningHours({ weekdayDescriptions: [] })).toBeNull();
  });

  it("keeps split shifts as separate ranges on the same day", () => {
    const hours = parseGoogleOpeningHours({
      periods: [
        { open: { day: 1, hour: 8, minute: 0 }, close: { day: 1, hour: 12, minute: 0 } },
        { open: { day: 1, hour: 13, minute: 0 }, close: { day: 1, hour: 17, minute: 30 } },
      ],
    });

    expect(hours?.mon).toEqual([
      { open: "08:00", close: "12:00" },
      { open: "13:00", close: "17:30" },
    ]);
  });

  it("expands Google's always-open marker to every day", () => {
    const hours = parseGoogleOpeningHours({
      periods: [{ open: { day: 0, hour: 0, minute: 0 } }],
    });

    expect(hours?.mon).toEqual([{ open: "00:00", close: "24:00" }]);
    expect(hours?.sun).toEqual([{ open: "00:00", close: "24:00" }]);
  });

  it("maps Google's Sunday-zero day numbering to Monday-first keys", () => {
    const hours = parseGoogleOpeningHours({
      periods: [
        { open: { day: 0, hour: 10, minute: 0 }, close: { day: 0, hour: 14, minute: 0 } },
        { open: { day: 6, hour: 9, minute: 0 }, close: { day: 6, hour: 13, minute: 0 } },
      ],
    });

    expect(hours?.sun).toEqual([{ open: "10:00", close: "14:00" }]);
    expect(hours?.sat).toEqual([{ open: "09:00", close: "13:00" }]);
    expect(hours?.mon).toEqual([]);
  });

  it("prefers periods over descriptions when both are present", () => {
    const hours = parseGoogleOpeningHours({
      periods: HERNING_PERIODS,
      weekdayDescriptions: ["mandag: 01.00–02.00"],
    });

    expect(hours?.mon).toEqual([{ open: "08:00", close: "18:00" }]);
  });
});

describe("parseOpeningHoursDayText", () => {
  it.each([
    ["08.00–18.00", [{ open: "08:00", close: "18:00" }]],
    ["08:00 – 17:00", [{ open: "08:00", close: "17:00" }]],
    ["09:00-17:00", [{ open: "09:00", close: "17:00" }]],
    ["7-19", [{ open: "07:00", close: "19:00" }]],
    ["7:00 AM – 9:00 PM", [{ open: "07:00", close: "21:00" }]],
    ["08.00–12.00, 13.00–17.00", [
      { open: "08:00", close: "12:00" },
      { open: "13:00", close: "17:00" },
    ]],
  ])("parses the legacy format %s", (input, expected) => {
    expect(parseOpeningHoursDayText(input)).toEqual(expected);
  });

  it("treats an explicit closed marker as closed, not unknown", () => {
    expect(parseOpeningHoursDayText("Lukket")).toEqual([]);
    expect(parseOpeningHoursDayText("Closed")).toEqual([]);
  });

  it("returns null for missing or unparseable text", () => {
    expect(parseOpeningHoursDayText(null)).toBeNull();
    expect(parseOpeningHoursDayText("")).toBeNull();
    expect(parseOpeningHoursDayText("   ")).toBeNull();
    expect(parseOpeningHoursDayText("efter aftale")).toBeNull();
  });

  it("recognises round-the-clock text", () => {
    expect(parseOpeningHoursDayText("Åbent 24 timer")).toEqual([
      { open: "00:00", close: "24:00" },
    ]);
  });
});
