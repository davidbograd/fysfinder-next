import { permanentRedirect } from "next/navigation";

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ specialtyName: string }>;
}) {
  const { specialtyName } = await params;
  // Redirect to the new URL structure
  permanentRedirect(`/find/fysioterapeut/danmark/${specialtyName}`);
}
