/**
 * Admin utility functions
 * Checks if a user is an admin based on their email
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

/**
 * Check if a user email is an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get list of admin emails (for debugging/logging purposes)
 */
export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
}

