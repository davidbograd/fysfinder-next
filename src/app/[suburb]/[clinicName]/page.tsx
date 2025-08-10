import { permanentRedirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";

export default async function ClinicPage({
  params,
}: {
  params: Promise<{ suburb: string; clinicName: string }>;
}) {
  // Resolve params
  const { suburb, clinicName } = await params;

  // Fetch the clinic to get its slug
  const supabase = await createClient();
  const { data: clinic } = await supabase
    .from("clinics")
    .select("klinikNavnSlug")
    .eq("lokationSlug", suburb)
    .eq("klinikNavnSlug", clinicName)
    .single();

  if (clinic) {
    // Use permanentRedirect for 301 redirect
    permanentRedirect(`/klinik/${clinic.klinikNavnSlug}`);
  } else {
    // Use permanentRedirect for the fallback case
    permanentRedirect(`/find/fysioterapeut/${suburb}`);
  }
}
