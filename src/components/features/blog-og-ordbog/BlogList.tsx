import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import type { BlogPost } from "@/lib/blog";

interface BlogListProps {
  posts: BlogPost[];
}

function formatDanishDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("-");
  const months = [
    "januar",
    "februar",
    "marts",
    "april",
    "maj",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "december",
  ];
  return `${day}. ${months[parseInt(month) - 1]} ${year}`;
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <Link
            href={`/blog/${post.slug}`}
            className="block relative aspect-[4/3] overflow-hidden group"
          >
            <Image
              src={post.previewImage}
              alt={post.previewImageAlt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          <div className="p-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.datePublished}>
                {formatDanishDate(post.datePublished)}
              </time>
            </div>
            <h2 className="text-xl font-semibold mb-3 line-clamp-2">
              <Link
                href={`/blog/${post.slug}`}
                className="text-gray-900 hover:text-logo-blue transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            {post.description && (
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                {post.description}
              </p>
            )}
            <Link
              href={`/blog/${post.slug}`}
              className="text-logo-blue hover:underline text-sm font-medium inline-flex items-center gap-1 mt-auto"
            >
              Læs mere <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
