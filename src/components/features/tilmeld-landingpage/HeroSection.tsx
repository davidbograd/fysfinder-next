// Updated: 2026-04-06 - Rebuilt hero with new conversion copy, visual clinic search input, and trust USP list.
import { Button } from "@/components/ui/button";
import { Check, Eye, Globe, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FORMATTED_MONTHLY_VISITORS_DK } from "@/lib/siteMetrics";
import { SocialProofLogoMarquee } from "@/components/features/tilmeld-landingpage/SocialProofLogoMarquee";
import VerifiedCheck from "@/assets/icons/verified-check.svg";

const trustPoints = [
  `+${FORMATTED_MONTHLY_VISITORS_DK} månedlige besøgende`,
  "+800 månedlige patienthenvendelser",
  "+3 månedlige nye patienter pr. klinik",
];

const heroStatRanges = [
  {
    id: "patients",
    icon: "verified",
    min: 3,
    max: 20,
    label: "nye patienter fra Fysfinder",
  },
  {
    id: "views",
    icon: "eye",
    min: 300,
    max: 1600,
    label: "klinik visninger",
  },
  { id: "clicks", icon: "globe", min: 20, max: 130, label: "website klik" },
  { id: "calls", icon: "phone", min: 10, max: 40, label: "telefon opkald" },
] as const;

function toDanishNumber(value: number) {
  return new Intl.NumberFormat("da-DK").format(value);
}

function interpolateRange(min: number, max: number, percentile: number) {
  return Math.round(min + (max - min) * percentile);
}

export function HeroSection() {
  const sharedPercentile = Math.random();
  const heroStatPills = heroStatRanges.map((metric) => ({
    id: metric.id,
    icon: metric.icon,
    text: `${toDanishNumber(
      interpolateRange(metric.min, metric.max, sharedPercentile)
    )} ${metric.label}`,
  }));

  return (
    <section className="relative w-full">
      <div className="flex w-full min-h-[80vh] flex-col overflow-hidden rounded-b-[32px] bg-brand-beige">
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-center gap-10 md:grid-cols-[6fr_4fr] md:gap-12 lg:gap-14">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-balance text-[40px] leading-tight md:text-[56px] md:leading-[1.08] font-normal tracking-tight text-[#1f2b28]">
                Få flere patienter - uden et tårnhøjt marketingbudget
              </h1>
              <p className="max-w-2xl text-[20px] leading-relaxed text-[#3f4b48]">
                Bliv fundet af patienter, der aktivt søger fysioterapi i dit
                område. Kom i gang på 2 minutter - helt gratis.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 text-[20px] font-medium leading-snug text-[#1f2b28]"
                >
                  <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Button
              className="h-auto rounded-full bg-logo-blue px-8 py-3 text-[18px] font-normal text-white hover:bg-logo-blue/90"
              asChild
            >
              <Link href="/auth/signup">Kom gratis i gang</Link>
            </Button>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.12)] lg:min-h-[420px]">
            <Image
              src="/images/tilmeld/fysioterapi-flere-patienter.jpg"
              alt="Fysioterapeut behandler patient"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
              <div className="flex flex-col items-start gap-2">
                {heroStatPills.map((pill, index) => (
                  <div
                    key={pill.id}
                    className="hero-stacked-pill-in inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-[#1f2b28] shadow-lg backdrop-blur sm:text-base"
                    style={
                      {
                        "--hero-pill-delay": `${index}s`,
                      } as CSSProperties
                    }
                  >
                    {pill.icon === "verified" ? (
                      <Image src={VerifiedCheck} alt="" className="h-5 w-5" />
                    ) : null}
                    {pill.icon === "eye" ? (
                      <Eye className="h-5 w-5 text-[#1f2b28]" />
                    ) : null}
                    {pill.icon === "globe" ? (
                      <Globe className="h-5 w-5 text-[#1f2b28]" />
                    ) : null}
                    {pill.icon === "phone" ? (
                      <Phone className="h-5 w-5 text-[#1f2b28]" />
                    ) : null}
                    <span>{pill.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
        <SocialProofLogoMarquee embedded />
      </div>
    </section>
  );
}
