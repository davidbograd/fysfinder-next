"use client";

// Updated: 2026-08-29 - Show carousel chips only after a logo loads; hide failures. Shortened TræningsHulen.
import Image from "next/image";
import { useMemo, useState } from "react";

interface ClinicLogoItem {
  name: string;
  website: string;
}

interface SocialProofLogoMarqueeProps {
  embedded?: boolean;
  heading?: string;
}

const clinicLogos: ClinicLogoItem[] = [
  { name: "Fysioterapeuterne Østerbro", website: "https://fysioterapeuterneoesterbro.dk" },
  { name: "TræningsHulen | Sundhed & Fysioterapi", website: "https://traeningshulen.dk" },
  { name: "Svendborgsund Fysioterapiklinik", website: "https://www.svendborgsundfysioterapi.dk/" },
  { name: "Aalborg Smerte- og Sportsklinik", website: "https://smerteogsport.dk/" },
  { name: "JustHealth - Kiropraktik & Idrætsklinik", website: "https://justhealth.dk/" },
  { name: "Fysio360", website: "www.fysio360.dk" },
  { name: "Smertefys Køge", website: "https://smertefys.nu/" },
  { name: "Min-behandler", website: "https://min-behandler.dk/kontakt/" },
  { name: "Smertefribevægelse Aalborg", website: "https://smertefribevaegelse.dk/" },
  { name: "Faxe Fysioterapi og Sportsklinik", website: "https://faxefys.dk/" },
  { name: "Tune Fysioterapi", website: "https://tunefysioterapi.dk" },
  { name: "Kokkedal Fysioterapi", website: "https://kokkedalfys.dk/" },
  { name: "JL Sportsklinik", website: "https://jlsportsklinik.dk/" },
  { name: "Copenhagen Physio", website: "https://www.copenhagenphysio.dk/" },
  { name: "Fysioterapi og træning", website: "http://www.fysionygade.dk/" },
  { name: "Fysioterapeut Patrycja Los", website: "https://plfysio.dk/" },
  { name: "Hjernerystelsesfyssen", website: "https://hjernerystelsesfyssen.dk" },
  { name: "RygCenter Skjern", website: "https://rygcenterskjern.dk/" },
  { name: "Værløse Hareskov Fysioterapi", website: "http://www.fys-bassin.dk/" },
];

export function SocialProofLogoMarquee({
  embedded = false,
  heading = "De bruger allerede Fysfinder",
}: SocialProofLogoMarqueeProps) {
  const [logoLoadFailed, setLogoLoadFailed] = useState<Record<string, boolean>>({});
  const [logoReady, setLogoReady] = useState<Record<string, boolean>>({});
  const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

  const items = useMemo(() => [...clinicLogos, ...clinicLogos], []);

  function buildLogoPath(website: string) {
    if (!logoDevToken) return null;

    const logoDomain = website
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .split("?")[0]
      .toLowerCase();

    return `https://img.logo.dev/${logoDomain}?token=${logoDevToken}&size=64&format=png&fallback=404&retina=true`;
  }

  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      className={`w-full py-6 ${
        embedded
          ? "overflow-x-clip bg-transparent"
          : "border-y border-gray-200 bg-white"
      }`}
    >
      <div
        className={
          embedded
            ? "w-full overflow-hidden"
            : "mx-auto w-full max-w-[1440px] overflow-hidden px-5 sm:px-6 lg:px-8"
        }
      >
        <div className="mb-3 px-4 text-center text-sm font-medium text-balance text-gray-500">
          {heading}
        </div>
        <div className="relative overflow-hidden rounded-full">
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-20 rounded-l-full bg-gradient-to-r md:w-28 ${
              embedded
                ? "from-brand-beige/95 via-brand-beige/70 to-transparent"
                : "from-white/95 via-white/70 to-transparent"
            }`}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-20 rounded-r-full bg-gradient-to-l md:w-28 ${
              embedded
                ? "from-brand-beige/95 via-brand-beige/70 to-transparent"
                : "from-white/95 via-white/70 to-transparent"
            }`}
            aria-hidden="true"
          />
          <div className="marquee-track flex min-w-max items-center gap-4">
            {items.map((item, index) => {
              const logoPath = buildLogoPath(item.website);
              if (!logoPath || logoLoadFailed[item.website]) {
                return null;
              }

              const isReady = Boolean(logoReady[item.website]);

              return (
              <div
                key={`${item.website}-${index}`}
                className={
                  isReady
                    ? "flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3"
                    : "pointer-events-none h-0 w-0 overflow-hidden"
                }
                aria-hidden={!isReady}
              >
                <div className="h-8 w-8 overflow-hidden rounded-sm bg-white">
                  <Image
                    src={logoPath}
                    alt={`${item.name} logo`}
                    width={32}
                    height={32}
                    unoptimized
                    className="h-full w-full object-contain"
                    onLoad={() =>
                      setLogoReady((prev) => ({ ...prev, [item.website]: true }))
                    }
                    onError={() =>
                      setLogoLoadFailed((prev) => ({ ...prev, [item.website]: true }))
                    }
                  />
                </div>
                {isReady ? (
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                ) : null}
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee 170s linear infinite;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Wrapper>
  );
}
