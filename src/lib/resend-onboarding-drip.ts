import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";

export const RESEND_ONBOARDING_DRIP_EVENT_NAME = "fysfinder.clinic.onboarding_drip_started";

const parseOptionalSegmentList = (): { id: string }[] | undefined => {
  const raw = process.env.RESEND_ONBOARDING_SEGMENT_IDS?.trim();
  if (!raw) {
    return undefined;
  }
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => ({ id }));
  return ids.length > 0 ? ids : undefined;
};

export const splitDisplayNameForContact = (
  displayName: string | null | undefined
): { firstName?: string; lastName?: string } => {
  const trimmed = displayName?.trim();
  if (!trimmed) {
    return {};
  }
  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return { firstName: trimmed };
  }
  return {
    firstName: trimmed.slice(0, space).trim() || undefined,
    lastName: trimmed.slice(space + 1).trim() || undefined,
  };
};

const isLikelyDuplicateContactError = (message: string): boolean => {
  const m = message.toLowerCase();
  return (
    m.includes("already") ||
    m.includes("duplicate") ||
    m.includes("exists") ||
    m.includes("unique")
  );
};

/**
 * Marketing onboarding drip (Resend automation). Runs when RESEND_API_KEY is set.
 * Fires after clinic claim or new-clinic request approval, once per (user_id, clinic_id).
 */
export const triggerClinicOwnerOnboardingDrip = async (
  serviceSupabase: SupabaseClient,
  params: {
    userId: string;
    clinicId: string;
    ownerEmail: string;
    displayName?: string | null;
  }
): Promise<void> => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("Resend onboarding drip skipped: RESEND_API_KEY is not set");
    return;
  }

  const { userId, clinicId, ownerEmail, displayName } = params;
  const email = ownerEmail.trim().toLowerCase();
  if (!email) {
    console.warn("Resend onboarding drip skipped: empty owner email");
    return;
  }

  const { data: ownerRow, error: ownerReadError } = await serviceSupabase
    .from("clinic_owners")
    .select("onboarding_drip_started_at")
    .eq("user_id", userId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (ownerReadError) {
    console.error("Resend onboarding drip: could not read clinic_owners row", ownerReadError);
    return;
  }

  if (ownerRow?.onboarding_drip_started_at) {
    return;
  }

  const resend = new Resend(resendApiKey);
  const { firstName, lastName } = splitDisplayNameForContact(displayName);
  const segments = parseOptionalSegmentList();

  const createPayload = {
    email,
    unsubscribed: false,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(segments ? { segments } : {}),
  };

  const { error: createError } = await resend.contacts.create(createPayload);

  if (createError) {
    if (isLikelyDuplicateContactError(String(createError.message ?? ""))) {
      const { error: updateError } = await resend.contacts.update({
        email,
        unsubscribed: false,
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      });
      if (updateError) {
        console.error("Resend onboarding drip: contact update failed", updateError);
        return;
      }
    } else {
      console.error("Resend onboarding drip: contact create failed", createError);
      return;
    }
  }

  const { error: sendError } = await resend.events.send({
    event: RESEND_ONBOARDING_DRIP_EVENT_NAME,
    email,
    payload: {
      clinicId,
      userId,
    },
  });

  if (sendError) {
    console.error("Resend onboarding drip: send event failed", sendError);
    return;
  }

  const { error: markError } = await serviceSupabase
    .from("clinic_owners")
    .update({ onboarding_drip_started_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("clinic_id", clinicId)
    .is("onboarding_drip_started_at", null);

  if (markError) {
    console.error(
      "Resend onboarding drip: event sent but could not persist onboarding_drip_started_at",
      markError
    );
  }
};
