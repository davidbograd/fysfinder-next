// Updated: 2026-03-24 - Added icon-based compact styling and updated CTA copy for header search bar
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BookHeart, MapPin, Search } from "lucide-react";
import { SearchProvider, useSearch } from "@/components/search/SearchProvider";
import { LocationSearch } from "@/components/search/SearchInput/LocationSearch";
import { SpecialtySearch } from "@/components/search/SearchInput/SpecialtySearch";
import { buildSearchTargetUrlFromState } from "@/components/search/buildSearchTargetUrl";

interface HeaderSearchBarProps {
  className?: string;
}

function HeaderSearchBarContent() {
  const router = useRouter();
  const { state } = useSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const targetUrl = buildSearchTargetUrlFromState(state);
      router.push(targetUrl);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-11 w-[720px] max-w-[58vw] items-center rounded-full border border-[#d8ddd9] bg-white pl-2 pr-1 shadow-[0_1px_1px_rgba(15,23,42,0.05)]"
      aria-label="Søg efter fysioterapeut"
    >
      <div className="flex min-w-0 flex-1 items-center">
        <MapPin className="ml-2 h-4 w-4 shrink-0 text-[#8a9491]" />
        <LocationSearch
          placeholder="By/postnr"
          className="h-11 py-2 pl-2 text-sm placeholder:text-sm"
        />
      </div>
      <div className="mx-2 h-6 w-px bg-[#e6e9e7]" />
      <div className="flex w-[250px] min-w-[200px] items-center">
        <BookHeart className="ml-1 h-4 w-4 shrink-0 text-[#8a9491]" />
        <SpecialtySearch
          placeholder="Alle specialer"
          className="h-11 py-2 pl-2 text-sm placeholder:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-4 text-sm font-medium transition-colors ${
          isSubmitting
            ? "cursor-not-allowed bg-[#c5cbc9] text-[#6d7875]"
            : "bg-[#0b5b43] text-white hover:bg-[#084c39]"
        }`}
        aria-label={isSubmitting ? "Søger..." : "Find fysioterapeut"}
      >
        <Search className="h-4 w-4" />
        <span>Find fysioterapeut</span>
      </button>
    </form>
  );
}

export function HeaderSearchBar({ className = "" }: HeaderSearchBarProps) {
  return (
    <div className={className}>
      <SearchProvider>
        <HeaderSearchBarContent />
      </SearchProvider>
    </div>
  );
}
