"use client";

import { searchClinics } from "@/app/actions/search-clinics";
import type { Clinic } from "@/app/actions/search-clinics";
import { Loader2, Search, Pencil, ChartNoAxesCombined } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import Link from "next/link";

function highlightSearchTerm(text: string, searchTerm: string) {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="font-bold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function ClinicSearch() {
  return (
    <section id="clinic-search" className="w-full bg-gray-50 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-center text-2xl font-bold md:text-3xl mb-12">
          Sådan får du din klinik på FysFinder
        </h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Step 1 with Search */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-logo-blue p-3 text-white">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">
                Find og verificer din klinik
              </h3>
            </div>
            <p className="mb-6 text-gray-600">
              Vi har tusindvis af klinikker på FysFinder. Tjek om din klinik
              allerede eksisterer. Søg her.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col-reverse sm:flex-row gap-4">
                <div className="flex-1">
                  <SearchInput />
                </div>
                <a
                  href="https://tally.so/r/wdk75r"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-logo-blue rounded-lg hover:bg-logo-blue/90 transition-colors whitespace-nowrap sm:w-auto w-full"
                >
                  Verificer eller tilføj klinik
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-logo-blue p-3 text-white">
                <Pencil className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Opdater information</h3>
            </div>
            <p className="text-gray-600">
              Tilføj relevant information om din klinik, der kan tiltrække flere
              patienthenvendelser.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-logo-blue p-3 text-white">
                <ChartNoAxesCombined className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Få flere patienter</h3>
            </div>
            <p className="text-gray-600">
              Modtag henvendelser fra de tusindvis af danskere, der månedligt
              bruger FysFinder.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Clinic[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchClinics(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching clinics:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Søg efter din klinik..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base focus:border-logo-blue focus:outline-none focus:ring-1 focus:ring-logo-blue"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowResults(true)}
        onBlur={() => {
          setTimeout(() => setShowResults(false), 2);
        }}
      />

      {showResults &&
        (searchResults.length > 0 || isSearching || searchTerm) && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[300px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {isSearching ? (
              <div className="flex items-center gap-2 p-4 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Søger...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.slice(0, 5).map((clinic) => (
                  <Link
                    key={clinic.clinics_id}
                    href={`/klinik/${clinic.klinikNavnSlug}`}
                    className="block px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {highlightSearchTerm(clinic.klinikNavn, searchTerm)}
                  </Link>
                ))}
                {searchResults.length > 5 && (
                  <div className="border-t border-gray-100 px-4 py-2 text-sm text-gray-600">
                    Viser 5 ud af {searchResults.length} resultater
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-gray-600">
                Ingen klinikker fundet. Prøv at søge efter noget andet.
              </div>
            )}
          </div>
        )}
    </div>
  );
}
