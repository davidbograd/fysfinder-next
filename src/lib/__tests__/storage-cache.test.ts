import { STORAGE_CACHE_CONTROL_SECONDS } from "@/lib/storage-cache";

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

describe("Supabase Storage egress guards", () => {
  it("uploads images with a long-lived Cache-Control max-age", () => {
    const maxAge = Number(STORAGE_CACHE_CONTROL_SECONDS);

    expect(Number.isInteger(maxAge)).toBe(true);
    expect(maxAge).toBeGreaterThanOrEqual(THIRTY_DAYS_IN_SECONDS);
  });

  it("keeps the image optimizer TTL at least as long as the storage max-age", async () => {
    const nextConfig = (await import("../../../next.config.js")).default;

    // The optimizer uses max(minimumCacheTTL, upstream max-age). If minimumCacheTTL
    // regressed to the Next default, originals would be re-fetched from Supabase.
    expect(nextConfig.images.minimumCacheTTL).toBeGreaterThanOrEqual(
      Number(STORAGE_CACHE_CONTROL_SECONDS)
    );
  });
});
