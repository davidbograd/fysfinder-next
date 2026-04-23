// Admin ownership actions for clinic-to-user assignment and secure single-owner transfers.
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

interface AdminClinicSearchResult {
  clinics_id: string;
  klinikNavn: string;
  lokation: string | null;
  adresse: string | null;
  postnummer: number | null;
}

interface AdminUserSearchResult {
  id: string;
  full_name: string;
  email: string;
}

interface ClinicOwnerInfo {
  userId: string;
  fullName: string | null;
  email: string | null;
}

type AdminOwnershipActionResult<T> = T | { error: string };
type RequireAdminResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Ikke logget ind" };
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, error: "Ingen adgang - kun administratorer kan bruge værktøjet" };
  }

  return { ok: true, user };
}

export async function searchClinicsForAdmin(
  query: string
): Promise<AdminOwnershipActionResult<{ clinics: AdminClinicSearchResult[] }>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { clinics: [] };
  }

  const serviceSupabase = getServiceClient();
  const { data: clinics, error } = await serviceSupabase
    .from("clinics")
    .select("clinics_id, klinikNavn, lokation, adresse, postnummer")
    .or(`klinikNavn.ilike.%${trimmedQuery}%,lokation.ilike.%${trimmedQuery}%`)
    .order("klinikNavn", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Error searching clinics for admin ownership tool:", error);
    return { error: "Kunne ikke søge efter klinikker" };
  }

  return { clinics: clinics || [] };
}

export async function searchUsersForAdmin(
  query: string
): Promise<AdminOwnershipActionResult<{ users: AdminUserSearchResult[] }>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { users: [] };
  }

  const serviceSupabase = getServiceClient();
  const { data: users, error } = await serviceSupabase
    .from("user_profiles")
    .select("id, full_name, email")
    .or(`full_name.ilike.%${trimmedQuery}%,email.ilike.%${trimmedQuery}%`)
    .order("full_name", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Error searching users for admin ownership tool:", error);
    return { error: "Kunne ikke søge efter brugere" };
  }

  const mergedUsers = new Map<string, AdminUserSearchResult>();
  for (const user of users || []) {
    const email = user.email || "";
    if (!email) {
      continue;
    }
    mergedUsers.set(user.id, {
      id: user.id,
      full_name: user.full_name || email,
      email,
    });
  }

  const loweredQuery = trimmedQuery.toLowerCase();
  const authPerPage = 200;
  const maxAuthPages = 20;

  for (let page = 1; page <= maxAuthPages; page += 1) {
    const { data: authUsersData, error: authUsersError } =
      await serviceSupabase.auth.admin.listUsers({
        page,
        perPage: authPerPage,
      });

    if (authUsersError) {
      console.error("Error searching auth users for admin ownership tool:", authUsersError);
      break;
    }

    const authUsers = authUsersData.users || [];
    for (const authUser of authUsers) {
      const email = authUser.email || "";
      if (!email) {
        continue;
      }
      const metadataName =
        typeof authUser.user_metadata?.full_name === "string"
          ? authUser.user_metadata.full_name
          : typeof authUser.user_metadata?.name === "string"
            ? authUser.user_metadata.name
            : "";
      const haystack = `${email} ${metadataName}`.toLowerCase();
      if (!haystack.includes(loweredQuery)) {
        continue;
      }
      if (mergedUsers.has(authUser.id)) {
        continue;
      }
      mergedUsers.set(authUser.id, {
        id: authUser.id,
        full_name: metadataName || email,
        email,
      });
    }

    if (mergedUsers.size >= 20) {
      break;
    }
    if (authUsers.length < authPerPage) {
      break;
    }
  }

  const sortedUsers = Array.from(mergedUsers.values())
    .sort((a, b) => a.full_name.localeCompare(b.full_name, "da-DK"))
    .slice(0, 20);

  return { users: sortedUsers };
}

export async function getClinicOwnerForAdmin(
  clinicId: string
): Promise<
  AdminOwnershipActionResult<{
    owner: ClinicOwnerInfo | null;
    ownerCount: number;
  }>
> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const trimmedClinicId = clinicId.trim();
  if (!trimmedClinicId) {
    return { error: "Klinik-id mangler" };
  }

  const serviceSupabase = getServiceClient();
  const { data: ownershipRows, error: ownershipError } = await serviceSupabase
    .from("clinic_owners")
    .select("user_id")
    .eq("clinic_id", trimmedClinicId);

  if (ownershipError) {
    console.error("Error loading clinic owner for admin ownership tool:", ownershipError);
    return { error: "Kunne ikke hente nuværende ejer" };
  }

  const ownerRows = ownershipRows || [];
  if (ownerRows.length === 0) {
    return { owner: null, ownerCount: 0 };
  }

  const ownerIds = ownerRows.map((row) => row.user_id);
  const { data: profiles, error: profilesError } = await serviceSupabase
    .from("user_profiles")
    .select("id, full_name, email")
    .in("id", ownerIds);

  if (profilesError) {
    console.error("Error loading owner profiles for admin ownership tool:", profilesError);
    return { error: "Kunne ikke hente ejerdetaljer" };
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const primaryOwnerUserId = ownerRows[0]?.user_id;
  const primaryOwnerProfile = primaryOwnerUserId
    ? profileById.get(primaryOwnerUserId)
    : null;
  let resolvedOwnerEmail = primaryOwnerProfile?.email || null;

  if (!resolvedOwnerEmail && primaryOwnerUserId) {
    const { data: authUserData, error: authUserError } =
      await serviceSupabase.auth.admin.getUserById(primaryOwnerUserId);
    if (authUserError) {
      console.error("Error loading owner email from auth.users:", authUserError);
    } else {
      resolvedOwnerEmail = authUserData.user?.email || null;
    }
  }

  return {
    owner: primaryOwnerUserId
      ? {
          userId: primaryOwnerUserId,
          fullName: primaryOwnerProfile?.full_name || null,
          email: resolvedOwnerEmail,
        }
      : null,
    ownerCount: ownerRows.length,
  };
}

export async function setClinicOwnerForAdmin(input: {
  clinicId: string;
  newOwnerUserId: string;
}): Promise<
  AdminOwnershipActionResult<{
    success: true;
    previousOwnerUserIds: string[];
    ownerUserId: string;
  }>
> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return { error: admin.error };
  }

  const clinicId = input.clinicId.trim();
  const newOwnerUserId = input.newOwnerUserId.trim();

  if (!clinicId || !newOwnerUserId) {
    return { error: "Klinik og bruger skal vælges" };
  }

  const serviceSupabase = getServiceClient();

  const [clinicResult, userProfileResult, currentOwnersResult] = await Promise.all([
    serviceSupabase
      .from("clinics")
      .select("clinics_id")
      .eq("clinics_id", clinicId)
      .single(),
    serviceSupabase
      .from("user_profiles")
      .select("id")
      .eq("id", newOwnerUserId)
      .maybeSingle(),
    serviceSupabase
      .from("clinic_owners")
      .select("user_id, clinic_id")
      .eq("clinic_id", clinicId),
  ]);

  if (clinicResult.error || !clinicResult.data) {
    return { error: "Klinikken findes ikke" };
  }

  if (userProfileResult.error) {
    console.error("Error validating user profile for ownership transfer:", userProfileResult.error);
    return { error: "Kunne ikke validere bruger" };
  }

  if (!userProfileResult.data) {
    const { data: authUserData, error: authUserError } =
      await serviceSupabase.auth.admin.getUserById(newOwnerUserId);
    if (authUserError || !authUserData.user) {
      return { error: "Brugeren findes ikke" };
    }
  }

  if (currentOwnersResult.error) {
    console.error("Error reading existing clinic owners:", currentOwnersResult.error);
    return { error: "Kunne ikke hente nuværende ejerskab" };
  }

  const existingOwnerRows = currentOwnersResult.data || [];
  const existingOwnerUserIds = existingOwnerRows.map((row) => row.user_id);
  if (existingOwnerRows.length === 1 && existingOwnerRows[0]?.user_id === newOwnerUserId) {
    return { error: "Brugeren er allerede ejer af klinikken" };
  }

  const { error: deleteError } = await serviceSupabase
    .from("clinic_owners")
    .delete()
    .eq("clinic_id", clinicId);

  if (deleteError) {
    console.error("Error clearing existing clinic owners:", deleteError);
    return { error: "Kunne ikke opdatere nuværende ejerskab" };
  }

  const { error: insertError } = await serviceSupabase
    .from("clinic_owners")
    .insert({ clinic_id: clinicId, user_id: newOwnerUserId });

  if (insertError) {
    console.error("Error creating replacement clinic owner:", insertError);

    if (existingOwnerRows.length > 0) {
      const restoreRows = existingOwnerRows.map((ownerRow) => ({
        clinic_id: ownerRow.clinic_id,
        user_id: ownerRow.user_id,
      }));
      const { error: restoreError } = await serviceSupabase
        .from("clinic_owners")
        .insert(restoreRows);
      if (restoreError) {
        console.error("Error restoring previous clinic owners after failed transfer:", restoreError);
      }
    }

    return { error: "Kunne ikke gemme nyt ejerskab" };
  }

  console.info("Admin clinic ownership transfer completed", {
    adminUserId: admin.user.id,
    clinicId,
    previousOwnerUserIds: existingOwnerUserIds,
    nextOwnerUserId: newOwnerUserId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/admin/clinic-owners");

  return {
    success: true,
    previousOwnerUserIds: existingOwnerUserIds,
    ownerUserId: newOwnerUserId,
  };
}
