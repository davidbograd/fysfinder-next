/**
 * HMAC unsubscribe tokens for monthly clinic summary emails.
 */

import { createHmac, timingSafeEqual } from "crypto";

const PURPOSE = "monthly-clinic-summary";

function getUnsubscribeSecret(): string {
  return (
    process.env.EMAIL_UNSUBSCRIBE_SECRET ||
    process.env.RESEND_API_KEY ||
    ""
  );
}

export function normalizeUnsubscribeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function createUnsubscribeToken(email: string): string {
  const secret = getUnsubscribeSecret();
  if (!secret) {
    throw new Error("EMAIL_UNSUBSCRIBE_SECRET or RESEND_API_KEY is required");
  }

  return createHmac("sha256", secret)
    .update(`${PURPOSE}:${normalizeUnsubscribeEmail(email)}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token || !getUnsubscribeSecret()) {
    return false;
  }

  try {
    const expected = createUnsubscribeToken(email);
    const actual = token.trim();
    if (expected.length !== actual.length) {
      return false;
    }
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(
  email: string,
  siteUrl = "https://www.fysfinder.dk"
): string {
  const url = new URL("/api/email/unsubscribe", siteUrl);
  url.searchParams.set("email", normalizeUnsubscribeEmail(email));
  url.searchParams.set("token", createUnsubscribeToken(email));
  return url.toString();
}
