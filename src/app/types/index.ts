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

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string[];
  website?: string;
}
