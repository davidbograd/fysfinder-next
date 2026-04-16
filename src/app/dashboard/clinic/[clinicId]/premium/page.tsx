// Premium upgrade page for a clinic.
// Added: explains value and starts Stripe Checkout for owned clinics.

import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumCheckoutButton } from "@/components/dashboard/PremiumCheckoutButton";
import { PremiumLocationPicker } from "@/components/dashboard/PremiumLocationPicker";
import { getPremiumUpgradeContext } from "@/app/actions/premium-upgrade";

interface PremiumClinicPageProps {
  params: Promise<{ clinicId: string }>;
  searchParams: Promise<{ canceled?: string; selectedCityIds?: string }>;
}

export default async function PremiumClinicPage({
  params,
  searchParams,
}: PremiumClinicPageProps) {
  const { clinicId } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const contextResult = await getPremiumUpgradeContext(clinicId);
  if (contextResult.error || !contextResult.data) {
    redirect("/dashboard");
  }

  const { clinicName, cityOptions, hasActivePremium, selectedCityIds } = contextResult.data;
  const preselectedNeighborCityIds = resolvedSearchParams.selectedCityIds
    ? resolvedSearchParams.selectedCityIds
        .split(",")
        .map((cityId) => cityId.trim())
        .filter(Boolean)
    : selectedCityIds;

  return (
    <div className="py-8 w-full max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Få flere patienter med Fysfinder Premium</h1>
        <p className="text-sm text-gray-600 mt-2">
          Opgrader <strong>{clinicName}</strong> og bliv mere synlig.
        </p>
      </div>

      {resolvedSearchParams.canceled === "1" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6 text-sm text-amber-900">
            Betalingen blev annulleret. Du kan starte igen, når du er klar.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="rounded-md border bg-muted/30 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">Fysfinder Premium, {clinicName}</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              499 DKK <span className="text-sm font-normal text-gray-500">/ måned</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Det får du</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-emerald-600" />
              Synlig øverst i 3 byer: din hjemby + 2 nabobyer
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-emerald-600" />
              Få flere besøg med et design, der skiller sig ud
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-emerald-600" />
              Booking link direkte til din kalender
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-emerald-600" />
              Vis dit team frem og skab tillid
            </li>
          </ul>

          {!hasActivePremium ? (
            <div className="space-y-2">
              <PremiumCheckoutButton
                clinicId={clinicId}
                cityOptions={cityOptions}
                initiallySelectedCityIds={preselectedNeighborCityIds}
              />
              <p className="text-xs text-gray-500">
                Vi har tilfredshedsgaranti og ingen bindingsperiode.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-700 font-medium">
                Din premium-adgang er allerede aktiv.
              </p>
              <PremiumLocationPicker
                clinicId={clinicId}
                cityOptions={cityOptions}
                initiallySelectedCityIds={selectedCityIds}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="ghost">
        <Link href="/dashboard">Tilbage til dashboard</Link>
      </Button>
    </div>
  );
}
