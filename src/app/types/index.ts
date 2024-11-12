export interface Clinic {
  clinics_id: string;
  klinikNavn: string;
  antalBehandlere: number;
  ydernummer: boolean;
  avgRating: number;
  ratingCount: number;
  lokation: string;
  lokationSlug: string;
  adresse: string;
  postnummer: number;
}

export interface SeoSection {
  headline: string;
  paragraph: string;
}
