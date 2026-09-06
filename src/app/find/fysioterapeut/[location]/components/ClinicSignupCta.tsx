// ClinicSignupCta - sidebar prompt inviting clinic owners to list themselves, shown beside
// the nearby-clinics list.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FORMATTED_TOTAL_USERS_DK } from "@/lib/siteMetrics";

interface ClinicSignupCtaProps {
  /** Already carries the right Danish preposition, e.g. "på Østerbro" or "i Aarhus". */
  cityLocationPhrase: string;
}

export function ClinicSignupCta({ cityLocationPhrase }: ClinicSignupCtaProps) {
  return (
    <aside className="rounded-2xl bg-brand-beige p-6">
      <h3 className="text-balance text-lg font-semibold text-brand-primary">
        Driver du en klinik {cityLocationPhrase}?
      </h3>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-gray-600">
        Få flere patienter gennem Fysfinder - Over {FORMATTED_TOTAL_USERS_DK}{" "}
        danskere har allerede brugt Fysfinder til at finde en fysioterapeut.
        Opret din klinik gratis, og bliv fundet af patienter i dit område.
      </p>
      <Button
        asChild
        className="mt-5 w-full bg-logo-blue text-white hover:bg-logo-blue/90"
      >
        <Link href="/tilmeld">Tilmeld din klinik</Link>
      </Button>
    </aside>
  );
}
