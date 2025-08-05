import { permanentRedirect } from "next/navigation";

export default async function SuburbPage({
  params,
}: {
  params: Promise<{ suburb: string }>;
}) {
  const { suburb } = await params;
  permanentRedirect(`/find/fysioterapeut/${suburb}`);
}
