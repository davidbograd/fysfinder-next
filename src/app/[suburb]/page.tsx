import { permanentRedirect } from "next/navigation";

export default async function SuburbPage({
  params,
}: {
  params: { suburb: string };
}) {
  permanentRedirect(`/find/fysioterapeut/${params.suburb}`);
}
