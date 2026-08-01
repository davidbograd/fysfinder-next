/**
 * Cache-Control max-age applied to files uploaded to Supabase Storage.
 *
 * Uploaded filenames embed a timestamp, so replacing an image always produces a
 * new URL. That makes a long max-age safe and keeps the Next.js image optimizer
 * from repeatedly re-downloading originals, which is billed as Supabase egress.
 *
 * Must be a string: the Storage SDK expects seconds as a string.
 */
export const STORAGE_CACHE_CONTROL_SECONDS = "31536000";

export const STORAGE_BUCKET_CLINIC_TEAM_PICS = "clinic-team-pics";
