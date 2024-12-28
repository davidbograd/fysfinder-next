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
  navn: string;
  postal_codes: string[];
  latitude: number;
  longitude: number;
  betegnelser: string[];
  updated_at: string;
}

export interface SearchResult {
  exact_match: City | null;
  nearby_cities: Array<City & { distance: number }>;
}
