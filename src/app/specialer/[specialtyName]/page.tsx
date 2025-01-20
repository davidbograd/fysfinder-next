import { permanentRedirect } from "next/navigation";

export default async function SpecialtyPage({
  params,
}: {
  params: { specialtyName: string };
}) {
  // Redirect to the new URL structure
  permanentRedirect(`/find/fysioterapeut/danmark/${params.specialtyName}`);
}
