import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Joachim Bograd | Forfatter og fysioterapeut hos FysFinder",
  description:
    "Lær mere om Joachim Bograd, fysioterapeut og forfatter hos FysFinder. Uddannet fra Københavns Professionshøjskole med specialer i smertevidenskab og muskuloskeletal fysioterapi.",
};

export default function JoachimBogradPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8 mt-6">
        <header>
          <div className="mb-6">
            <Image
              src="/images/om-os/joachimbograd-fysfinder.png"
              alt="Joachim Bograd - Fysioterapeut og forfatter hos FysFinder"
              width={200}
              height={200}
              className="rounded-full shadow-lg"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Om Joachim Bograd</h1>
            <p className="text-xl text-gray-600 mb-4">
              Founder af FysFinder & Fysioterapeut
            </p>
          </div>
        </header>

        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-logo-blue">
          <p className="text-gray-600 mb-4">
            Læs Joachims artikler på FysFinder
          </p>
          <div className="space-y-2">
            <div>
              <a
                href="/blog"
                className="text-logo-blue hover:underline text-lg"
              >
                Se blog artikler
              </a>
            </div>
            <div>
              <a
                href="/ordbog"
                className="text-logo-blue hover:underline text-lg"
              >
                Se ordbogen
              </a>
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              Joachim Bograd er uddannet fysioterapeut fra Københavns
              Professionshøjskole og har opbygget stor erfaring med at arbejde
              med mennesker i sin daglige praksis som behandler.
            </p>

            <p>
              Han har videreuddannet sig gennem kurser inden for muskuloskeletal
              fysioterapi, smertevidenskab og træning – områder, der har givet
              ham en særlig ekspertise i komplekse smerteproblematikker, ryg- og
              nakkeproblemer, skadesforebyggelse, bevægelse og neurofysiologi.
            </p>

            <p>
              Joachim har desuden solid erfaring som skribent og har bidraget
              med faglige artikler på flere sundhedsfaglige platforme.
            </p>

            <p>
              Han har også arbejdet som frivillig rådgiver på Smertelinjen, hvor
              han har styrket sine kompetencer inden for kommunikation og
              formidling af viden om smerter.
            </p>

            <p>
              Som stifter af FysFinder brænder Joachim for at gøre fysioterapi
              mere tilgængeligt for alle. I sit arbejde som forfatter på
              platformen fokuserer han på at formidle viden i et klart og
              letforståeligt sprog, så flere kan få indsigt i deres egen krop,
              forstå deres smerter og tage aktivt del i deres egen behandling.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
