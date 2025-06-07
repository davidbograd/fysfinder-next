import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAuthor } from "@/lib/authors";

interface AuthorCardProps {
  authorSlug?: string;
}

export function AuthorCard({ authorSlug = "joachim-bograd" }: AuthorCardProps) {
  const author = getAuthor(authorSlug);

  if (!author) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-shrink-0">
        <Image
          src={author.image}
          alt={author.name}
          width={64}
          height={64}
          className="rounded-full object-cover"
          priority
        />
      </div>
      <div>
        <div className="font-medium">
          <Link href={`/forfatter/${author.slug}`} className="hover:underline">
            {author.name}
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          {author.education.degree} fra {author.education.institution}
        </div>
      </div>
    </div>
  );
}
