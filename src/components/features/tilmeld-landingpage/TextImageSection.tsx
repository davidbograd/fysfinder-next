// Added: 2026-04-06 - Added text-plus-image section to position Fysfinder value proposition.
import { CheckCircle2, XCircle } from "lucide-react";

const withoutFysfinderPoints = [
  "Huller i kalenderen",
  "Svært at være synlig for mulige patienter",
  "Ingen indsigt i hvad der faktisk skaber henvendelser",
];

const withFysfinderPoints = [
  "Flere relevante patienthenvendelser",
  "Synlighed når patienter aktivt søger i dit lokalområde",
  "Klarere indsigt i visninger, klik og henvendelser",
  "Mindre marketingbøvl - mere tid til patienter",
];

export function TextImageSection() {
  return (
    <section className="w-full bg-background py-16 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
            Færre huller i kalenderen. Flere patienter.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
            <div className="h-[5px] w-full bg-rose-500" />
            <div className="p-6">
              <h3 className="mb-4 text-2xl font-semibold text-[#1f2b28]">
                Uden Fysfinder
              </h3>
              <div className="space-y-4">
                {withoutFysfinderPoints.map((point) => (
                  <div key={point} className="flex gap-3">
                    <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-500" />
                    <p className="text-base text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_20px_rgba(15,23,42,0.06)]">
            <div className="h-[5px] w-full bg-emerald-500" />
            <div className="p-6">
              <h3 className="mb-4 text-2xl font-semibold text-[#1f2b28]">
                Med Fysfinder
              </h3>
              <div className="space-y-4">
                {withFysfinderPoints.map((point) => (
                  <div key={point} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-base text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 max-w-4xl space-y-6">
          <h2 className="text-[2rem] font-semibold leading-tight text-[#1f2b28]">
          En platform stiftet af en fysioterapeut - til fysioterapeuter
          </h2>

          <p className="text-base leading-relaxed text-gray-700">
            <strong>Få patienter der allerede leder</strong>
            <br />
            Patienter leder hver dag efter en fysioterapeut i dit lokalområde.
            Vi sørger for, at din klinik bliver fundet, når de aktivt søger i
            dit område.
          </p>

          <p className="text-base leading-relaxed text-gray-700">
            <strong>Slip for bøvl og marketing</strong>
            <br />
            Du behøver ikke tænke på SEO, annoncer eller sociale medier. Tilmeld
            din klinik – og få flere henvendelser fra måned 1.
          </p>

          <p className="text-base leading-relaxed text-gray-700">
            <strong>Flere bookinger uden at betale dyrt</strong>
            <br />
            Vi kender fysioterapeutbranchen personligt og byggede Fysfinder,
            fordi der manglede en nem måde at få nye patienter på. Uden det
            skal koste en formue.
          </p>
        </div>
      </div>
    </section>
  );
}
