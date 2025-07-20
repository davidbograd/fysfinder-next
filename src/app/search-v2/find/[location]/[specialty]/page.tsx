import React from "react";
import { Metadata } from "next";
import { ResultsContainer, SearchResultsDisplay } from "@/components/search-v2";

interface SpecialtyPageProps {
  params: {
    location: string;
    specialty: string;
  };
}

export async function generateMetadata({
  params,
}: SpecialtyPageProps): Promise<Metadata> {
  const locationName = params.location
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  const specialtyName = params.specialty
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `${specialtyName} fysioterapeuter i ${locationName} | FysFinder`,
    description: `Find de bedste ${specialtyName} fysioterapeuter i ${locationName}. Se anmeldelser og book tid online.`,
    robots: "noindex, nofollow", // Prevent indexing during development
  };
}

export default function SpecialtyResultsPage({ params }: SpecialtyPageProps) {
  const { location, specialty } = params;

  return (
    <ResultsContainer location={location} specialty={specialty}>
      <SearchResultsDisplay />
    </ResultsContainer>
  );
}
