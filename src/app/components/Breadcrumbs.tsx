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
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-500">/</span>}
            {item.link ? (
              <Link href={item.link} className="text-logo-blue hover:underline">
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
