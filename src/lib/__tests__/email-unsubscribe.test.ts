import {
  createUnsubscribeToken,
  normalizeUnsubscribeEmail,
  verifyUnsubscribeToken,
} from "../email-unsubscribe";

const originalEnv = process.env;

describe("email unsubscribe tokens", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, RESEND_API_KEY: "re_test_secret" };
    delete process.env.EMAIL_UNSUBSCRIBE_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("normalizes email casing and verifies matching tokens", () => {
    const token = createUnsubscribeToken("Owner@Example.com");
    expect(normalizeUnsubscribeEmail("Owner@Example.com")).toBe(
      "owner@example.com"
    );
    expect(verifyUnsubscribeToken("owner@example.com", token)).toBe(true);
    expect(verifyUnsubscribeToken("owner@example.com", "deadbeef")).toBe(false);
  });
});
