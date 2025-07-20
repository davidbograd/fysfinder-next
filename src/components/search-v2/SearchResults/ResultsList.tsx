"use client";

import React from "react";
import { MapPin, Phone, Globe, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  ydernummer: boolean;
  handicapAccess: boolean;
  rating?: number;
  specialties: string[];
  distance?: number;
  isPremium: boolean;
  bookingLink?: string;
}

interface ResultsListProps {
  results: Clinic[];
  isLoading: boolean;
  totalCount: number;
  currentFilters: {
    ydernummer?: boolean;
    handicap?: boolean;
  };
}

const ClinicCard: React.FC<{ clinic: Clinic }> = ({ clinic }) => {
  console.log("ClinicCard rendering:", clinic.name);

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${
        clinic.isPremium ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {clinic.name}
              </h3>
              {clinic.isPremium && (
                <Badge
                  variant="default"
                  className="bg-blue-500 text-white text-xs"
                >
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {clinic.address}, {clinic.city} {clinic.postalCode}
              </span>
            </div>
            {clinic.distance && (
              <p className="text-sm text-gray-500">
                {clinic.distance.toFixed(1)} km væk
              </p>
            )}
          </div>

          {clinic.rating && (
            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
              <span className="text-sm font-medium">
                {clinic.rating.toFixed(1)}
              </span>
              <span className="text-xs ml-1">★</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        {clinic.specialties && clinic.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {clinic.specialties
              .filter((specialty) => specialty && specialty.trim())
              .slice(0, 3)
              .map((specialty, index) => (
                <Badge
                  key={specialty || `specialty-${index}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {specialty}
                </Badge>
              ))}
            {clinic.specialties.filter(
              (specialty) => specialty && specialty.trim()
            ).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +
                {clinic.specialties.filter(
                  (specialty) => specialty && specialty.trim()
                ).length - 3}{" "}
                flere
              </Badge>
            )}
          </div>
        )}

        {/* Features */}
        <div className="flex items-center gap-4 mb-4">
          {clinic.ydernummer && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Ydernummer</span>
            </div>
          )}
          {clinic.handicapAccess && (
            <div className="flex items-center text-blue-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Handicaptilgængeligt</span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="flex items-center gap-4 pt-4 border-t">
          {clinic.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Phone className="h-4 w-4 mr-1" />
              <span className="text-sm">{clinic.phone}</span>
            </a>
          )}
          {clinic.website && (
            <a
              href={clinic.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Globe className="h-4 w-4 mr-1" />
              <span className="text-sm">Hjemmeside</span>
            </a>
          )}

          <div className="ml-auto flex gap-2">
            {clinic.bookingLink && (
              <a
                href={clinic.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
              >
                Book tid
              </a>
            )}
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
              Se profil
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </CardContent>
    </Card>
  );
};

export const ResultsList: React.FC<ResultsListProps> = ({
  results,
  isLoading,
  totalCount,
  currentFilters,
}) => {
  // Debug log to see what's happening
  console.log("ResultsList render:", {
    isLoading,
    resultsCount: results.length,
    totalCount,
    firstResult: results[0]?.name,
  });

  if (isLoading) {
    console.log("ResultsList: Still loading, showing skeleton");
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    console.log("ResultsList: No results to display, showing empty state");
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              Ingen resultater fundet
            </h3>
            <p className="text-sm">
              {Object.keys(currentFilters).length > 0 ? (
                <>Prøv at fjerne nogle filtre for at se flere resultater.</>
              ) : (
                <>Der blev ikke fundet nogen klinikker i dette område.</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log(
    "ResultsList: Showing clinic cards for",
    results.length,
    "clinics"
  );

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="text-sm text-gray-600 mb-4">
        Viser {results.length} af {totalCount} resultater
      </div>

      {/* Results List */}
      {results.map((clinic, index) => (
        <ClinicCard key={clinic.id || `clinic-${index}`} clinic={clinic} />
      ))}

      {/* Load More Button (for pagination) */}
      {results.length < totalCount && (
        <div className="text-center pt-6">
          <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
            Indlæs flere resultater
          </button>
        </div>
      )}
    </div>
  );
};
