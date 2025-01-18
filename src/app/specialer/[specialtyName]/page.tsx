import { redirect } from "next/navigation";

export default async function SpecialtyPage({
  params,
}: {
  params: { specialtyName: string };
}) {
  // Redirect to the new URL structure
  redirect(`/find/fysioterapeut/danmark/${params.specialtyName}`);
}
