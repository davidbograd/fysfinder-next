"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
  headings: { text: string; id: string }[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <nav className="pl-8 py-6 border-l border-gray-200">
          <h2 className="text-sm font-semibold mb-4 text-gray-900">
            Indholdsfortegnelse
          </h2>
          <ul className="space-y-3 text-sm">
            {headings.map(({ text, id }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={cn(
                    "block text-gray-500 hover:text-gray-900 transition-colors",
                    activeId === id && "text-gray-900 font-medium"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
