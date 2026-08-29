"use client";

// Updated: 2026-08-30 - Scroll the strip by a measured pixel offset so iOS Safari animates it.
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMarqueeDurationSeconds } from "./marquee-timing";

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
  const [loopDistance, setLoopDistance] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;

  const items = useMemo(() => [...clinicLogos, ...clinicLogos], []);

  const measureLoopDistance = useCallback(() => {
    const track = trackRef.current;
    const viewport = track?.parentElement;
    if (!track || !viewport) return;

    const firstCopy = track.querySelector<HTMLElement>('[data-marquee-copy="0"]');
    const secondCopy = track.querySelector<HTMLElement>('[data-marquee-copy="1"]');
    if (!firstCopy || !secondCopy) {
      setLoopDistance(0);
      return;
    }

    // Both chips live inside the animated track, so the gap between them is the
    // loop length regardless of whatever transform is currently in flight.
    const distance = Math.round(
      secondCopy.getBoundingClientRect().left -
        firstCopy.getBoundingClientRect().left
    );

    // Nothing worth scrolling until the loaded logos are wider than the strip.
    setLoopDistance(distance > viewport.clientWidth ? distance : 0);
  }, []);

  // Logos arrive one by one and each one widens the strip, so wait for the width
  // to settle before committing to a distance.
  const scheduleMeasure = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      measureLoopDistance();
    }, 250);
  }, [measureLoopDistance]);

  useEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure, logoReady, logoLoadFailed]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(track);

    return () => {
      observer.disconnect();
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [scheduleMeasure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loopDistance <= 0) return;
    if (typeof track.animate !== "function") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const durationMs = getMarqueeDurationSeconds(loopDistance) * 1000;
    if (durationMs <= 0) return;

    // Keep this an absolute pixel offset. A percentage (translateX(-50%)) resolves
    // against the track's own width, which browsers disagree on for a max-content
    // flex row inside a clipped parent — iOS Safari ended up not scrolling at all.
    const animation = track.animate(
      [
        { transform: "translate3d(0px, 0px, 0px)" },
        { transform: `translate3d(${-loopDistance}px, 0px, 0px)` },
      ],
      {
        duration: durationMs,
        easing: "linear",
        iterations: Infinity,
      }
    );

    return () => animation.cancel();
  }, [loopDistance]);

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
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-12 rounded-l-full bg-gradient-to-r md:w-28 ${
              embedded
                ? "from-brand-beige/95 via-brand-beige/70 to-transparent"
                : "from-white/95 via-white/70 to-transparent"
            }`}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-12 rounded-r-full bg-gradient-to-l md:w-28 ${
              embedded
                ? "from-brand-beige/95 via-brand-beige/70 to-transparent"
                : "from-white/95 via-white/70 to-transparent"
            }`}
            aria-hidden="true"
          />
          <div
            ref={trackRef}
            className="marquee-track flex min-w-max items-center gap-4 will-change-transform"
          >
            {items.map((item, index) => {
              const logoPath = buildLogoPath(item.website);
              if (!logoPath || logoLoadFailed[item.website]) {
                return null;
              }

              const isReady = Boolean(logoReady[item.website]);

              return (
              <div
                key={`${item.website}-${index}`}
                data-marquee-copy={index < clinicLogos.length ? "0" : "1"}
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
    </Wrapper>
  );
}
