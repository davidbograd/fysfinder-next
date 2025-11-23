import { Metadata } from "next";
import Link from "next/link";
import { RmBeregner } from "./components/RmBeregner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import WebAppStructuredData from "@/components/seo/VaerktoejerStructuredData";
import RelatedToolsSection from "@/components/features/RelatedToolsSection";
import { TableOfContents } from "@/components/features/blog-og-ordbog/TableOfContents";
import { slugify } from "@/app/utils/slugify";

export const metadata: Metadata = {
  title: "RM beregner → Indtast løft og beregn nemt din 1RM ✅",
  description:
    "FysFinder&apos;s online RM beregner gør det nemt at beregne din 1RM (one-repetion maximum). Tast dine løft og få dine 1-10 repetition max. Beregn din RM →",
  openGraph: {
    title: "RM beregner → Indtast løft og beregn nemt din 1RM ✅",
    description:
      "FysFinder&apos;s online RM beregner gør det nemt at beregne din 1RM (one-repetion maximum). Tast dine løft og få dine 1-10 repetition max. Beregn din RM →",
    images: [
      {
        url: "/images/vaerktoejer/1rm-beregner.jpg",
        width: 1200,
        height: 630,
        alt: "RM beregner illustration med vægtstang og løfter",
      },
    ],
    type: "website",
  },
};

export default async function RmBeregnerPage() {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "RM beregner" },
  ];

  // Extract headings from the content
  const headings = [
    { text: "Online RM beregner: Beregn nemt din 1RM", id: slugify("Online RM beregner: Beregn nemt din 1RM") },
    { text: "Hvad betyder 1RM?", id: slugify("Hvad betyder 1RM?") },
    { text: "Oversigt: Typiske procentzoner af 1RM", id: slugify("Oversigt: Typiske procentzoner af 1RM") },
    { text: "Hvordan finder jeg min 1RM?", id: slugify("Hvordan finder jeg min 1RM?") },
    { text: "Hvordan kan jeg udregne min RM?", id: slugify("Hvordan kan jeg udregne min RM?") },
    { text: "Eksempel på beregning af 1RM", id: slugify("Eksempel på beregning af 1RM") },
    { text: "Sådan bruger du FysFinders RM beregner", id: slugify("Sådan bruger du FysFinders RM beregner") },
    { text: "Indtast dine løft og beregn din RM", id: slugify("Indtast dine løft og beregn din RM") },
    { text: "Hvordan kan jeg forøge min RM? Tips og tricks", id: slugify("Hvordan kan jeg forøge min RM? Tips og tricks") },
    { text: "Hvordan træner du op til at ramme en bestemt RM?", id: slugify("Hvordan træner du op til at ramme en bestemt RM?") },
    { text: "Hvilke øvelser kan du beregne RM for?", id: slugify("Hvilke øvelser kan du beregne RM for?") },
    { text: "Liste over populære RM-øvelser", id: slugify("Liste over populære RM-øvelser") },
    { text: "Find fysioterapeuter, der hjælper dig med styrketræning og skadesforebyggelse", id: slugify("Find fysioterapeuter, der hjælper dig med styrketræning og skadesforebyggelse") },
    { text: "Ofte stillede spørgsmål om 1RM og styrketræning", id: slugify("Ofte stillede spørgsmål om 1RM og styrketræning") },
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <TableOfContents headings={headings} />
        <div className="flex-1 max-w-3xl">
          <WebAppStructuredData
            type="tool"
            name="RM beregner"
            description="Beregn din 1RM (one repetition maximum) og se anbefalet vægt til 1–10 repetitionsmaksimum"
            breadcrumbs={breadcrumbItems}
            toolType="calculator"
            calculatorType="rm"
          />
          <div className="space-y-6 sm:space-y-8">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold">
                RM beregner – Indtast dine løft og beregn nemt din 1RM
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Med FysFinder&apos;s online RM beregner kan du nemt og hurtigt beregne din 1RM (one-repetition maximum). Tast dine løft ind i beregneren og få dine 1–10 repetition max udregnet. Kom i gang her.
              </p>
            </div>

            <div className="pb-8">
              <RmBeregner />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-700">
                <em>
                  🏋️‍♂️ <strong>Styrketip:</strong> Brug din beregnede 1RM som et pejlemærke for din træning – men husk, at teknik, dagsform og restitution spiller en stor rolle. Løft altid med kontrol, og øg belastningen gradvist for at undgå skader.
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
                <h2 id={slugify("Online RM beregner: Beregn nemt din 1RM")}>Online RM beregner: Beregn nemt din 1RM</h2>
                <p>
                  Vores RM beregner hjælper dig med hurtigt at omregne dine nuværende træningsresultater til et estimeret <strong>one repetition maximum</strong> (1 rep max). Uanset om du er ny i styrketræning eller en erfaren atlet, giver værktøjet dig et præcist overblik over, hvor stærk du er – og hvor du kan forbedre dig.
                </p>

                <h2 id={slugify("Hvad betyder 1RM?")}>Hvad betyder 1RM?</h2>
                <p>
                  1RM står for <strong>&quot;one-rep max&quot;</strong> eller på dansk <strong>repetitionsmaksimum</strong>. Det er den maksimale vægt, du kan løfte én enkelt gang med korrekt teknik.
                </p>
                <p>
                  Mange træningsprogrammer bruger 1RM til at bestemme intensitet og belastning, fx 70%, 80% eller 90% af 1RM til bestemte træningsmål.
                </p>

                <h3 id={slugify("Oversigt: Typiske procentzoner af 1RM")}>Oversigt: Typiske procentzoner af 1RM</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Procent af 1RM</th>
                      <th>Reps (ca.)</th>
                      <th>Træningsmål</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>50–60%</td>
                      <td>12–20 reps</td>
                      <td>Udholdenhed, tekniktræning</td>
                    </tr>
                    <tr>
                      <td>60–70%</td>
                      <td>8–12 reps</td>
                      <td>Muskelopbygning (hypertrofi)</td>
                    </tr>
                    <tr>
                      <td>70–85%</td>
                      <td>4–8 reps</td>
                      <td>Styrke og muskelopbygning</td>
                    </tr>
                    <tr>
                      <td>85–95%</td>
                      <td>1–4 reps</td>
                      <td>Maksimal styrke</td>
                    </tr>
                    <tr>
                      <td>95–100%</td>
                      <td>1 rep</td>
                      <td>Test af 1RM</td>
                    </tr>
                  </tbody>
                </table>

                <h2 id={slugify("Hvordan finder jeg min 1RM?")}>Hvordan finder jeg min 1RM?</h2>
                <p>
                  Du kan finde din 1RM på to måder:
                </p>
                <ol>
                  <li><strong>Direkte test</strong> – du løfter tungere og tungere vægt, indtil du kun kan lave én rep med god teknik.</li>
                  <li><strong>Indirekte beregning</strong> – du bruger en RM beregner ved at indtaste en vægt og antal gentagelser.</li>
                </ol>
                <p>
                  Den indirekte metode er langt mere sikker for begyndere og giver et realistisk estimat uden unødig risiko for overbelastning.
                </p>

                <h2 id={slugify("Hvordan kan jeg udregne min RM?")}>Hvordan kan jeg udregne min RM?</h2>
                <p>
                  Det gøres nemt med vores værktøj:
                </p>
                <ul>
                  <li>Indtast den vægt, du løfter</li>
                  <li>Vælg antallet af gentagelser</li>
                  <li>Beregneren viser automatisk din estimerede 1RM og de efterfølgende 2–10 RM værdier</li>
                </ul>

                <h3 id={slugify("Eksempel på beregning af 1RM")}>Eksempel på beregning af 1RM</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Vægt (kg)</th>
                      <th>Reps</th>
                      <th>Estimeret 1RM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>80 kg</td>
                      <td>5 reps</td>
                      <td>ca. 93 kg</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  I dette eksempel svarer det ca. til:
                </p>
                <ul>
                  <li><strong>5RM</strong>: omkring 80 kg</li>
                  <li><strong>10RM</strong>: omkring 62–65 kg</li>
                </ul>
                <p>
                  Tallene er estimerede og kan variere lidt fra person til person, men de giver et stærkt udgangspunkt til at planlægge din træning.
                </p>

                <h2 id={slugify("Sådan bruger du FysFinders RM beregner")}>Sådan bruger du FysFinders RM beregner</h2>
                <p>
                  Følg disse trin for at få de mest præcise resultater:
                </p>
                <ol>
                  <li>Vælg den øvelse, du vil beregne RM for (fx squat, bænkpres, dødløft).</li>
                  <li>Indtast den vægt (kg), du har løftet.</li>
                  <li>Indtast hvor mange gentagelser du kunne lave med god form.</li>
                  <li>Klik &quot;Beregn&quot;, og se dine 1–10 RM værdier.</li>
                </ol>
                <p>
                  Beregneren fungerer med alle klassiske styrketræningsøvelser og kan bruges både i fitnesscenter og hjemmetræning.
                </p>

                <h2 id={slugify("Indtast dine løft og beregn din RM")}>Indtast dine løft og beregn din RM</h2>
                <p>
                  Ved at indtaste dit seneste løft kan du hurtigt få en præcis oversigt over dine styrkeniveauer. Det gør det lettere at:
                </p>
                <ul>
                  <li>Planlægge dit træningsprogram</li>
                  <li>Bestemme korrekt vægt til forskellige sæt</li>
                  <li>Undgå skader ved at løfte for tungt</li>
                  <li>Følge din styrkeudvikling over tid</li>
                </ul>
                <p>
                  Gem gerne dine resultater, så du kan sammenligne din 1RM over uger og måneder.
                </p>

                <h2 id={slugify("Hvordan kan jeg forøge min RM? Tips og tricks")}>Hvordan kan jeg forøge min RM? Tips og tricks</h2>
                <p>
                  Hvis du vil øge din <strong>one rep max</strong>, er der flere dokumenterede metoder, du kan følge.
                </p>

                <h3>1. Arbejd med progressiv overload</h3>
                <p>
                  Øg gradvist:
                </p>
                <ul>
                  <li>Vægt</li>
                  <li>Antal gentagelser</li>
                  <li>Antal sæt</li>
                  <li>Tempo (fx langsommere excentrisk fase)</li>
                </ul>
                <p>
                  Små, kontrollerede stigninger er mere effektive og sikrere end store hop i belastning.
                </p>

                <h3>2. Træn i styrkezonen (85–95% af 1RM)</h3>
                <p>
                  Træning med relativt tung vægt og få gentagelser (1–5 reps) er særligt effektivt til at opbygge maksimal styrke. Sørg for:
                </p>
                <ul>
                  <li>Lange pauser mellem sættene (2–4 minutter)</li>
                  <li>Fokus på teknik og spænding i kroppen</li>
                  <li>At have en spotter ved tunge løft som bænkpres og squat</li>
                </ul>

                <h3>3. Brug tekniske løftesessioner</h3>
                <p>
                  Teknik, stabilitet og mobilitet er nøglefaktorer for en høj RM – især i basisøvelser som squat, bænkpres og dødløft. Overvej:
                </p>
                <ul>
                  <li>Teknikdage med lavere vægt (50–70% af 1RM)</li>
                  <li>Fokus på dybde, position og kontrol</li>
                  <li>Eventuelt vejledning fra en personlig træner eller fysioterapeut</li>
                </ul>

                <h3>4. Prioritér restitution</h3>
                <p>
                  Søvn, kost og pauser mellem tunge træningsdage har stor betydning for din 1RM.
                </p>
                <ul>
                  <li>Sov 7–9 timer pr. nat</li>
                  <li>Spis nok protein og kalorier i forhold til dit mål</li>
                  <li>Planlæg hviledage og deload-uger</li>
                </ul>

                <h3>5. Variér tempo og greb</h3>
                <p>
                  Små ændringer kan give nye stimuli:
                </p>
                <ul>
                  <li>Pause-reps (fx 1–2 sek. pause i bunden af squat)</li>
                  <li>Tempo-reps (langsom excentrisk fase)</li>
                  <li>Varierende grebsbredde i bænkpres eller dødløft</li>
                </ul>

                <h2 id={slugify("Hvordan træner du op til at ramme en bestemt RM?")}>Hvordan træner du op til at ramme en bestemt RM?</h2>
                <p>
                  Hvis du har et konkret mål, fx at ramme 150 kg i dødløft som din nye 1RM, er det en fordel at arbejde struktureret over flere uger.
                </p>

                <h3>Eksempel: 4–6 ugers 1RM-optrapning</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Uge</th>
                      <th>Fokus</th>
                      <th>Intensitet</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Volumen &amp; teknik</td>
                      <td>60–70% af 1RM</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Moderat belastning</td>
                      <td>70–80%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Tung træning</td>
                      <td>80–90%</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Peak-uge</td>
                      <td>90–95%</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>Deload</td>
                      <td>50–60%</td>
                    </tr>
                    <tr>
                      <td>6</td>
                      <td>Test-uge</td>
                      <td>Opvarmning + 1RM test</td>
                    </tr>
                  </tbody>
                </table>
                <p>
                  I testugen bruger du din nuværende beregnede 1RM som reference – og ser, om du kan slå den.
                </p>

                <h2 id={slugify("Hvilke øvelser kan du beregne RM for?")}>Hvilke øvelser kan du beregne RM for?</h2>
                <p>
                  Du kan bruge RM beregneren til stort set alle styrketræningsøvelser, blandt andet:
                </p>
                <ul>
                  <li>Squat</li>
                  <li>Bænkpres</li>
                  <li>Dødløft</li>
                  <li>Overhead press / military press</li>
                  <li>Bent-over row</li>
                  <li>Hip thrust</li>
                  <li>Pull-ups eller chin-ups med ekstra vægt</li>
                </ul>

                <h3 id={slugify("Liste over populære RM-øvelser")}>Liste over populære RM-øvelser</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Øvelse</th>
                      <th>Styrkefokus</th>
                      <th>Kan beregnes?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Squat</td>
                      <td>Benstyrke &amp; core</td>
                      <td>✔</td>
                    </tr>
                    <tr>
                      <td>Bænkpres</td>
                      <td>Bryst &amp; triceps</td>
                      <td>✔</td>
                    </tr>
                    <tr>
                      <td>Dødløft</td>
                      <td>Hele bagkæden</td>
                      <td>✔</td>
                    </tr>
                    <tr>
                      <td>Overhead press</td>
                      <td>Skuldre &amp; core</td>
                      <td>✔</td>
                    </tr>
                    <tr>
                      <td>Pull-ups (med vægt)</td>
                      <td>Ryg &amp; biceps</td>
                      <td>✔</td>
                    </tr>
                  </tbody>
                </table>

                <h2 id={slugify("Find fysioterapeuter, der hjælper dig med styrketræning og skadesforebyggelse")}>Find fysioterapeuter, der hjælper dig med styrketræning og skadesforebyggelse</h2>
                <p>
                  Mange fysioterapeuter arbejder målrettet med styrketræning, løfteteknik og forebyggelse af overbelastningsskader.
                </p>
                <p>
                  På FysFinder.dk kan du{" "}
                  <Link href="/find/fysioterapeut/danmark" className="text-logo-blue hover:underline">
                    finde fysioterapeuter i hele Danmark
                  </Link>
                  , som kan hjælpe dig med alt fra smerter relateret til tunge løft, forbedring af din teknik i fx squat, dødløft og bænkpres, til genoptræning og optimering af din styrkepræstation.
                </p>

                <h2 id={slugify("Ofte stillede spørgsmål om 1RM og styrketræning")}>Ofte stillede spørgsmål om 1RM og styrketræning</h2>

                <h3>Hvorfor er det en fordel at kende sin 1RM?</h3>
                <p>
                  At kende sin 1RM gør det nemmere at planlægge træning, vælge passende belastning og undgå både under- og overtræning. Det giver dig et objektivt udgangspunkt, så du kan strukturere progression og måle forbedringer over tid.
                </p>

                <h3>Hvor ofte bør jeg opdatere min 1RM i træningen?</h3>
                <p>
                  For de fleste er det passende at opdatere sin 1RM hver 6.–10. uge. Hvis du er ny i styrketræning, kan du opleve hurtigere fremgang og derfor justere lidt oftere. Brug FysFinders RM beregner, når du vil opdatere dit estimat.
                </p>

                <h3>Er min 1RM den samme i alle øvelser?</h3>
                <p>
                  Nej. Din 1RM afhænger af øvelsens kompleksitet, muskelgruppernes størrelse og din teknik i øvelsen. Mange har fx en højere 1RM i dødløft end i squat eller bænkpres. Brug FysFinders RM beregner til at beregne 1RM for hver enkelt øvelse.
                </p>

                <h3>Skal jeg vælge specifikke øvelser, hvis jeg vil forbedre min 1RM?</h3>
                <p>
                  Ja. Hvis dit mål er at forbedre en bestemt 1RM, hjælper det at træne øvelsen direkte og supplere med assistanceøvelser, der styrker svage punkter – fx sætmønstre, tempoøvelser og stabilitetsarbejde.
                </p>

                <h3>Kan man bruge 1RM som del af genoptræning eller efter en skade?</h3>
                <p>
                  I starten af en genoptræningsperiode bruges 1RM sjældent, fordi styrken ofte varierer fra uge til uge. Men når du er længere i forløbet, kan du bruge en justeret 1RM til at styre belastning og progression. Her kan en fysioterapeut hjælpe med sikre retningslinjer.
                </p>

                <h3>Hvor præcis er en beregnet 1RM sammenlignet med en testet 1RM?</h3>
                <p>
                  En beregnet 1RM ligger typisk meget tæt på den reelle værdi, især hvis du bruger et moderat antal gentagelser (3–8 reps). Variation kan dog opstå pga. teknik, dagsform, søvn og erfaring. FysFinders RM beregner giver et stabilt estimat, du trygt kan planlægge efter.
                </p>

                <h3>Kan jeg bruge RM beregning, hvis jeg træner med håndvægte?</h3>
                <p>
                  Ja. RM-beregning fungerer også ved håndvægte, kettlebells eller andre former for modstand. Du skal blot kende den samlede vægt du løfter – og så kan du bruge FysFinders RM beregner på samme måde som med stang.
                </p>

                <h3>Er 1RM kun relevant for styrkeløftere?</h3>
                <p>
                  Nej. Alle der styrketræner kan have gavn af at kende deres 1RM, uanset om målet er muskelopbygning, vægttab, sportspræstation, genoptræning eller skadesforebyggelse. Det giver bedre træningskontrol og et tydeligt mål for udvikling.
                </p>

                <h3>Kan jeg beregne min 1RM uden at løfte tungt?</h3>
                <p>
                  Ja. Det er netop fordelen ved en RM beregner. Du kan bruge en vægt, du kan løfte flere gange (fx 5–10 reps), og lade FysFinders RM beregner omregne det til et sikkert 1RM-estimat.
                </p>

                <h3>Hvordan ved jeg om min teknik er god nok til at lave realistiske RM-beregninger?</h3>
                <p>
                  Hvis du føler, at du mister kontrol i slutningen af sættet, eller hvis tempo og teknik ændrer sig markant, kan det påvirke RM-resultatet. Overvej at få en fysioterapeut eller træner til at se din teknik – især i tunge basisøvelser som squat, dødløft og bænkpres.
                </p>
              </div>
            </div>

            <RelatedToolsSection currentToolHref="/vaerktoejer/rm-beregner" />
          </div>
        </div>
      </div>
    </main>
  );
}

