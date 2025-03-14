import { Metadata } from "next";
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: "Privatlivspolitik | FysFinder.dk",
  description:
    "Læs vores privatlivspolitik og hvordan vi beskytter dine personlige oplysninger på FysFinder.dk",
};

export default function PrivacyPolicyPage() {
  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: "Privatlivspolitik" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs items={breadcrumbItems} />

      <article className="prose prose-lg max-w-none mt-6">
        <h1 className="text-3xl font-bold mb-6">
          Privatlivspolitik for FysFinder.dk
        </h1>

        <div className="text-gray-700 space-y-6">
          <p className="text-lg">
            Hos <strong>FysFinder.dk</strong> tager vi beskyttelsen af
            personoplysninger alvorligt. Denne privatlivspolitik forklarer,
            hvilke oplysninger vi indsamler på FysFinder.dk, hvordan vi
            behandler dem, samt dine rettigheder. FysFinder.dk drives med det
            formål at forbinde patienter og fysioterapi-klinikker i Danmark på
            en nem og overskuelig måde. I den forbindelse behandler vi visse
            personoplysninger om både klinikejere og besøgende brugere. Vi
            overholder EU&apos;s Databeskyttelsesforordning (GDPR) og dansk
            databeskyttelseslovgivning i al behandling af persondata.
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              1. Dataansvarlig og kontakt
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dataansvarlig:</strong> FysFinder
              </li>
              <li>
                <strong>Kontakt:</strong> kontakt@fysfinder.dk
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              2. Formål med behandling og retsgrundlag
            </h2>
            <p>Vi behandler personoplysninger for at:</p>
            <ol className="list-decimal pl-6 space-y-4 mt-4">
              <li>
                <p>
                  Offentliggøre en oversigt over fysioterapi-klinikker i Danmark
                  (offentligt tilgængelige oplysninger om klinikker).
                </p>
                <p className="mt-2">
                  <strong>Retsgrundlag:</strong> Vores{" "}
                  <strong>legitime interesse</strong>, jf. GDPR art. 6(1)(f), i
                  at give borgere adgang til disse oplysninger og synliggøre
                  klinikkerne.
                </p>
              </li>
              <li>
                <p>
                  Imødekomme henvendelser fra brugere/klinikker (fx via e-mail
                  eller formular).
                </p>
                <p className="mt-2">
                  <strong>Retsgrundlag:</strong> Nødvendigt for at opfylde eller
                  besvare din forespørgsel, jf. GDPR art. 6(1)(b) eller vores{" "}
                  <strong>legitime interesse</strong> i at kommunikere, jf. art.
                  6(1)(f).
                </p>
              </li>
              <li>
                <p>
                  Håndtere tekniske data og cookies (fx IP-adresse,
                  browserinformation), herunder statistik/analytics, for at
                  forbedre siden.
                </p>
                <p className="mt-2">
                  <strong>Retsgrundlag:</strong>{" "}
                  <strong>Legitim interesse</strong> (nødvendige cookies og
                  sikkerhedslogning) eller <strong>samtykke</strong> (hvis det
                  drejer sig om analytics-cookies), jf. art. 6(1)(f)/(a).
                </p>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              3. Kategorier af personoplysninger
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Klinikoplysninger:</strong> Kliniknavn (evt. inkl.
                personnavn ved &quot;v/[navn]&quot;), adresse, telefon,
                åbningstider mv.
              </li>
              <li>
                <strong>Kontaktoplysninger fra henvendelser:</strong> Navn,
                e-mail, evt. telefonnummer og selve beskedindholdet, når du
                skriver til os.
              </li>
              <li>
                <strong>Tekniske data:</strong> IP-adresse, browserdata,
                besøgstidspunkter (via cookies, logfiler eller analytics).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              4. Modtagere og videregivelse
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Offentlig visning:</strong> Klinikoplysninger
                offentliggøres på FysFinder.dk, så besøgende kan se dem.
              </li>
              <li>
                <strong>Databehandlere:</strong> Fx webhostingudbyder,
                e-mailudbyder og eventuelt analytics-udbydere.
              </li>
              <li>
                <strong>Myndigheder:</strong> Kun hvis vi er{" "}
                <strong>lovmæssigt</strong> forpligtet til at videregive
                oplysninger (fx efter pålæg).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              5. Opbevaringsperiode
            </h2>
            <p>
              Vi opbevarer dine personoplysninger, så længe det er nødvendigt
              til formålet. Klinikoplysninger bevares typisk, indtil klinikken
              ikke længere eksisterer, eller du som ejer anmoder om sletning.
              Henvendelser gemmes, så længe det er relevant (fx for at kunne
              dokumentere dialog).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">
              6. Dine rettigheder
            </h2>
            <p>Du har ifølge GDPR ret til:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Indsigt:</strong> At få bekræftet om vi behandler dine
                personoplysninger og få en kopi deraf.
              </li>
              <li>
                <strong>Berigtigelse:</strong> At få rettet urigtige eller
                ufuldstændige oplysninger.
              </li>
              <li>
                <strong>Sletning:</strong> At få slettet dine oplysninger, hvis
                behandlingen ikke længere er nødvendig, eller hvis der ikke er
                et gyldigt retsgrundlag.
              </li>
              <li>
                <strong>Begrænsning:</strong> At anmode om, at behandlingen
                begrænses under visse omstændigheder.
              </li>
              <li>
                <strong>Indsigelse:</strong> At gøre indsigelse mod behandling
                på baggrund af vores legitime interesse.
              </li>
              <li>
                <strong>Dataportabilitet:</strong> At få udleveret
                personoplysninger, du selv har givet os, i et maskinlæsbart
                format, hvis behandlingen er baseret på samtykke eller en
                kontrakt, og den foretages automatisk.
              </li>
              <li>
                <strong>Tilbagetrækning af samtykke:</strong> Hvis behandlingen
                sker på baggrund af dit samtykke, kan du til enhver tid trække
                det tilbage (uden at det påvirker lovligheden af tidligere
                behandling).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Klage</h2>
            <p>
              Hvis du mener, at vores behandling af dine personoplysninger er i
              strid med lovgivningen, kan du klage til{" "}
              <strong>Datatilsynet</strong>:{" "}
              <a
                href="http://www.datatilsynet.dk"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.datatilsynet.dk
              </a>
              , tlf. +45 33 19 32 00.
            </p>
            <p className="mt-4">
              Vi opfordrer til, at du først kontakter os, så vi kan forsøge at
              løse problemet.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
