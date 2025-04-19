import { Metadata } from "next";
import { TranslatorForm } from "./components/TranslatorForm";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Shield, Clock } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Komplet MR-scanning guide | Få svar på dine spørgsmål ✅",
  description: "Oversæt din MR-scanning rapport til letforståeligt dansk.",
};

export default function MRScanPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hvad betyder din MR-scanning? Prøv vores MR-scanningsrapport
            oversætter
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Få din MR-scanning rapport oversat til letforståeligt dansk.
          </p>
        </div>

        <div className="pb-8">
          <ErrorBoundary>
            <TranslatorForm />
          </ErrorBoundary>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Hvordan det virker
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                Indsæt din tekst fra din MR-scanning. Du kan som regel finde den
                på sundhed.dk eller MinSundhed appen.
              </li>
              <li>
                Lad vores værktøj analysere dit resultat og give dig et svar på
                under 30 sekunder.
              </li>
            </ol>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-logo-blue flex-shrink-0" />
              <div>
                <h3 className="font-medium">100% anonymt</h3>
                <p className="text-sm text-gray-600">
                  Du giver ingen personlig data og vi gemmer intet.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-logo-blue flex-shrink-0" />
              <div>
                <h3 className="font-medium">Gratis og hurtigt</h3>
                <p className="text-sm text-gray-600">
                  Du får svar på under 30 sekunder - helt gratis!
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full aspect-[16/10] mt-8">
            <Image
              src="/images/mr-scanning/mr-scanning.png"
              alt="Moderne MR-scanner (Magnetic Resonance Imaging) i et lyst, professionelt hospitalsmiljø"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>

          {/* Tabel afsnit */}
          <div className="overflow-x-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-2">
              Oversættelse af latinske ord på MR scanningsrapport
            </h2>
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-logo-blue text-white">
                  <th className="px-4 py-2 text-left border">
                    Latinsk udtryk på MR-rapporten
                  </th>
                  <th className="px-4 py-2 text-left border">
                    Betydning på almindeligt dansk
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Abscess</td>
                  <td className="px-4 py-2 border">Byld (pusansamling)</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Arthrose</td>
                  <td className="px-4 py-2 border">Slidgigt</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Atrophi</td>
                  <td className="px-4 py-2 border">
                    Muskelsvind eller vævstab
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Bursa</td>
                  <td className="px-4 py-2 border">
                    Slimsæk (beskytter led mod friktion)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Cartilage</td>
                  <td className="px-4 py-2 border">Brusk</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Cervical</td>
                  <td className="px-4 py-2 border">
                    Nakke (halsdelen af rygsøjlen)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Columna</td>
                  <td className="px-4 py-2 border">Rygsøjle</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Corpus vertebrae</td>
                  <td className="px-4 py-2 border">Ryghvirvelens ”krop”</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Degeneration</td>
                  <td className="px-4 py-2 border">Slidforandring</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Discus intervertebralis</td>
                  <td className="px-4 py-2 border">
                    Disk mellem ryghvirvlerne
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Diskusprolaps</td>
                  <td className="px-4 py-2 border">Udposning af disk</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Fibrose</td>
                  <td className="px-4 py-2 border">Dannelse af arvæv</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Fractur</td>
                  <td className="px-4 py-2 border">Knoglebrud</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Hernia</td>
                  <td className="px-4 py-2 border">Brok eller udposning</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Inflammation</td>
                  <td className="px-4 py-2 border">Betændelse</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Læssion</td>
                  <td className="px-4 py-2 border">Skade eller læsion</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Ligamentum cruciatum</td>
                  <td className="px-4 py-2 border">Korsbånd</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Lumbal</td>
                  <td className="px-4 py-2 border">
                    Lænden (den nedre del af rygsøjlen)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Luxatio</td>
                  <td className="px-4 py-2 border">
                    Ledskred (et led går af led)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Menisc læssion</td>
                  <td className="px-4 py-2 border">Skade på menisk i knæet</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Necrose</td>
                  <td className="px-4 py-2 border">Vævsdød</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Oedem</td>
                  <td className="px-4 py-2 border">
                    Væskeansamling eller hævelse
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Ruptur</td>
                  <td className="px-4 py-2 border">
                    Overrivning (f.eks. af en sene eller ligament)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Scoliosis</td>
                  <td className="px-4 py-2 border">Skævhed i rygsøjlen</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Spondylolisthese</td>
                  <td className="px-4 py-2 border">
                    Fremadglidning af ryghvirvler
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Stenose</td>
                  <td className="px-4 py-2 border">
                    Forsnævring (f.eks. spinal stenose)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Tendinitis</td>
                  <td className="px-4 py-2 border">Senebetændelse</td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Thoracal</td>
                  <td className="px-4 py-2 border">
                    Brystryggen (midterdelen af rygsøjlen)
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">Tumor</td>
                  <td className="px-4 py-2 border">Svulst eller knude</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Content afsnit */}
          <div className="overflow-x-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mt-8 mb-2">
              Hvad er en MR scanning?
            </h2>
            <p>
              En MR-scanning (magnetisk resonans-scanning) er en avanceret
              billeddiagnostisk metode, der benytter stærke magnetfelter og
              radiobølger til at skabe detaljerede billeder af kroppens indre.
              MR-scanninger udføres for at undersøge organer, muskler, led og
              andet væv uden brug af skadelig stråling.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Hvorfor udføres en MR scanning?
            </h3>
            <p>
              En MR-scanning kan identificere sygdomme, skader eller
              abnormiteter som betændelse, brud, slidgigt, diskusprolaps eller
              tumorsygdomme. Metoden vælges ofte, når der kræves høj præcision
              og detaljerede billeder, især af blødt væv som muskler, nerver og
              led.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Hvordan foregår en MR scanning?
            </h3>
            <p>
              Under scanningen ligger du i en cylinderformet scanner, som
              genererer et stærkt magnetfelt. Du skal ligge stille under hele
              proceduren for at sikre klare billeder. Proceduren er smertefri,
              men maskinen laver høje bankende lyde. Derfor får du typisk
              høretelefoner eller ørepropper.
            </p>
            <div className="relative w-full aspect-[16/10] mt-8">
              <Image
                src="/images/mr-scanning/mr-scanning.png"
                alt="Moderne MR-scanner (Magnetic Resonance Imaging) i et lyst, professionelt hospitalsmiljø"
                fill
                className="object-cover rounded-xl"
                priority
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold mt-16 mb-2">
              Hvad kan man se på en MR scanning?
            </h2>
            <p>
              En MR-scanning kan vise en lang række forskellige områder i
              kroppen. Her er nogle af de hyppigste MR-scanningstyper baseret på
              kroppens dele:
            </p>

            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-logo-blue text-white">
                  <th className="px-4 py-2 text-left border">Kropsområde</th>
                  <th className="px-4 py-2 text-left border">Bruges ved</th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af rygsøjlen</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Viser slidgigt, diskusprolaps, rygmarvsbetændelse, tumorer
                      og nerveproblemer.
                    </p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af knæet</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Afslører skader på menisk, korsbånd, brusk, slidgigt og
                      betændelsestilstande.
                    </p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af hjernen</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Anvendes ved mistanke om blodprop, blødning, tumor,
                      multipel sklerose (MS) og epilepsi.
                    </p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af skulderen</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Finder skader på rotatormanchetten, impingement-syndrom,
                      ledvæskeansamlinger og slidgigt.
                    </p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af maven</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Kan opdage lever- eller nyresygdomme, tumorer, cyster
                      eller tarmsygdomme.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-xl sm:text-2xl font-semibold mt-16 mb-2">
              Hvor lang tid tager en MR scanning?
            </h2>
            <p>
              Varigheden af en MR scanning afhænger af det område, der skal
              undersøges:
            </p>

            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-logo-blue text-white">
                  <th className="px-4 py-2 text-left border">Kropsområde</th>
                  <th className="px-4 py-2 text-left border">
                    Varighed (afhængig af omfang)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af knæ</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>15-30 minutter</p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af rygsøjlen</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>20-45 minutter</p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af hjernen</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>20-40 minutter</p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">MR scanning af skulder</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>15-30 minutter</p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">
                      MR scanning af mave og indre organer
                    </h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>30-60 minutter</p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-xl sm:text-2xl font-semibold mt-16 mb-2">
              Forberedelse til MR scanning – Sådan forbereder du dig
            </h2>
            <p>
              Forberedelsen til en MR scanning kræver typisk få, men vigtige
              trin:
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Tal med din behandler
            </h3>
            <p>
              Fortæl om eventuelle sygdomme, allergier, graviditet eller
              metalimplantater i kroppen.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Undgå smykker og metalgenstande
            </h3>
            <p>
              Du skal fjerne smykker, briller, piercinger og ure inden
              scanningen.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Beklædning under scanningen
            </h3>
            <p>
              Ofte bliver du bedt om at tage hospitalstøj på, men nogle gange
              kan du beholde dit eget tøj, så længe det er uden metaldele.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Mad og drikke før scanning
            </h3>
            <p>
              Følg de anvisninger, du har fået af klinikken. Normalt kan du
              spise og drikke som sædvanligt, men ved scanning af maven skal du
              muligvis faste.
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold mt-16 mb-2">
              MR scanning henvisning – Hvem kan give henvisning?
            </h2>
            <p>
              For at få en MR scanning i Danmark skal du have en henvisning.
              Henvisningen kan udstedes af følgende behandlere:
            </p>
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-logo-blue text-white">
                  <th className="px-4 py-2 text-left border">Behandler</th>
                  <th className="px-4 py-2 text-left border">Forklaring</th>
                </tr>
              </thead>
              <tbody>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">Praktiserende læge</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Din egen læge kan henvise dig til en MR scanning efter
                      vurdering af dine symptomer og behov.
                    </p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">Speciallæge</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      En speciallæge (f.eks. ortopædkirurg, neurolog eller
                      reumatolog) kan også henvise dig, hvis du behandles for
                      specifikke sygdomme eller skader.
                    </p>
                  </td>
                </tr>
                <tr className="even:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <h3 className="font-semibold">Kiropraktor</h3>
                  </td>
                  <td className="px-4 py-2 border">
                    <p>
                      Ved bestemte ryg- eller ledproblemer kan en kiropraktor
                      også henvise dig direkte til MR scanning.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>

            <h2 className="text-xl sm:text-2xl font-semibold mt-16 mb-2">
              Ofte stillede spørgsmål om MR scanning
            </h2>
            <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-2">
              Kan alle få en MR scanning?
            </h3>
            <p>
              De fleste kan få en MR scanning, men personer med visse typer
              metalimplantater, pacemaker eller andre elektroniske implantater
              bør informere personalet, da dette kan forhindre scanning.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Er en MR scanning farlig?
            </h3>
            <p>
              Nej, en MR scanning er ikke farlig, da den ikke bruger stråling.
              Den er helt sikker, hvis retningslinjerne følges.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Hvordan får jeg svar på min MR scanning?
            </h3>
            <p>
              Du får normalt svar fra din henvisende behandler inden for få dage
              efter scanningen.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Er MR scanning og CT scanning det samme?
            </h3>
            <p>
              Nej. En MR scanning bruger magnetfelter, mens en CT scanning
              benytter røntgenstråling.
            </p>
            <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-2">
              Kan man have klaustrofobi under MR scanning?
            </h3>
            <p>
              Ja, nogle patienter oplever ubehag eller angst under MR
              scanningen. Informér personalet på forhånd, hvis du lider af
              klaustrofobi, så der kan tages særlige hensyn. Ved at benytte
              FysFinders MR-scanningsrapport oversætter, kan du hurtigt og
              effektivt forstå resultatet af din scanning og dermed tage aktiv
              del i dit eget behandlingsforløb.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
