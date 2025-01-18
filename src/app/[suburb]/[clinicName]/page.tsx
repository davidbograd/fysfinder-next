import { redirect } from "next/navigation";
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
    // Redirect to the new URL structure
    redirect(`/klinik/${clinic.klinikNavnSlug}`);
  } else {
    // If clinic not found, redirect to the suburb page
    redirect(`/find/fysioterapeut/${params.suburb}`);
  }
}
