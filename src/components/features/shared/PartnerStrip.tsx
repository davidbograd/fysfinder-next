// Added: 2026-04-06 - Extracted shared partner strip so homepage and tilmeld reuse the same associations section.
// Updated: 2026-09-06 - Pass accurate sizes so partner logos are not downloaded at source resolution.
import Image from "next/image";

export function PartnerStrip() {
  return (
    <section className="rounded-xl bg-[#f3f1ea] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="xl:max-w-[340px] xl:shrink-0">
          <p className="text-[20px] font-light text-brand-label">Partnerskaber</p>
          <h2 className="mt-1 text-[32px] leading-tight font-normal text-[#1f2b28]">
            Foreninger der anbefaler Fysfinder
          </h2>
        </div>

        <div className="flex w-full flex-col items-start gap-6 sm:w-auto sm:flex-row sm:items-center sm:gap-8">
          <Image
            src="/images/samarbejdspartnere/FAKS-logo-med-hele-navn.png"
            alt="FAKS logo"
            width={260}
            height={80}
            sizes="(max-width: 640px) 260px, 210px"
            className="h-auto w-full max-w-[260px] sm:w-auto sm:max-w-[210px]"
          />
          <Image
            src="/images/samarbejdspartnere/hovedpine-foreningen.png"
            alt="Hovedpineforeningen logo"
            width={340}
            height={120}
            sizes="(max-width: 640px) 230px, 200px"
            className="h-auto w-full max-w-[230px] sm:w-auto sm:max-w-[200px]"
          />
          <Image
            src="/images/samarbejdspartnere/dansk-skoliose-forening.png"
            alt="Dansk Skoliose Forening logo"
            width={400}
            height={203}
            sizes="(max-width: 640px) 200px, 165px"
            className="h-auto w-full max-w-[200px] sm:w-auto sm:max-w-[165px]"
          />
        </div>
      </div>
    </section>
  );
}
