import React from "react";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/server";
import ClinicCard from "../components/ClinicCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { deslugify, slugify } from "../utils/slugify";
import { Metadata } from "next";
import { SuburbStructuredData } from "@/app/components/SuburbStructuredData";
import { Clinic, SeoSection } from "@/app/types";

async function fetchClinicsBySuburb(suburbSlug: string): Promise<Clinic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("lokationSlug", suburbSlug);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch clinics: ${error.message}`);
  }

  return data as Clinic[];
}

async function getClinicCount(suburbSlug: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("clinics")
    .select("*", { count: "exact", head: true })
    .eq("lokationSlug", suburbSlug);

  if (error) {
    console.error("Error fetching clinic count:", error);
    return 0;
  }

  return count || 0;
}

export async function generateMetadata({
  params,
}: {
  params: { suburb: string };
}): Promise<Metadata> {
  const clinics = await fetchClinicsBySuburb(params.suburb);
  const suburbName =
    clinics.length > 0 ? clinics[0].lokation : deslugify(params.suburb);
  const clinicCount = clinics.length;

  const fullTitle = `Fysioterapi ${suburbName} | Find ${suburbName} fysioterapeuter`;

  const shortTitle = `Fysioterapi ${suburbName} | Find fysioterapeuter`;

  const title = fullTitle.length > 60 ? shortTitle : fullTitle;

  return {
    title,
    description: `Find og sammenlign ${suburbName} fysioterapeuter. Se anbefalinger, fysioterapi specialer, priser, åbningstider og mere. Start her →`,
  };
}

export default async function SuburbPage({
  params,
}: {
  params: { suburb: string };
}) {
  const seoContent: SeoSection[] = [
    {
      headline: "Oplev Fysioterapi på Amager: Sundhed og Velvære i Fokus",
      paragraph:
        "Amager er en unik del af København, hvor moderne byliv møder naturskønne omgivelser. Med sine forskellige kvarterer og rekreative områder har øen meget at byde på, hvilket gør den til en ideel destination for dem, der søger sundheds- og velværetilbud. Uanset om du bor i det livlige Amagerbro, det naturskønne Amager Strandpark eller det moderne Ørestad, findes der mange muligheder for at opnå fysisk og mental sundhed. Her på FysFinder hjælper vi dig med at finde den perfekte fysioterapeut på Amager, der kan hjælpe dig med at leve et sundere og mere aktivt liv.",
    },
    {
      headline: "Amager: Et Område Fyldt med Muligheder for Aktiv Sundhed",
      paragraph:
        "Amager er kendt for sit varierede landskab, der giver mulighed for mange forskellige former for træning og aktiviteter. Den imponerende Amager Strandpark er et populært sted for både motionister og naturelskere, der ønsker at løbe, cykle, dyrke yoga eller bare tage en frisk gåtur langs vandet. Herudover byder øens grønne områder, såsom Kalvebod Fælled, på fantastiske rammer for udendørs træning, der kan supplere din fysioterapeutiske behandling. Uanset om du ønsker at rehabilitere en skade eller styrke din krop, kan du finde fysioterapiklinikker på Amager, der tilbyder både klassiske og specialiserede behandlingsmetoder. Mange klinikker drager fordel af Amagers rige udbud af faciliteter for at tilbyde deres patienter en holistisk tilgang til sundhed og fysisk aktivitet.",
    },
    {
      headline:
        "Fysioterapi på Amager: Moderne Behandlinger og Traditionelle Metoder",
      paragraph:
        "Fysioterapeuter på Amager er kendt for at anvende en kombination af traditionelle metoder og moderne teknologier. Det kan være alt fra manuel terapi, genoptræning og massage til mere avancerede behandlingsformer som shockwave-terapi og træning med EMS (elektronisk muskelstimulering). Der er stor fokus på skræddersyede behandlingsplaner, så hver enkelt patient kan få den bedste behandling tilpasset sine behov. Hos mange klinikker vil du også finde specialiserede tilbud, såsom fysioterapi for gravide, sportsfysioterapi eller behandling af kroniske smerter. Disse services tager højde for, at hver patient er unik, og at behandlingerne skal tilpasses livsstil og helbredstilstand. En fysioterapeut på Amager vil ofte begynde med en grundig vurdering af din krops bevægelighed og muskelbalance for at udforme en optimal trænings- og behandlingsplan.",
    },
    {
      headline: "Sådan Finder du den Rette Fysioterapeut på Amager",
      paragraph:
        "Når det kommer til at finde den rette fysioterapeut på Amager, er det vigtigt at tage hensyn til flere faktorer. Forskellige klinikker har forskellige specialer, så overvej, hvilken type behandling du har brug for. Nogle klinikker er særligt kendt for deres sportsfysioterapi og samarbejder med lokale sportsklubber og atleter, mens andre fokuserer på genoptræning efter operationer eller smertelindrende behandlinger for kroniske lidelser. En anden vigtig faktor er, hvordan behandlingen integreres i dit daglige liv. Hvis du bor tæt på Amager Strandpark, kan du vælge en fysioterapeut, der tilbyder udendørs træning, eller hvis du arbejder i Ørestad, kan en klinik tæt på metroen gøre det lettere at passe behandlinger ind i en travl hverdag.",
    },
    {
      headline: "Amagers Sundhedskultur: En Aktiv og Balanceret Livsstil",
      paragraph:
        "Amager har en stærk sundhedskultur, hvor mange af de lokale beboere er aktive og går op i at leve sundt. Det afspejles også i det brede udvalg af fitnesscentre, yogastudier og løberuter, der findes over hele øen. Med flere fysioterapiklinikker, der tilbyder gruppeforløb og fællestræning, er der rig mulighed for at kombinere fysioterapi med social aktivitet og fællesskab.",
    },
    {
      headline: "Fordelene ved Lokal Fysioterapi på Amager",
      paragraph:
        "At vælge en lokal fysioterapeut har mange fordele. For det første får du en bedre forståelse af de aktiviteter og muligheder, der er specifikke for Amager. Fysioterapeuter i området har et dybt kendskab til de bedste steder for genoptræning og fysisk aktivitet, hvad enten det drejer sig om løb langs strandparken eller styrketræning i et af områdets mange fitnesscentre. Denne indsigt kan være afgørende for at opnå de bedste resultater i din behandling. For det andet har mange klinikker et netværk af lokale sundhedsspecialister, såsom kiropraktorer, diætister og personlige trænere, der kan hjælpe med at skabe en helhedsorienteret tilgang til din sundhed. Det betyder, at din behandling kan koordineres, så du opnår langvarige forbedringer og hurtigere heling.",
    },
  ];
  try {
    const clinics = await fetchClinicsBySuburb(params.suburb);
    const suburbName =
      clinics.length > 0 ? clinics[0].lokation : deslugify(params.suburb);

    const breadcrumbItems = [
      { text: "Forside", link: "/" },
      { text: suburbName },
    ];

    return (
      <div className="container mx-auto px-4">
        {clinics.length > 0 && (
          <SuburbStructuredData clinics={clinics} suburbName={suburbName} />
        )}
        <Breadcrumbs items={breadcrumbItems} />
        {clinics.length === 0 ? (
          <div className="text-center py-10">
            <h1 className="text-3xl font-bold mb-4">Ingen klinikker fundet</h1>
            <p className="text-xl">
              Der er desværre ingen klinikker registreret i {suburbName}.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Gå tilbage til forsiden
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">
              Bedste fysioterapeuter i {suburbName}
            </h1>

            <p className="text-gray-600 mb-8 max-w-[800px]">
              Fysfinder hjælper dig med at finde den bedste fysioterapeut i{" "}
              {suburbName}. Se anmeldelser, specialer, priser og find den
              perfekte fysioterapeut.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {clinics.length} fysioterapi klinikker fundet
            </p>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {clinics.map((clinic) => (
                <Link
                  key={clinic.clinics_id}
                  href={`/${params.suburb}/${slugify(clinic.klinikNavn)}`}
                >
                  <ClinicCard
                    klinikNavn={clinic.klinikNavn}
                    ydernummer={clinic.ydernummer}
                    avgRating={clinic.avgRating}
                    ratingCount={clinic.ratingCount}
                    adresse={clinic.adresse}
                    postnummer={clinic.postnummer}
                    lokation={clinic.lokation}
                  />
                </Link>
              ))}
            </div>

            {params.suburb === "amager" && (
              <>
                <div className="h-px bg-gray-200 my-16 max-w-[672px]" />
                <section className="max-w-[672px]">
                  {seoContent.map((section, index) => (
                    <div key={index} className="mb-12">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {section.headline}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {section.paragraph}
                      </p>
                    </div>
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return (
      <div className="text-red-500 font-bold text-center py-10">
        Error loading clinics: {(error as Error).message}
      </div>
    );
  }
}
