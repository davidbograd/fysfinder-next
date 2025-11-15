import { Metadata } from "next";
import Link from "next/link";
import { PaceCalculator } from "./components/PaceCalculator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";
import RelatedToolsSection from "@/components/features/RelatedToolsSection";

export const metadata: Metadata = {
  title: "Pace beregner → Beregn din løbehastighed i min/km ✅",
  description:
    "Med FysFinder's online pace beregner kan du nemt beregne din løbehastighed i min/km. Uanset om du træner til 5 km, halvmarathon eller et helt marathon.",
};

export default async function PaceBeregnerPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "Pace beregner" },
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
      <WebAppStructuredData
        type="tool"
        name="Pace beregner"
        description="Beregn din løbehastighed (pace) i min/km og hastighed i km/t"
        breadcrumbs={breadcrumbItems}
        toolType="calculator"
      />
      <div className="space-y-6 sm:space-y-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Pace beregner – Beregn nemt din løbehastighed (min/km)
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Med FysFinder's pace beregner kan du nemt beregne din løbehastighed i
            antal minutter pr. kilometer (løbe pace). Bliv klogere på dine
            løbetider og find din optimale pacing strategi – uanset om du træner
            til 5 km, halvmarathon eller et helt marathon.
          </p>
        </div>

        <div className="pb-8">
          <PaceCalculator />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>OBS</strong>:{" "}
            <em>
              🏃‍♂️ Træningstip: Brug din beregnede pace som motivation og
              pejlemærke – men lyt altid til kroppen undervejs. Små justeringer
              gør en stor forskel på længere distancer.
            </em>
          </p>
        </div>

        <div className="space-y-12">
          {/* SEO Content */}
          <div
            className="prose prose-slate max-w-none 
                 prose-headings:text-gray-900
                 prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:font-semibold prose-h2:mt-12 prose-h2:mb-4
                 prose-h3:text-lg prose-h3:sm:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-2
                 prose-p:text-gray-700 prose-p:mb-4 prose-p:leading-relaxed
                 prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:text-gray-700
                 prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:text-gray-700
                 prose-li:mb-2 prose-li:leading-relaxed
                 prose-strong:font-semibold prose-strong:text-gray-900
                 prose-a:text-logo-blue prose-a:no-underline hover:prose-a:underline
                 prose-table:w-full prose-table:border-collapse prose-table:mt-4
                 prose-th:bg-logo-blue prose-th:text-white prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border
                 prose-td:px-4 prose-td:py-2 prose-td:border
                 [&>*:first-child]:mt-0
                 [&>*:last-child]:mb-0"
          >
            <h2>Hvad betyder pace?</h2>
            <p>
              Pace er et udtryk for, hvor hurtigt du løber en given distance –
              målt i minutter pr. kilometer (min/km). Det betyder, at hvis din
              pace f.eks. er 5:00 min/km, tager det dig fem minutter at løbe én
              kilometer.
            </p>
            <p>
              For mange løbere er pace et af de mest centrale begreber i
              træningen, da det giver et præcist billede af tempoet og hjælper
              med at planlægge træningspas og løb.
            </p>

            <h2>Hvordan udregner man pace?</h2>
            <p>
              At udregne pace er faktisk ret simpelt. Du tager din samlede tid
              og dividerer den med den distance, du har løbet.
            </p>
            <p>
              <strong>Formel:</strong>
            </p>
            <p>Pace (min/km) = Tid (minutter) ÷ Distance (km)</p>
            <p>
              <strong>Eksempel:</strong> Hvis du løber 10 km på 50 minutter,
              bliver din pace 50 ÷ 10 = 5:00 min/km.
            </p>
            <p>
              Men i stedet for at bruge lommeregner eller hovedregning, kan du
              bruge vores online pace beregner her på siden. Indtast blot din
              tid og distance – så viser beregneren automatisk din
              gennemsnitlige løbehastighed og pace.
            </p>

            <h2>Hvad er forskellen på pace og hastighed?</h2>
            <p>
              Selvom pace og hastighed begge beskriver, hvor hurtigt du bevæger
              dig, måles de forskelligt:
            </p>
            <ul>
              <li>
                <strong>Pace:</strong> måles i minutter pr. kilometer (min/km)
              </li>
              <li>
                <strong>Hastighed:</strong> måles i kilometer pr. time (km/t)
              </li>
            </ul>
            <p>
              Hvis du kender din hastighed, kan du omregne den til pace – og
              omvendt.
            </p>
            <p>
              Brug vores løbehastigheds beregner til at beregne din
              løbehastighed (km/t) baseret på din distance og tid. På den måde
              kan du sammenligne forskellige træningspas eller planlægge dit
              tempo til næste løb.
            </p>

            <h2>Hvorfor bruger løbere pace i stedet for km/t?</h2>
            <p>
              De fleste løbere foretrækker at bruge pace frem for km/t, fordi
              det er lettere at forholde sig til under træning og konkurrence.
            </p>
            <p>
              Når du løber, tænker du typisk: "Jeg skal holde 5:00 min/km for at
              nå mit mål" – i stedet for "Jeg skal løbe 12 km/t".
            </p>
            <p>
              Pace gør det mere intuitivt at styre tempoet undervejs, fordi det
              direkte fortæller dig, hvor lang tid hver kilometer bør tage.
            </p>

            <h2>Beregn din løbehastighed (min/km) med FysFinder's pace beregner</h2>
            <p>
              Med FysFinder's online pace beregner kan du hurtigt finde ud af,
              hvor hurtigt du løber. Indtast din distance og tid, og se:
            </p>
            <ul>
              <li>Din gennemsnitlige pace (min/km)</li>
              <li>Din hastighed (km/t)</li>
              <li>Din forventede tid på andre distancer</li>
            </ul>
            <p>
              Beregneren er perfekt til dig, der vil tracke fremskridt, planlægge
              træning eller finde det rigtige tempo til dit næste løb.
            </p>

            <h2>Pace beregner til halvmarathon og marathon</h2>
            <p>
              Skal du løbe halvmarathon (21,1 km) eller marathon (42,2 km), kan
              du bruge vores pace beregner til at planlægge dit tempo.
            </p>
            <p>
              Ved at indtaste din ønskede sluttid, kan du hurtigt se, hvilken
              pace du skal holde pr. kilometer for at nå dit mål.
            </p>
            <p>
              <strong>Eksempel:</strong>
            </p>
            <p>
              Hvis du vil løbe halvmarathon på 1 time og 45 minutter:
            </p>
            <p>105 min ÷ 21,1 km = 4:59 min/km</p>
            <p>
              Det betyder, at du skal holde cirka 5:00 min/km hele vejen for at
              nå dit mål.
            </p>

            <h2>Hvordan træner du op til at ramme en bestemt pace?</h2>
            <p>
              At ramme en bestemt pace kræver både kontrol, udholdenhed og
              erfaring. Her er nogle tips:
            </p>
            <ul>
              <li>
                <strong>Lav tempo-intervaller</strong> – Skift mellem hurtige og
                langsomme perioder.
              </li>
              <li>
                <strong>Træn med GPS-ur</strong> – Hold øje med dit tempo under
                træningen.
              </li>
              <li>
                <strong>Løb efter fornemmelse</strong> – Lær at mærke forskel på
                "komfortabelt" og "hurtigt" tempo.
              </li>
              <li>
                <strong>Test din form</strong> – Brug beregneren jævnligt for at
                følge udviklingen.
              </li>
            </ul>
            <p>
              Når du kan holde din ønskede pace stabilt over længere tid, er du
              klar til at tage det næste skridt – fx fra 10 km til halvmarathon.
            </p>

            <h2>Tempo-beregner og løbehastighed beregner – hvad kan du bruge dem til?</h2>
            <p>
              En tempo-beregner eller løbehastigheds beregner kan bruges til
              meget mere end blot at regne tal. Den hjælper dig med at:
            </p>
            <ul>
              <li>Planlægge realistiske løbemål</li>
              <li>Forbedre din udholdenhed</li>
              <li>Forebygge skader ved for hård træning</li>
              <li>Sammenligne tider på tværs af distancer</li>
            </ul>
            <p>
              Ved at kende din pace og hastighed, kan du nemmere følge en
              struktureret træningsplan og optimere dine resultater.
            </p>

            <h2>Online pace beregner – nemt og gratis</h2>
            <p>
              FysFinder's online pace beregner er gratis at bruge og kræver
              ingen login.
            </p>
            <p>
              Indtast blot distance og tid, og få med det samme vist din pace,
              hastighed og forventede sluttid.
            </p>
            <p>
              Perfekt for både begyndere og erfarne løbere, der vil få mere ud af
              deres træning.
            </p>

            <h2>Find fysioterapeuter, der hjælper dig med din løbetræning</h2>
            <p>
              Mange fysioterapeuter specialiserer sig i løberelaterede skader,
              løbestil og optimering af præstation.
            </p>
            <p>
              På FysFinder.dk kan du{" "}
              <Link href="/find/fysioterapeut/danmark" className="text-logo-blue hover:underline">
                finde fysioterapeuter i hele Danmark
              </Link>
              , som kan hjælpe dig med alt fra løbeskader og genoptræning til
              løbestilsanalyse og performance-coaching.
            </p>
          </div>
        </div>

        <RelatedToolsSection currentToolHref="/vaerktoejer/pace-beregner" />
      </div>
    </main>
  );
}

