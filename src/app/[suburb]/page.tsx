import { redirect } from "next/navigation";

export default async function SuburbPage({
  params,
}: {
  params: { suburb: string };
}) {
  redirect(`/find/fysioterapeut/${params.suburb}`);
}
