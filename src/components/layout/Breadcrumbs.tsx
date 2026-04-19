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
      <ol className="flex min-w-0 items-center text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={index}
              className={`flex min-w-0 items-center ${isLast ? "flex-1" : "shrink-0"}`}
            >
              {index > 0 && (
                <span className="mx-3 shrink-0 text-gray-500 select-none">›</span>
              )}
              {item.link ? (
                <Link
                  href={item.link}
                  className="text-gray-500 transition-colors hover:text-gray-600"
                >
                  {item.text}
                </Link>
              ) : (
                <span
                  className="min-w-0 flex-1 truncate text-gray-900"
                  title={item.text}
                >
                  {item.text}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
