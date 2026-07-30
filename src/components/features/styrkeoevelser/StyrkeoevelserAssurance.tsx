import Image from "next/image";
import Link from "next/link";
import { ListChecks, Dumbbell, type LucideIcon } from "lucide-react";
import VerifiedCheck from "@/assets/icons/verified-check.svg";
import { getAuthor } from "@/lib/authors";

/** Green verified-style seal shown under the author, matching verified clinics. */
export const QualitySealBadge = () => (
  <div className="flex items-center gap-2">
    <Image
      src={VerifiedCheck}
      alt=""
      width={20}
      height={20}
      className="h-5 w-5"
      aria-hidden
    />
    <span className="font-semibold text-brand-primary">
      Fagligt gennemgået og kvalitetssikret
    </span>
  </div>
);

/** Author block on styrkeøvelser pages: backgrounded card with the seal under the title. */
export const StyrkeoevelserAuthorBlock = ({
  authorSlug = "joachim-bograd",
}: {
  authorSlug?: string;
}) => {
  const author = getAuthor(authorSlug);

  if (!author) {
    return null;
  }

  return (
    <div className="w-fit max-w-full rounded-2xl border border-gray-200 bg-white/50 px-5 py-4">
      <div className="flex items-center gap-4">
        <Image
          src={author.image}
          alt={author.name}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full object-cover"
          priority
        />
        <div className="min-w-0">
          <div className="mb-2">
            <QualitySealBadge />
          </div>
          <div className="font-semibold text-gray-900">
            <Link
              href={`/forfatter/${author.slug}`}
              className="hover:underline"
            >
              {author.name}
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            {author.education.degree} fra {author.education.institution}
          </div>
        </div>
      </div>
    </div>
  );
};

const USPS: { icon: LucideIcon; title: string }[] = [
  {
    icon: ListChecks,
    title: "Trin-for-trin vejledninger",
  },
  {
    icon: Dumbbell,
    title: "Til træning og genoptræning",
  },
];

/** Reassurance USPs (title only), shown in a horizontal stack in the hero's left column. */
export const StyrkeoevelserUsps = () => (
  <section
    aria-label="Derfor kan du stole på vores øvelser"
    className="mt-8 flex flex-wrap gap-x-8 gap-y-4"
  >
    {USPS.map(({ icon: Icon, title }) => (
      <div key={title} className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/50 text-brand-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
    ))}
  </section>
);
