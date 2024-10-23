import { GlossaryList } from "@/components/GlossaryList";
import { getGlossaryTerms } from "@/lib/glossary";

export const metadata = {
  title: "Fysioterapeut Artikler",
  description:
    "En omfattende samling af fysioterapeutiske artikler og begreber",
};

export default async function ArticlesPage() {
  const terms = await getGlossaryTerms();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Fysioterapeut Artikler</h1>
        <p className="mb-8">
          Udforsk og forstå de mest populære og aktuelle fysioterapeutiske emner
          med vores komplette A-Å liste af artikler.
        </p>
        <GlossaryList terms={terms} />
      </div>
    </div>
  );
}
