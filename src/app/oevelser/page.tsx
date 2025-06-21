/**
 * Updated: Exercise overview page now using dynamic content from markdown files
 * This page serves as an index to various exercise pages, showing different types of exercises
 * and providing comprehensive information about training and exercise techniques.
 */

import { getAllExercises } from "@/lib/exercises";
import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "50+ træningsøvelser | Se gode eksempler på styrkeøvelser",
  description:
    "Bliv klogere på effektiv træning af kroppen og find trin-for-trin eksempler på træningsøvelser til styrke af forskellige kropsdele. Udforsk mere end 100 forskellige styrketræningsøvelser.",
};

export default function ExercisesPage() {
  const exercises = getAllExercises();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Træningsøvelser – Find styrkeøvelser til træning af kroppen
        </h1>

        <p className="mb-8">
          Velkommen til FysFinders oversigt med træningsøvelser. Bliv klogere på
          effektiv træning af kroppen og find trin-for-trin eksempler på
          træningsøvelser til styrke af forskellige kropsdele. Udforsk mere end
          100 forskellige styrketræningsøvelser til arme, bryst, lænd, skulder,
          hofte og meget mere.
        </p>

        {/* Exercise Categories Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {exercises.map((exercise) => (
            <Link
              key={exercise.slug}
              href={`/oevelser/${exercise.slug}`}
              className="flex items-center p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Dumbbell className="w-8 h-8 mr-4" />
              <div>
                <h2 className="text-xl font-semibold">{exercise.title}</h2>
                <p className="text-gray-600">Se øvelser og vejledning</p>
              </div>
            </Link>
          ))}
        </div>

        {/* SEO Content */}
        <div className="prose max-w-none">
          <h2>Træningsøvelser til at styrke kroppen og holde dig i gang</h2>
          <p>
            De træningsøvelser du finder på FysFinder, er designet til at
            forbedre din krops styrke, mobilitet, balance og kondition. Uanset
            om du træner for at forebygge skader, rehabilitere en skade eller
            forbedre din generelle sundhed, kan vores styrkeøvelser være med til
            at gøre en forskel.
          </p>
          <p>
            Opbygger du en regelmæssig træningsrutine kan du øge din
            muskelstyrke, forbedre dine fleksibilitet og mindske risikoen for at
            du får skader.
          </p>

          <h2>
            Sådan laver du styrkeøvelser korrekt og opnår bedre resultater
          </h2>
          <p>
            Når du laver styrkeøvelser, er der et par simple retningslinjer, du
            kan følge. Udfører du træningsøvelserne korrekt, vil du også se, at
            du hurtigere opnår dine ønskede resultater og undgå skader. Her kan
            du finde en guide til at udføre styrkeøvelser korrekt:
          </p>

          <h3>1. Opvarm dine muskler</h3>
          <p>
            Start altid med 5-10 minutters opvarmning inden din styrketræning
            begynder, så du varmer musklerne op og forbereder dem på belastning.
          </p>

          <h3>2. Lav øvelserne langsomt og kontrolleret</h3>
          <p>
            Når du styrketræner, skal du sørge for, at du udfører
            træningsøvelserne langsomt og kontrolleret. Det gør din træning af
            musklerne mest effektiv, så du opnår bedre og hurtigere resultater.
          </p>

          <h3>3. Brug den rigtige teknik</h3>
          <p>
            Sørg for at du bruger den rigtige teknik til styrkeøvelserne, så du
            aktivere de ønskede muskler og muskelgrupper. Forkert teknik kan
            forværre effekten af træningen og i værste tilfælde føre til
            træningsskader.
          </p>

          <h3>4. Opbyg mere styrke – Øg belastningen gradvist</h3>
          <p>
            For at forbedre styrken i dine muskler, kan du gradvist øge
            belastning eller intensitet, når du styrketræner. Du kan forsøge at
            tage mere vægt på, og hvis det føles for tungt, gå tilbage til dit
            udgangspunkt.
          </p>

          <h3>5. Nedkøling og udstræk efter træning</h3>
          <p>
            Efter din træning er det en god idé at afslutte med et hurtigt
            udstrækningsprogram, der kan udstrække dine muskelgrupper. Det
            hjælper dig med at øge fleksibilitet, mindsker muskelspændinger og
            reducerer risiko for skader.
          </p>

          <h2>Få et skræddersyet træningsprogram eller genoptræningsprogram</h2>
          <p>
            På FysFinder kan du gratis finde fysioterapeuter i hele Danmark, der
            kan hjælpe dig med at lave et skræddersyet træningsprogram eller
            genoptræningsprogram. Med et træningsprogram tilpasset til dig, er
            du sikker på, at du får de mest effektive træningsøvelser til at
            opnå dine mål.
          </p>

          <h2>Ofte stillede spørgsmål om træning</h2>

          <h3>Hvor ofte skal man styrketræne?</h3>
          <p>
            Generelt anbefales det, at du styrketræner hver af dine
            muskelgrupper 2-3 gange om ugen. Sørg altid for at inkludere
            hviledage i dit træningsprogram, så du får optimal restitution og
            muskelopbygning.
          </p>

          <h2>Hvad er fordelene ved styrketræning?</h2>
          <p>Styrketræning kan medføre en række sundhedsmæssige fordele:</p>
          <ul>
            <li>Øget muskelstyrke og udholdenhed.</li>
            <li>Forbedret knoglestyrke og ledsundhed.</li>
            <li>Bedre kropsholdning og balance.</li>
            <li>Reduceret risiko for skader.</li>
            <li>Forbedret metabolisme og vægtkontrol.</li>
          </ul>

          <h3>Hvilke styrkeøvelser er bedst til genoptræning?</h3>
          <p>
            Genoptræningsøvelser varierer afhængigt af skadens type og omfang.
            Øvelser som squats, lunges og rows kan dog ofte tilpasses til
            genoptræning. Vi anbefaler, at du konsulterer en fysioterapeut med
            speciale i genoptræning for at få en skræddersyet plan, der passer
            til dig og dine mål.
          </p>

          <h3>Er styrketræning godt for ældre?</h3>
          <p>
            Ja! Styrketræning er altid godt. Også for ældre. Styrketræning for
            ældre kan forbedre knoglestyrken, balancen og reducere risikoen for
            fald.
          </p>

          <h3>Skal man bruge udstyr til styrkeøvelser?</h3>
          <p>
            Ja og nej. Der findes mange styrkeøvelser, hvor du ikke behøver
            træningsudstyr. Mange styrkeøvelser er effektive uden udstyr.
            Træningsvægte, elastikker og maskiner kan hjælpe med at øge
            belastningen og intensiteten ved hårdere træning. Her på FysFinder
            kan du finde styrkeøvelser med og uden udstyr og maskiner.
          </p>
        </div>
      </div>
    </div>
  );
}
