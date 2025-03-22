import Link from "next/link";

interface BreadcrumbItem {
  text: string;
  link?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-3 text-gray-500 select-none">›</span>
            )}
            {item.link ? (
              <Link
                href={item.link}
                className="text-gray-500 hover:text-gray-600 transition-colors"
              >
                {item.text}
              </Link>
            ) : (
              <span className="text-gray-900">{item.text}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
