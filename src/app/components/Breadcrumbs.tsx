import Link from "next/link";

interface BreadcrumbItem {
  text: string;
  link?: string;
}

const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="text-sm mb-4">
      <ol className="list-none p-0 inline-flex">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-500">/</span>}
            {item.link ? (
              <Link
                href={item.link}
                className="text-primary-blue hover:underline"
              >
                {item.text}
              </Link>
            ) : (
              <span className="text-gray-700">{item.text}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
