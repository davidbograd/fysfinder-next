// PartnershipBanner component - Renders partnership banners for specific specialties
// Extracted from location page to eliminate duplication between Danmark and city code paths

import Image from "next/image";

interface PartnershipBannerProps {
  specialtySlug?: string;
}

export function PartnershipBanner({ specialtySlug }: PartnershipBannerProps) {
  if (specialtySlug === "kroniske-smerter") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-4 sm:gap-8">
        <Image
          src="/images/samarbejdspartnere/FAKS-smertelinjen-logo.png"
          alt="FAKS - Foreningen af kroniske smerteramte og pårørende"
          width={640}
          height={400}
          className="w-full sm:max-w-[400px] h-auto"
        />
        <p className="text-gray-600 w-full sm:w-auto sm:flex-1">
          I samarbejde med FAKS, Foreningen af kroniske smerteramte og
          pårørende.
        </p>
      </div>
    );
  }

  if (specialtySlug === "hovedpine" || specialtySlug === "migraene") {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-4 sm:gap-8">
        <Image
          src="/images/samarbejdspartnere/hovedpine-foreningen.png"
          alt="Hovedpine Foreningen"
          width={640}
          height={400}
          className="w-full sm:max-w-[240px] h-auto"
        />
        <p className="text-gray-600 w-full sm:w-auto sm:flex-1">
          I samarbejde med Hovedpine Foreningen.
          <span className="block">
            Samarbejdet indebærer ikke en faglig vurdering eller godkendelse af
            de nævnte klinikker.
          </span>
        </p>
      </div>
    );
  }

  return null;
}
