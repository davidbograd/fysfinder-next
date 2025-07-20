import React from "react";
import { Metadata } from "next";
import { ResultsContainer, SearchResultsDisplay } from "@/components/search-v2";

interface LocationPageProps {
  params: {
    location: string;
  };
}

export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const locationName = params.location
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `Fysioterapeuter i ${locationName} | FysFinder`,
    description: `Find de bedste fysioterapeuter i ${locationName}. Se anmeldelser, specialer og book tid online.`,
    robots: "noindex, nofollow", // Prevent indexing during development
  };
}

export default function LocationResultsPage({ params }: LocationPageProps) {
  const { location } = params;

  return (
    <ResultsContainer location={location}>
      <SearchResultsDisplay />
    </ResultsContainer>
  );
}
