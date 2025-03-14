/**
 * Helper function to clean URLs for display by removing protocol and www.
 */
export function getDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove protocol (http:// or https://)
    let displayUrl = urlObj.hostname;
    // Remove 'www.' if present
    displayUrl = displayUrl.replace(/^www\./, "");
    return displayUrl;
  } catch (e) {
    return url;
  }
}
