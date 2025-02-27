import Image from "next/image";

export const metadata = {
  title: "Kontakt | FysFinder",
  description:
    "Kontakt FysFinder for samarbejde eller spørgsmål om vores platform.",
};

export default function KontaktPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Kontakt</h1>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <div className="space-y-6 mb-8">
            <p className="text-lg">
              Er du interesseret i at høre mere om mulighederne for samarbejde?
            </p>

            <p className="text-lg">
              Har du en klinik, der endnu ikke er på Fysfinder, eller ønsker du
              at få opdateret dine oplysninger?
            </p>

            <p className="text-lg">Kontakt os, så tager vi en snak på:</p>
          </div>

          <div className="text-lg font-medium">kontakt@fysfinder.dk</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative aspect-[3/4] w-1/2">
            <Image
              src="/images/om-os/joachimbograd-fysfinder.png"
              alt="Joachim fra FysFinder"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 w-1/2">
            Joachim Bograd, Founder & Fysioterapeut
          </p>
        </div>
      </div>
    </div>
  );
}
