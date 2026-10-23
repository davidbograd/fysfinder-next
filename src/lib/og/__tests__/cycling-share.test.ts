import { computeFtp, FtpSuccess } from "@/lib/calculators/ftp";
import { computeWattPerKg, WattPerKgSuccess } from "@/lib/calculators/watt-per-kg";
import {
  buildFtpShareUrl,
  buildWattPerKgShareUrl,
  parseFtpShareParams,
  parseWattPerKgShareParams,
} from "../cycling-share";

describe("FTP share link", () => {
  it("carries the FTP and test, and rebuilds the zones from it", () => {
    const result = computeFtp({ source: "test20", watts: "263" }) as FtpSuccess;
    const url = buildFtpShareUrl(result);

    expect(url).toBe("/api/og/ftp?ftp=250&test=test20");
    const content = parseFtpShareParams(new URL(url, "https://x.dk").searchParams);
    expect(content?.ftp).toBe(250);
    expect(content?.zones).toEqual(result.zones);
  });

  it.each(["ftp=250", "ftp=abc&test=ramp", "ftp=5&test=ramp", "ftp=250&test=other"])(
    "rejects %p",
    (query) => {
      expect(parseFtpShareParams(new URLSearchParams(query))).toBeNull();
    }
  );
});

describe("watt per kg share link", () => {
  it("shares W/kg and gender – never the weight or FTP", () => {
    const result = computeWattPerKg({
      source: "ftp",
      gender: "male",
      watts: "250",
      weightKg: "75",
    }) as WattPerKgSuccess;
    const url = buildWattPerKgShareUrl(result);

    expect(url).toBe("/api/og/watt-pr-kg?wkg=3.33&koen=male");
    expect(url).not.toMatch(/75|250/);
    const content = parseWattPerKgShareParams(new URL(url, "https://x.dk").searchParams);
    expect(content?.level).toBe("Godt trænet");
  });

  it.each(["wkg=3.33", "wkg=3.33&koen=other", "wkg=0&koen=male", "wkg=3.333&koen=male"])(
    "rejects %p",
    (query) => {
      expect(parseWattPerKgShareParams(new URLSearchParams(query))).toBeNull();
    }
  );
});
