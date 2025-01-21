export interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  antalBehandlere: number;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  lokation: string;
  lokationSlug: string;
  klinikNavnSlug: string;
  adresse: string;
  postnummer: number;
  specialties: {
    specialty_id: string;
    specialty_name: string;
  }[];
}

export interface SeoSection {
  headline: string;
  paragraph: string;
}

import { ReactNode } from "react";

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: (string | ReactNode)[];
  website: string;
}

export interface PostalCode {
  nr: string;
  navn: string;
  stormodtager: boolean;
  visueltcenter: [number, number];
  betegnelser?: string[];
}

export interface City {
  id: string;
  bynavn: string;
  bynavn_slug: string;
  postal_codes: string[];
  latitude: number;
  longitude: number;
  betegnelse: string;
  seo_tekst?: string;
}

export interface SearchResult {
  exact_match: City | null;
  nearby_cities: Array<City & { distance: number }>;
}

export interface CityRow {
  bynavn: string;
}

export interface SpecialtyRow {
  specialty_name_slug: string;
  specialty_name: string;
}

export interface ClinicWithDistance extends Clinic {
  distance?: number;
  cityName: string;
}

export interface NearbyClinicResponse {
  clinics_id: string;
  klinikNavn: string;
  ydernummer: boolean;
  avgRating: string;
  ratingCount: string;
  adresse: string;
  postnummer: string;
  lokation: string;
  klinikNavnSlug: string;
  city_name: string;
  distance: number;
  clinic_specialties: Array<{
    specialty_id: string;
    specialty_name: string;
  }> | null;
}
