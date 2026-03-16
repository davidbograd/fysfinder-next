/**
 * Ensures a URL has a protocol prefix so the browser treats it as absolute.
 * Database values often store bare domains like "www.fysio360.dk".
 */
export function ensureAbsoluteUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Helper function to clean URLs for display by removing protocol and www.
 */
export function getDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(ensureAbsoluteUrl(url));
    let displayUrl = urlObj.hostname;
    displayUrl = displayUrl.replace(/^www\./, "");
    return displayUrl;
  } catch (e) {
    return url;
  }
}
