import { Metadata } from "next";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import Link from "next/link";
import { FounderCard } from "@/app/components/FounderCard";
import { AboutUsStructuredData } from "@/app/components/AboutUsStructuredData";

export const metadata: Metadata = {
  title: "Om Fysfinder.dk | Platform til at finde fysioterapeuter i Danmark",
  description:
    "Bliv klogere på FysFinder.dk. Danmarks go-to platform til at finde fysioterapeuter. Kom med bag facaden her ›",
};

export default function OmOsPage() {
  const founders = [
    {
      name: "Joachim Bograd",
      role: "Founder & Fysioterapeut",
      linkedinUrl: "https://www.linkedin.com/in/joachim-bograd-43b0a120a/",
    },
    {
      name: "Alexander Christrup",
      role: "Co-founder & marketing ekspert",
      linkedinUrl: "https://www.linkedin.com/in/alexander-christrup/",
    },
    {
      name: "David Bograd",
      role: "Co-founder & designer",
      linkedinUrl: "https://www.linkedin.com/in/davidbograd/",
    },
  ];

  const breadcrumbItems = [{ text: "Forside", link: "/" }, { text: "Om os" }];

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <AboutUsStructuredData founders={founders} />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="space-y-12 mt-8">
        <header>
          <h1 className="text-3xl font-bold mb-6">
            Hvem er FysFinder.dk? Danmarks platform til at finde fysioterapeuter
          </h1>
        </header>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <p className="mb-4">
              FysFinder er skabt som din go-to platform til at{" "}
              <Link href="/" className="text-blue-600 hover:underline">
                finde fysioterapeuter i hele Danmark
              </Link>
              . Med et overskueligt overblik samlet ét sted, gør vi det nemt at
              sammenligne fysioterapeut tilbud og klinikker, uanset hvilken
              behandlingsform du søger.
            </p>
            <p>
              FysFinder hjælper lokale klinikker med at få flere patienter. Det
              er udfordrende at drive en fysioterapeutklinik, og det gør vi
              noget ved gennem øget synlighed og flere patienthenvisninger.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Hvorfor blev FysFinder skabt?
            </h2>
            <p>
              FysFinder blev skabt på baggrund af Joachim Bograds frustration
              med de nuværende tilbud. Joachim har selv været patient, og er
              efterfølgende blev uddannet fysioterapeut. Han har derfor oplevet
              besværet ved at finde den rigtige behandler, samt frustrationen
              hos de patienter, der er på deres tredje eller fjerde behandler.
            </p>
            <p className="mt-4">
              Løsningen blev FysFinder.dk, hvor vi gør det nemt og overskueligt
              at{" "}
              <Link href="/specialer" className="text-blue-600 hover:underline">
                finde fysioterapeuter med specialer
              </Link>{" "}
              tæt på dig. Du kan sammenligne kvalificerede behandlere - helt
              gratis.
            </p>
            <p className="mt-4">
              Platformen er blevet mødt af stor støtte. Patienter, klinikejere,
              fysioterapeuter og foreninger har alle taget godt imod FysFinder,
              hvilket giver os endnu større motivation for at gøre platformen så
              god som muligt.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-8">
              Personerne bag FysFinder
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FounderCard
                name="Joachim Bograd"
                role="Founder & Fysioterapeut"
                imageUrl="/images/om-os/joachimbograd-fysfinder.png"
                alt="Joachim Bograd FysFinder"
                linkedinUrl="https://www.linkedin.com/in/joachim-bograd-43b0a120a/"
              />

              <FounderCard
                name="Alexander Christrup"
                role="Co-founder & marketing ekspert"
                imageUrl="/images/om-os/alexanderchristrup-fysfinder.jpeg"
                alt="Alexander Christrup FysFinder"
                linkedinUrl="https://www.linkedin.com/in/alexander-christrup/"
              />

              <FounderCard
                name="David Bograd"
                role="Co-founder & designer"
                imageUrl="/images/om-os/davidbograd-fysfinder.jpeg"
                alt="David Bograd FysFinder"
                linkedinUrl="https://www.linkedin.com/in/davidbograd/"
              />
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-8">Vores værdier</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Vision</h3>
                <p className="text-gray-600">
                  Skab værdi for både patienter og fysioterapeutklinikker, ved
                  at gøre sundhedsydelser mere tilgængelige, gennemsigtige og
                  effektive.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Mission</h3>
                <p className="text-gray-600">
                  Forbind mennesker med den rette fysioterapeut til deres
                  specifikke behov, og understøt lokale klinikker ved at øge
                  deres synlighed og patientflow.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Mål</h3>
                <p className="text-gray-600">
                  Hjælp mennesker med at finde den rette fysioterapeut til deres
                  specifikke behov. Støt lokale klinikker ved at skabe flere
                  patienthenvisninger, og styrke deres forretning.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              FN&apos;s verdensmål
            </h2>
            <p>
              Vi arbejder i tråd med{" "}
              <a
                href="https://www.verdensmaalene.dk/maal/3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                FN&apos;s verdensmål #3 for sundhed og trivsel
              </a>
              . FysFinder bidrager ved at fremme adgangen til sundhedsydelser
              for patienter og støtte lokale klinikker i at styrke deres
              praksis.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
