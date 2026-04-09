// Added: 2026-04-06 - Extracted shared partner strip so homepage and tilmeld reuse the same associations section.
import Image from "next/image";

export function PartnerStrip() {
  return (
    <section className="rounded-xl bg-[#f3f1ea] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[20px] font-light text-brand-label">Partnerskaber</p>
          <h2 className="mt-1 text-[32px] leading-tight font-normal text-[#1f2b28]">
            Foreninger der anbefaler Fysfinder
          </h2>
        </div>

        <div className="flex w-full flex-wrap items-center gap-6 sm:w-auto sm:gap-10">
          <div className="w-full max-w-full sm:w-auto">
            <Image
              src="/images/samarbejdspartnere/FAKS-logo-med-hele-navn.png"
              alt="FAKS logo"
              width={260}
              height={80}
              className="h-auto w-full max-w-[300px] sm:w-auto sm:max-w-[360px]"
            />
          </div>
          <div className="w-full max-w-full sm:w-auto">
            <Image
              src="/images/samarbejdspartnere/hovedpine-foreningen.png"
              alt="Hovedpineforeningen logo"
              width={340}
              height={120}
              className="h-auto w-full max-w-[300px] sm:w-auto sm:max-w-[360px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
