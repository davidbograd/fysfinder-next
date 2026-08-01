import Link from "next/link";
import type { ResolvedRelatedLink } from "@/lib/related-content";

type RelatedContentSectionProps = {
  links: ResolvedRelatedLink[];
  title?: string;
};

/**
 * Curated "Se også" links between ordbog, blog, and styrkeøvelser.
 * Prefer this for cross-universe bridges; keep auto-linker siloed on body-part head terms.
 */
export function RelatedContentSection({
  links,
  title = "Se også",
}: RelatedContentSectionProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav aria-label={title} className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">{title}</h2>
      <ul className="list-disc space-y-2 pl-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-logo-blue hover:underline"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
