// Added: 2026-10-10 - Course-sized upsell in the agenda inviting clinics to list themselves on Fysfinder.
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const SELLING_POINTS = [
  "Bliv fundet af patienter i dit område",
  "Fyld din kalender",
  "+81.000 danskere har brugt Fysfinder",
];

export function ClinicUpsellCard() {
  return (
    <aside
      aria-label="Tilmeld din klinik på Fysfinder"
      className="flex flex-col gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-primary">
          For klinikker
        </p>
        <p className="mt-0.5 font-semibold leading-snug text-[#1f2b28]">
          Få flere patienter – helt gratis
        </p>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
          {SELLING_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-1">
              <Check
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-brand-primary"
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <Button size="sm" className="shrink-0" asChild>
        <Link href="/for-klinikker">
          Tilmeld din klinik
          <ArrowRight aria-hidden="true" className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
    </aside>
  );
}
