// Premium success and location-selection page.
// Added: guides owner to pick neighbor cities after successful payment.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPremiumUpgradeContext } from "@/app/actions/premium-upgrade";
import { PremiumLocationPicker } from "@/components/dashboard/PremiumLocationPicker";

interface PremiumSuccessPageProps {
  searchParams: Promise<{ clinicId?: string; session_id?: string }>;
}

export default async function PremiumSuccessPage({ searchParams }: PremiumSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const clinicId = resolvedSearchParams.clinicId;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (!clinicId) {
    redirect("/dashboard");
  }

  const contextResult = await getPremiumUpgradeContext(clinicId);
  if (contextResult.error || !contextResult.data) {
    redirect("/dashboard");
  }

  const {
    clinicName,
    hasActivePremium,
    selectedCityIds,
    cityOptions,
  } = contextResult.data;
  const homeCityName = cityOptions.find((city) => city.isHome)?.cityName || "hjemmebyen";

  return (
    <div className="py-8 w-full max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <strong>{clinicName}</strong> har nu Fysfinder premium
          </CardTitle>
          {!hasActivePremium && (
            <CardDescription>
              Premium for <strong>{clinicName}</strong> bliver aktiveret automatisk efter
              betaling.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {hasActivePremium ? (
            <p className="text-sm text-green-700">
              Premium er aktiv. Vælg nu hvilke nabobyer du vil være synlig i.
            </p>
          ) : (
            <p className="text-sm text-amber-700">
              Vi venter stadig på bekræftelse fra betalingssystemet. Opdater siden om et
              øjeblik, og vælg derefter byer.
            </p>
          )}
        </CardContent>
      </Card>

      {hasActivePremium && (
        <Card>
          <CardHeader>
            <CardTitle>Vælg nabobyer</CardTitle>
            <CardDescription>
              Din klinik er altid synlig i {homeCityName}. Vælg de ekstra byer, hvor du også vil
              vises.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PremiumLocationPicker
              clinicId={clinicId}
              cityOptions={cityOptions}
              initiallySelectedCityIds={selectedCityIds}
            />
          </CardContent>
        </Card>
      )}

      <Button asChild variant="ghost">
        <Link href="/dashboard">Tilbage til dashboard</Link>
      </Button>
    </div>
  );
}
