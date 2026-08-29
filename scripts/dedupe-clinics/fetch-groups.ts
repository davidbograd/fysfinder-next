// Shared live-data fetch for the one-time clinic duplicate cleanup.
// Updated: loads Place ID groups plus owner/premium/team/specialty/event counts.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { classifyGroups, type ClinicCandidate } from "./logic";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../.env.local") });

const PAGE_SIZE = 1000;

export function createDedupeClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }
  return createClient(url, key);
}

async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

interface ClinicRow {
  clinics_id: string;
  klinikNavn: string;
  klinikNavnSlug: string;
  lokation: string | null;
  adresse: string | null;
  tlf: string | null;
  email: string | null;
  website: string | null;
  om_os: string | null;
  logo_url: string | null;
  google_place_id: string | null;
  verified_klinik: boolean;
  created_at: string;
  mandag: string | null;
  tirsdag: string | null;
  onsdag: string | null;
  torsdag: string | null;
  fredag: string | null;
  lørdag: string | null;
  søndag: string | null;
}

function incrementCount(map: Map<string, number>, id: string | null) {
  if (!id) return;
  map.set(id, (map.get(id) ?? 0) + 1);
}

export async function loadDuplicateCandidates(
  supabase: SupabaseClient
): Promise<ClinicCandidate[]> {
  const clinics = await fetchAllRows<ClinicRow>((from, to) =>
    supabase
      .from("clinics")
      .select(
        'clinics_id, "klinikNavn", "klinikNavnSlug", lokation, adresse, tlf, email, website, om_os, logo_url, google_place_id, verified_klinik, created_at, mandag, tirsdag, onsdag, torsdag, fredag, "lørdag", "søndag"'
      )
      .not("google_place_id", "is", null)
      .range(from, to)
  );

  const duplicateIds = new Set<string>();
  const byPlace = new Map<string, string[]>();
  for (const clinic of clinics) {
    const placeId = clinic.google_place_id?.trim();
    if (!placeId) continue;
    const ids = byPlace.get(placeId) ?? [];
    ids.push(clinic.clinics_id);
    byPlace.set(placeId, ids);
  }
  for (const ids of byPlace.values()) {
    if (ids.length > 1) {
      for (const id of ids) duplicateIds.add(id);
    }
  }

  const owners = new Map<string, number>();
  const premium = new Map<string, number>();
  const team = new Map<string, number>();
  const specialties = new Map<string, number>();
  const events = new Map<string, number>();

  const ownerRows = await fetchAllRows<{ clinic_id: string }>((from, to) =>
    supabase.from("clinic_owners").select("clinic_id").range(from, to)
  );
  for (const row of ownerRows) incrementCount(owners, row.clinic_id);

  const premiumRows = await fetchAllRows<{ clinic_id: string }>((from, to) =>
    supabase.from("premium_listings").select("clinic_id").range(from, to)
  );
  for (const row of premiumRows) incrementCount(premium, row.clinic_id);

  const teamRows = await fetchAllRows<{ clinic_id: string }>((from, to) =>
    supabase.from("clinic_team_members").select("clinic_id").range(from, to)
  );
  for (const row of teamRows) incrementCount(team, row.clinic_id);

  const specialtyRows = await fetchAllRows<{ clinics_id: string }>((from, to) =>
    supabase.from("clinic_specialties").select("clinics_id").range(from, to)
  );
  for (const row of specialtyRows) incrementCount(specialties, row.clinics_id);

  const duplicateIdList = [...duplicateIds];
  for (let i = 0; i < duplicateIdList.length; i += 50) {
    const chunk = duplicateIdList.slice(i, i + 50);
    const eventRows = await fetchAllRows<{ clinic_id: string }>((from, to) =>
      supabase
        .from("clinic_events")
        .select("clinic_id")
        .in("clinic_id", chunk)
        .range(from, to)
    );
    for (const row of eventRows) incrementCount(events, row.clinic_id);
  }

  return clinics
    .filter((clinic) => duplicateIds.has(clinic.clinics_id))
    .map((clinic) => ({
      ...clinic,
      owners: owners.get(clinic.clinics_id) ?? 0,
      premium: premium.get(clinic.clinics_id) ?? 0,
      team: team.get(clinic.clinics_id) ?? 0,
      specialties: specialties.get(clinic.clinics_id) ?? 0,
      events: events.get(clinic.clinics_id) ?? 0,
    }));
}

export async function loadClassifiedGroups(supabase: SupabaseClient) {
  const candidates = await loadDuplicateCandidates(supabase);
  return classifyGroups(candidates);
}
