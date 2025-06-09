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
  website: string;
  tlf: string;
  email: string;
  førsteKons: number;
  opfølgning: number;
  første_kons_minutter: number;
  opfølgning_minutter: number;
  mandag: string;
  tirsdag: string;
  onsdag: string;
  torsdag: string;
  fredag: string;
  lørdag: string;
  søndag: string;
  parkering: string;
  handicapadgang: boolean | null;
  god_adgang_verificeret: boolean;
  holdtræning: string;
  hjemmetræning: string;
  northstar: boolean;
  om_os: string | null;
  verified_klinik?: boolean;
  verified_email?: string;
  specialties: {
    specialty_id: string;
    specialty_name: string;
    specialty_name_slug: string;
  }[];
  team_members?: TeamMember[];
  insurances?: Insurance[];
  extraServices?: ExtraService[];
  premium_listing?: PremiumListing | null;
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

export interface DBClinicResponse {
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
  website: string;
  tlf: string;
  email: string;
  førsteKons: number;
  opfølgning: number;
  første_kons_minutter: number;
  opfølgning_minutter: number;
  mandag: string;
  tirsdag: string;
  onsdag: string;
  torsdag: string;
  fredag: string;
  lørdag: string;
  søndag: string;
  parkering: string;
  handicapadgang: boolean | null;
  god_adgang_verificeret: boolean;
  holdtræning: string;
  hjemmetræning: string;
  northstar: boolean;
  om_os: string | null;
  clinic_specialties: {
    specialty: {
      specialty_id: string;
      specialty_name: string;
      specialty_name_slug: string;
    };
  }[];
  clinic_insurances: {
    insurance: Insurance;
  }[];
  clinic_services: {
    service: ExtraService;
  }[];
  clinic_team_members?: {
    id: string;
    name: string;
    role: string;
    image_url: string;
    display_order: number;
  }[];
  premium_listings?: PremiumListing[];
}

export interface LocationPageData {
  city: City | null;
  clinics: Clinic[];
  nearbyClinicsList: ClinicWithDistance[];
  specialties: SpecialtyWithSeo[];
}

export interface SpecialtyWithSeo extends SpecialtyRow {
  specialty_id: string;
  seo_tekst?: string;
}

export interface Insurance {
  insurance_id: string;
  insurance_name: string;
  insurance_name_slug: string;
}

export interface ExtraService {
  service_id: string;
  service_name: string;
  service_name_slug: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  display_order: number;
}

export interface PremiumListing {
  id: string;
  start_date: string;
  end_date: string;
  booking_link: string | null;
}
