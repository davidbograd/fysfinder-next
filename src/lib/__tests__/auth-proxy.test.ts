// Updated: 2026-09-06 - Covers skipping auth refresh on anonymous public routes.

import { shouldRefreshAuthSession } from "../auth-proxy";

describe("shouldRefreshAuthSession", () => {
  it("skips refresh on anonymous public pages", () => {
    expect(shouldRefreshAuthSession("/", [])).toBe(false);
    expect(shouldRefreshAuthSession("/find/fysioterapeut/koebenhavn", [])).toBe(
      false
    );
    expect(shouldRefreshAuthSession("/blog/soevn-effekt", [])).toBe(false);
  });

  it("refreshes for dashboard, auth entry pages, and existing sessions", () => {
    expect(shouldRefreshAuthSession("/dashboard", [])).toBe(true);
    expect(shouldRefreshAuthSession("/dashboard/clinic/1/edit", [])).toBe(true);
    expect(shouldRefreshAuthSession("/auth/signin", [])).toBe(true);
    expect(shouldRefreshAuthSession("/auth/signup", [])).toBe(true);
    expect(
      shouldRefreshAuthSession("/", [{ name: "sb-abc-auth-token" }])
    ).toBe(true);
  });
});
