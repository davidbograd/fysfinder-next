"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchCities } from "@/app/actions/search-cities";
import { searchClinicsByCity, submitClinicClaim } from "@/app/actions/claim-clinic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import { City, SearchResult } from "@/app/types";

interface ClaimClinicPageProps {
  userProfile: {
    full_name: string;
    email: string;
  } | null;
}

interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  adresse: string | null;
  postnummer: number | null;
  lokation: string | null;
  verified_klinik: boolean;
}

export const ClaimClinicPage = ({ userProfile }: ClaimClinicPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const [formData, setFormData] = useState({
    klinik_navn: "",
    job_titel: "",
    fulde_navn: userProfile?.full_name || "",
    email: userProfile?.email || "",
    telefon: "",
  });

  // Debounced search function
  const debouncedSearch = async (query: string) => {
    if (query.length < 2) {
      setSuggestions(null);
      setShowCityDropdown(false);
      return;
    }

    setIsSearchingCity(true);

    try {
      const results = await searchCities(query);
      setSuggestions(results);
      setShowCityDropdown(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Location search failed:", error);
      setSuggestions(null);
      toast({
        title: "Fejl",
        description: "Kunne ikke søge efter byer. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingCity(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear selected city if user edits
    if (selectedCity && value !== selectedCity.bynavn) {
      setSelectedCity(null);
      setClinics([]);
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = async (city: City) => {
    setSelectedCity(city);
    setInputValue(city.bynavn);
    setShowCityDropdown(false);
    setSuggestions(null);
    setSelectedIndex(-1);

    // Search for clinics in this city
    setIsLoadingClinics(true);
    try {
      const clinicsResult = await searchClinicsByCity(city.bynavn_slug);
      if (clinicsResult.clinics) {
        setClinics(clinicsResult.clinics);
      }
      if (clinicsResult.error) {
        toast({
          title: "Fejl",
          description: clinicsResult.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast({
        title: "Fejl",
        description: "Kunne ikke hente klinikker. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingClinics(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCityDropdown || !suggestions) return;

    const allSuggestions = [
      ...(suggestions.exact_match ? [suggestions.exact_match] : []),
      ...suggestions.nearby_cities,
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleLocationSelect(allSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowCityDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setTimeout(() => {
      setShowCityDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions && inputValue.length >= 2) {
      setShowCityDropdown(true);
    }
  };

  // Format suggestion display text
  const formatSuggestionText = (city: City) => {
    const postalCodesText =
      city.postal_codes && city.postal_codes.length > 0
        ? `${city.postal_codes.slice(0, 3).join(", ")}${
            city.postal_codes.length > 3 ? "..." : ""
          }`
        : "";

    return (
      <div className="flex flex-col">
        <span className="font-medium">{city.bynavn}</span>
        {postalCodesText && (
          <span className="text-xs text-gray-500">{postalCodesText}</span>
        )}
      </div>
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleOpenClaimModal = (clinic: Clinic) => {
    if (clinic.verified_klinik) {
      toast({
        title: "Klinik allerede verificeret",
        description: "Denne klinik er allerede verificeret og kan ikke tages ejerskab af.",
        variant: "destructive",
      });
      return;
    }
    setSelectedClinic(clinic);
    setFormData({
      ...formData,
      klinik_navn: clinic.klinikNavn,
    });
    setIsModalOpen(true);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic) return;

    setIsSubmitting(true);
    try {
      const result = await submitClinicClaim({
        clinic_id: selectedClinic.clinics_id,
        klinik_navn: formData.klinik_navn,
        job_titel: formData.job_titel,
        fulde_navn: formData.fulde_navn,
        email: formData.email,
        telefon: formData.telefon,
      });

      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Anmodning indsendt",
        description:
          "Din anmodning om ejerskab er blevet indsendt. Vi vender tilbage til dig snarest muligt.",
      });
      setIsModalOpen(false);
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Tag ejerskab af din klinik
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Søg efter din klinik og tag ejerskab
        </p>
      </div>

      {/* What you will need section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hvad har du brug for?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>Klinikkens navn</li>
            <li>Din stillingsbetegnelse</li>
            <li>Dit fulde navn</li>
            <li>Din email</li>
            <li>Dit telefonnummer (valgfrit)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Search section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Søg efter din klinik</CardTitle>
          <CardDescription>
            Indtast by eller postnummer for at finde din klinik
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="By eller postnummer"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className="pr-10"
                aria-label="Search for location"
                aria-autocomplete="list"
                aria-expanded={showCityDropdown}
                aria-controls="location-dropdown"
                role="combobox"
              />

              {isSearchingCity && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}

              {!isSearchingCity && selectedCity && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity(null);
                    setInputValue("");
                    setSuggestions(null);
                    setShowCityDropdown(false);
                    setSelectedIndex(-1);
                    setClinics([]);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear location selection"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showCityDropdown && suggestions && (
              <div
                ref={dropdownRef}
                id="location-dropdown"
                className="absolute z-[9999] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-full"
                role="listbox"
              >
                {suggestions.exact_match && (
                  <button
                    type="button"
                    onClick={() => handleLocationSelect(suggestions.exact_match!)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:bg-gray-50 focus:outline-none ${
                      selectedIndex === 0 ? "bg-blue-50" : ""
                    }`}
                    role="option"
                    aria-selected={selectedIndex === 0}
                  >
                    {formatSuggestionText(suggestions.exact_match)}
                  </button>
                )}

                {suggestions.nearby_cities.map((city, index) => {
                  const adjustedIndex = suggestions.exact_match ? index + 1 : index;

                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleLocationSelect(city)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                        selectedIndex === adjustedIndex ? "bg-blue-50" : ""
                      }`}
                      role="option"
                      aria-selected={selectedIndex === adjustedIndex}
                    >
                      {formatSuggestionText(city)}
                      {city.distance && city.distance > 0 && (
                        <span className="text-xs text-gray-400 ml-2">
                          {city.distance.toFixed(1)} km væk
                        </span>
                      )}
                    </button>
                  );
                })}

                {suggestions.exact_match === null &&
                  suggestions.nearby_cities.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      {suggestions.prompt_message || "Ingen resultater fundet"}
                    </div>
                  )}
              </div>
            )}
          </div>

          {selectedCity && (
            <div className="text-sm text-gray-600">
              Viser klinikker fra: <strong>{selectedCity.bynavn}</strong>
              {isLoadingClinics && (
                <Loader2 className="ml-2 h-3 w-3 inline animate-spin" />
              )}
            </div>
          )}

          {clinics.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">
                Fundet {clinics.length} klinik(ker)
              </h3>
              <div className="space-y-2">
                {clinics.map((clinic) => (
                  <div
                    key={clinic.clinics_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {clinic.klinikNavn}
                      </h4>
                      {(clinic.adresse || (clinic.postnummer && clinic.lokation)) && (
                        <p className="text-sm text-gray-600">
                          {[
                            clinic.adresse,
                            clinic.postnummer && clinic.lokation
                              ? `${clinic.postnummer} ${clinic.lokation}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {clinic.verified_klinik && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          Verificeret
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleOpenClaimModal(clinic)}
                      disabled={clinic.verified_klinik}
                      variant={clinic.verified_klinik ? "outline" : "default"}
                      title={clinic.verified_klinik ? "Denne klinik er allerede verificeret" : undefined}
                    >
                      {clinic.verified_klinik ? "Allerede verificeret" : "Tag ejerskab"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCity && clinics.length === 0 && !isLoadingClinics && (
            <p className="text-sm text-gray-500">
              Ingen klinikker fundet i {selectedCity.bynavn}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Claim Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tag ejerskab</DialogTitle>
            <DialogDescription>
              Udfyld formularen for at tag ejerskab af klinikken
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitClaim}>
            {/* Clinic Info Display */}
            {selectedClinic && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-900">
                    {selectedClinic.klinikNavn}
                  </h4>
                  {(selectedClinic.adresse ||
                    (selectedClinic.postnummer && selectedClinic.lokation)) && (
                    <p className="text-sm text-gray-600">
                      {[
                        selectedClinic.adresse,
                        selectedClinic.postnummer && selectedClinic.lokation
                          ? `${selectedClinic.postnummer} ${selectedClinic.lokation}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="klinik_navn">Klinik navn</Label>
                <Input
                  id="klinik_navn"
                  value={formData.klinik_navn}
                  onChange={(e) =>
                    setFormData({ ...formData, klinik_navn: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_titel">Din rolle i klinikken?</Label>
                <Input
                  id="job_titel"
                  value={formData.job_titel}
                  onChange={(e) =>
                    setFormData({ ...formData, job_titel: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fulde_navn">Fulde navn</Label>
                <Input
                  id="fulde_navn"
                  value={formData.fulde_navn}
                  onChange={(e) =>
                    setFormData({ ...formData, fulde_navn: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon nummer</Label>
                <Input
                  id="telefon"
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) =>
                    setFormData({ ...formData, telefon: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Annuller
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Indsender..." : "Tag ejerskab"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

