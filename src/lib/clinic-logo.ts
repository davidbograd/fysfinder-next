/**
 * Resolves which image URL to show for a clinic logo: uploaded URL first, else logo.dev from website.
 */

export const getWebsiteDomainForLogo = (
  website: string | null | undefined
): string | null => {
  if (!website) return null;
  const domain = website
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    ?.split("?")[0]
    ?.toLowerCase();
  return domain || null;
};

export const buildLogoDevUrl = (domain: string, token: string): string =>
  `https://img.logo.dev/${domain}?token=${token}&size=64&format=png&fallback=404&retina=true`;

export const getClinicLogoDisplayUrl = (params: {
  logoUrl?: string | null;
  website?: string | null;
}): string | null => {
  const custom = params.logoUrl?.trim();
  if (custom) return custom;

  const token = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
  const domain = getWebsiteDomainForLogo(params.website ?? null);
  if (domain && token) {
    return buildLogoDevUrl(domain, token);
  }
  return null;
};
