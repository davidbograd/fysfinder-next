import Image from "next/image";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { STYRKEOEVELSER_PATH, getBodyPartTitleBySlug } from "@/lib/styrkeoevelser";
import { getBodyPartTagStyles } from "@/lib/styrkeoevelser-body-part-tag-styles";

export type ExerciseGridCardData = {
  slug: string;
  title: string;
  description: string;
  bodyParts: string[];
  previewImage?: string;
  previewImageAlt?: string;
  equipment?: string;
};

type ExerciseGridCardProps = {
  exercise: ExerciseGridCardData;
  /** On kropsdel pages, emphasize the current body-part tag. */
  highlightBodyPartSlug?: string;
};

export const ExerciseGridCard = ({
  exercise,
  highlightBodyPartSlug,
}: ExerciseGridCardProps) => {
  const {
    slug,
    title,
    description,
    bodyParts,
    previewImage,
    previewImageAlt,
    equipment,
  } = exercise;
  const exerciseHref = `${STYRKEOEVELSER_PATH}/${slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow group-hover:shadow-md">
      <Link
        href={exerciseHref}
        className="absolute inset-0 z-[1] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-logo-blue focus-visible:ring-offset-2"
        aria-label={`${title} – gå til øvelse`}
      />

      <div className="relative z-0 aspect-[4/3] w-full shrink-0 bg-gray-100">
        {previewImage ? (
          <Image
            src={previewImage}
            alt={previewImageAlt ?? title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
            aria-hidden
          >
            <Dumbbell className="h-12 w-12 text-gray-400" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div
        className={`relative z-0 flex min-h-0 flex-1 flex-col gap-3 px-4 pt-4 pointer-events-none ${
          bodyParts.length === 0 && !equipment ? "pb-4" : ""
        }`}
      >
        <h3 className="text-base font-bold text-gray-900 sm:text-lg">{title}</h3>
        <p className="line-clamp-3 min-h-0 flex-1 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      </div>

      {bodyParts.length > 0 ? (
        <div
          className={`relative z-[2] mt-3 flex flex-wrap gap-1.5 px-4 ${
            equipment ? "" : "pb-4"
          }`}
        >
          {bodyParts.map((bpSlug) => (
            <Link
              key={bpSlug}
              href={`${STYRKEOEVELSER_PATH}/${bpSlug}`}
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                bpSlug === highlightBodyPartSlug
                  ? "ring-2 ring-logo-blue ring-offset-1 " +
                    getBodyPartTagStyles(bpSlug)
                  : getBodyPartTagStyles(bpSlug)
              }`}
            >
              {getBodyPartTitleBySlug(bpSlug)}
            </Link>
          ))}
        </div>
      ) : null}

      {equipment ? (
        <div className="relative z-0 mt-3 flex items-center gap-1.5 px-4 pb-4 text-xs text-gray-500 pointer-events-none">
          <Dumbbell className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
          <span>{equipment}</span>
        </div>
      ) : null}
    </article>
  );
};
