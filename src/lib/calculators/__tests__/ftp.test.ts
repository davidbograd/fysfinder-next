import {
  buildFtpZones,
  computeFtp,
  formatZoneRange,
} from "../ftp";

describe("computeFtp", () => {
  it("estimates FTP from each method and rounds to whole watt", () => {
    expect(computeFtp({ source: "test20", watts: "280" })).toMatchObject({ ok: true, ftp: 266 });
    expect(computeFtp({ source: "ramp", watts: "360" })).toMatchObject({ ok: true, ftp: 270 });
    expect(computeFtp({ source: "ftp", watts: "250" })).toMatchObject({ ok: true, ftp: 250 });
    // 263 x 0,95 = 249,85
    expect(computeFtp({ source: "test20", watts: "263" })).toMatchObject({ ok: true, ftp: 250 });
  });

  it("rejects empty, zero, negative and unrealistic input", () => {
    for (const watts of ["", "0", "-200", "abc", "29", "2001"]) {
      expect(computeFtp({ source: "ftp", watts })).toEqual({
        ok: false,
        message: "Indtast en effekt mellem 30 og 2.000 watt.",
      });
    }
  });
});

describe("buildFtpZones", () => {
  it("gives the agreed zones at 250 W", () => {
    expect(buildFtpZones(250).map(formatZoneRange)).toEqual([
      "0–137 W",
      "138–187 W",
      "188–224 W",
      "225–262 W",
      "263–299 W",
      "Fra 300 W",
      "Maksimal sprintindsats – individuelt",
    ]);
  });

  it("leaves no gaps or overlaps between Z1 and Z6 for any realistic FTP", () => {
    for (let ftp = 23; ftp <= 2000; ftp++) {
      const zones = buildFtpZones(ftp);
      expect(zones).toHaveLength(7);
      for (let i = 1; i < 6; i++) {
        expect(zones[i].min).toBe((zones[i - 1].max as number) + 1);
        expect(zones[i].min).toBeLessThanOrEqual(zones[i].max ?? Infinity);
      }
    }
  });

  it("drops zones that round to nothing instead of showing min above max", () => {
    const zones = buildFtpZones(3);
    for (const zone of zones) {
      if (zone.min !== null && zone.max !== null) {
        expect(zone.min).toBeLessThanOrEqual(zone.max);
      }
    }
    expect(zones.at(-1)).toMatchObject({ id: "Z7", min: null, max: null });
  });
});
