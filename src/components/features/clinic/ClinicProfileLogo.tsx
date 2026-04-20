"use client";

import Image from "next/image";
import { useState } from "react";
import { getClinicLogoDisplayUrl } from "@/lib/clinic-logo";
import { cn } from "@/lib/utils";

type ClinicProfileLogoProps = {
  logoUrl?: string | null;
  website?: string | null;
  klinikNavn: string;
  className?: string;
};

export const ClinicProfileLogo = ({
  logoUrl,
  website,
  klinikNavn,
  className,
}: ClinicProfileLogoProps) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolved = getClinicLogoDisplayUrl({ logoUrl, website });
  if (!resolved || loadFailed) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/5 bg-gray-100 md:h-20 md:w-20",
        className
      )}
    >
      <Image
        src={resolved}
        alt={`${klinikNavn} logo`}
        fill
        className="object-contain p-1.5"
        sizes="(max-width: 768px) 64px, 80px"
        priority={false}
        onError={() => setLoadFailed(true)}
      />
    </div>
  );
};
