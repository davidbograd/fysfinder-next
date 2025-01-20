import { permanentRedirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";

export default async function ClinicPage({
  params,
}: {
  params: { suburb: string; clinicName: string };
}) {
  // Fetch the clinic to get its slug
  const supabase = createClient();
  const { data: clinic } = await supabase
    .from("clinics")
    .select("klinikNavnSlug")
    .eq("lokationSlug", params.suburb)
    .eq("klinikNavnSlug", params.clinicName)
    .single();

  if (clinic) {
    // Use permanentRedirect for 301 redirect
    permanentRedirect(`/klinik/${clinic.klinikNavnSlug}`);
  } else {
    // Use permanentRedirect for the fallback case
    permanentRedirect(`/find/fysioterapeut/${params.suburb}`);
  }
}
