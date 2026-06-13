import Link from "next/link";
import { STYRKEOEVELSER_PATH } from "@/lib/styrkeoevelser";

type BodyPartItem = {
  slug: string;
  title: string;
};

type BodyMapSelectorProps = {
  bodyParts: BodyPartItem[];
};

export const BodyMapSelector = ({ bodyParts }: BodyMapSelectorProps) => {
  return (
    <section
      className="my-10"
      aria-labelledby="body-map-heading"
    >
      <h2
        id="body-map-heading"
        className="text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2"
      >
        Vælg kropsdel
      </h2>
      <p className="text-gray-600 mb-6 max-w-2xl">
        Tryk på en kropsdel for at se øvelser, der er tagget med den. (Placeholder
        for visuel krop – udskiftes med illustration.)
      </p>
      <nav aria-label="Kropsdele">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {bodyParts.map((bp) => (
            <li key={bp.slug}>
              <Link
                href={`${STYRKEOEVELSER_PATH}/${bp.slug}`}
                className="flex min-h-[48px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-logo-blue hover:bg-white hover:text-logo-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-logo-blue focus-visible:ring-offset-2"
              >
                {bp.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};
