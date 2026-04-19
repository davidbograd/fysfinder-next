// Dashboard page for clinic owners and admins.
// Updated: includes booking clicks in lead KPI totals and contribution breakdown.

import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mail, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";
import { AdminClaimsSection } from "@/components/dashboard/AdminClaimsSection";
import { AdminStatsSection } from "@/components/dashboard/AdminStatsSection";
import { AdminAnalyticsSection } from "@/components/dashboard/AdminAnalyticsSection";
import { UserClaimsSection } from "@/components/dashboard/UserClaimsSection";
import { getOwnedClinics } from "@/app/actions/clinic-management";
import { OwnedClinicCard } from "@/components/dashboard/OwnedClinicCard";
import {
  ClinicStats,
  getAllOwnedClinicAnalytics,
} from "@/app/actions/clinic-analytics";
import { getClinicDashboardUplift } from "@/app/actions/dashboard-uplift";
import { getUserClaims } from "@/app/actions/user-claims";
import { Suspense } from "react";
import { DashboardDevToolbar } from "@/components/dashboard/DashboardDevToolbar";
import type { ClinicProfileCompleteness } from "@/lib/clinic-profile-completeness";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface DashboardClaim {
  id: string;
  clinic_id: string;
  klinik_navn: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  clinics:
    | {
        clinics_id: string;
        klinikNavn: string;
        adresse: string | null;
        postnummer: number | null;
        lokation: string | null;
      }
    | {
        clinics_id: string;
        klinikNavn: string;
        adresse: string | null;
        postnummer: number | null;
        lokation: string | null;
      }[]
    | null;
}

interface DashboardOwnedClinic {
  clinics_id: string;
  klinikNavn: string;
  klinikNavnSlug: string;
  lokation: string | null;
  verified_klinik: boolean | null;
  hasActivePremium?: boolean;
  premiumCityNames?: string[];
  profileCompleteness: ClinicProfileCompleteness;
}

interface DashboardCreationRequest {
  id: string;
  clinic_name: string;
  address: string;
  postal_code: string;
  city_name: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_clinic_id: string | null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user is admin
  const isAdmin = isAdminEmail(user.email);

  // Get owned clinics
  const ownedClinicsResult = await getOwnedClinics();
  let ownedClinics: DashboardOwnedClinic[] =
    (ownedClinicsResult.clinics || []) as DashboardOwnedClinic[];

  const userClaimsResult = await getUserClaims();
  const userClaims: DashboardClaim[] = (userClaimsResult.claims || []) as DashboardClaim[];
  const userCreationRequests: DashboardCreationRequest[] =
    (userClaimsResult.creationRequests || []) as DashboardCreationRequest[];
  let pendingClaims = userClaims.filter((claim) => claim.status === "pending");
  let pendingCreationRequests = userCreationRequests.filter(
    (request) => request.status === "pending"
  );

  const analyticsResult =
    ownedClinics.length > 0 ? await getAllOwnedClinicAnalytics() : { stats: {} };
  const analyticsByClinic = analyticsResult.stats || ({} as Record<string, ClinicStats>);
  const analyticsTotals = Object.values(analyticsByClinic).reduce(
    (acc, stats) => {
      acc.profileViews += stats.profileViews || 0;
      acc.listImpressions += stats.listImpressions || 0;
      acc.phoneClicks += stats.phoneClicks || 0;
      acc.websiteClicks += stats.websiteClicks || 0;
      acc.emailClicks += stats.emailClicks || 0;
      acc.bookingClicks += stats.bookingClicks || 0;
      return acc;
    },
    {
      profileViews: 0,
      listImpressions: 0,
      phoneClicks: 0,
      websiteClicks: 0,
      emailClicks: 0,
      bookingClicks: 0,
    }
  );
  const isDevelopment = process.env.NODE_ENV !== "production";
  const isDevEmptyState =
    isDevelopment && resolvedSearchParams.dev_state === "empty";

  if (isDevEmptyState) {
    ownedClinics = [];
    pendingClaims = [];
    pendingCreationRequests = [];
    analyticsTotals.profileViews = 0;
    analyticsTotals.listImpressions = 0;
    analyticsTotals.phoneClicks = 0;
    analyticsTotals.websiteClicks = 0;
    analyticsTotals.emailClicks = 0;
    analyticsTotals.bookingClicks = 0;
  }

  const hasAnyClinics =
    ownedClinics.length > 0 ||
    pendingClaims.length > 0 ||
    pendingCreationRequests.length > 0;
  const hasAnyPremiumClinic = ownedClinics.some((clinic) => Boolean(clinic.verified_klinik));
  const totalClinicCount =
    ownedClinics.length + pendingClaims.length + pendingCreationRequests.length;
  const totalLeadClicks =
    analyticsTotals.phoneClicks +
    analyticsTotals.websiteClicks +
    analyticsTotals.emailClicks +
    analyticsTotals.bookingClicks;
  const totalViews = analyticsTotals.profileViews + analyticsTotals.listImpressions;
  const getShare = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;
  const phoneShare = getShare(analyticsTotals.phoneClicks, totalLeadClicks);
  const websiteShare = getShare(analyticsTotals.websiteClicks, totalLeadClicks);
  const emailShare = getShare(analyticsTotals.emailClicks, totalLeadClicks);
  const bookingShare = getShare(analyticsTotals.bookingClicks, totalLeadClicks);
  const listShare = getShare(analyticsTotals.listImpressions, totalViews);
  const profileShare = getShare(analyticsTotals.profileViews, totalViews);
  const upliftByClinic =
    ownedClinics.length > 0
      ? await Promise.all(
          ownedClinics.map((clinic) => getClinicDashboardUplift(clinic.clinics_id))
        )
      : [];
  const mergedCityOpportunity = upliftByClinic.reduce(
    (acc, result) => {
      if (!result.data) return acc;
      for (const row of result.data.cityActivity) {
        const existing = acc.get(row.cityName) || {
          cityName: row.cityName,
          homeLeadClicks: 0,
          homeViews: 0,
          neighborLeadClicks: 0,
          neighborViews: 0,
        };
        if (row.isHome) {
          existing.homeLeadClicks += row.leadClicks || 0;
          existing.homeViews += row.views || 0;
        } else {
          existing.neighborLeadClicks += row.leadClicks || 0;
          existing.neighborViews += row.views || 0;
        }
        acc.set(row.cityName, existing);
      }
      return acc;
    },
    new Map<
      string,
      {
        cityName: string;
        homeLeadClicks: number;
        homeViews: number;
        neighborLeadClicks: number;
        neighborViews: number;
      }
    >()
  );
  const cityOpportunityList = Array.from(mergedCityOpportunity.values());
  const homeCityNames = new Set(
    cityOpportunityList
      .filter((city) => city.homeLeadClicks > 0 || city.homeViews > 0)
      .map((city) => city.cityName)
  );
  const primaryUpgradeClinicId = ownedClinics[0]?.clinics_id || null;

  const formatAreaList = (areas: string[]) => {
    if (areas.length === 0) return "nabo-områder";
    if (areas.length === 1) return areas[0];
    if (areas.length === 2) return `${areas[0]} og ${areas[1]}`;
    return `${areas.slice(0, -1).join(", ")} og ${areas[areas.length - 1]}`;
  };

  const leadAreas = cityOpportunityList
    .map((city) => ({
      cityName: city.cityName,
      total: city.neighborLeadClicks,
    }))
    .filter((city) => city.total > 0 && !homeCityNames.has(city.cityName))
    .sort((a, b) => b.total - a.total)
    .map((city) => city.cityName);
  const viewsAreas = cityOpportunityList
    .map((city) => ({
      cityName: city.cityName,
      total: city.neighborViews,
    }))
    .filter((city) => city.total > 0 && !homeCityNames.has(city.cityName))
    .sort((a, b) => b.total - a.total)
    .map((city) => city.cityName);

  const leadOpportunityTotal = cityOpportunityList.reduce(
    (sum, city) => sum + city.neighborLeadClicks,
    0
  );
  const viewsOpportunityTotal = cityOpportunityList.reduce(
    (sum, city) => sum + city.neighborViews,
    0
  );

  const isDevWithData = isDevelopment && !isDevEmptyState;
  const hasLeadOpportunity = isDevWithData
    ? true
    : leadOpportunityTotal > 0;
  const hasViewsOpportunity = isDevWithData
    ? true
    : viewsOpportunityTotal > 0;
  const finalLeadOpportunityTotal = isDevWithData ? 26 : leadOpportunityTotal;
  const finalViewsOpportunityTotal = isDevWithData ? 540 : viewsOpportunityTotal;
  const finalLeadAreas = isDevWithData
    ? ["Aabenraa", "Rødekro", "Padborg"]
    : leadAreas;
  const finalViewsAreas = isDevWithData
    ? ["Aabenraa", "Rødekro", "Padborg"]
    : viewsAreas;
  return (
    <div className="py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
      </div>

      {/* Admin Banner */}
      {isAdmin && (
        <div className="mb-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                ADMINISTRATOR
              </h2>
              <p className="text-purple-100">
                Du er logget ind som administrator med fuld adgang
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Analytics Overview - Primary Section */}
        {ownedClinics.length > 0 && (
          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="flex h-full flex-col overflow-hidden">
              <CardContent className="flex-1 pt-6">
                <div>
                  <div className="space-y-1">
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-bold tracking-tight text-gray-900 tabular-nums">
                        {totalLeadClicks.toLocaleString("da-DK")}
                      </p>
                      <p className="text-xl font-medium tracking-tight text-gray-500">
                        Lead klik
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Viser reel interesse fra patienter tæt på en booking.
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <TooltipProvider delayDuration={100}>
                      <div className="relative h-5 w-full overflow-hidden rounded-full bg-brand-beige">
                        <div className="flex h-full w-full">
                          <Tooltip>
                            <TooltipTrigger
                              className="relative h-full bg-[#2f5fa7] cursor-help"
                              style={{
                                width: `${phoneShare}%`,
                              }}
                              aria-label="Vist tlf nummer andel"
                            />
                            <TooltipContent>
                              <p>
                                Vist tlf nummer {analyticsTotals.phoneClicks.toLocaleString("da-DK")} (
                                {phoneShare}%)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger
                              className="relative h-full bg-[#4f6ea8] cursor-help"
                              style={{
                                width: `${websiteShare}%`,
                              }}
                              aria-label="Website klik andel"
                            />
                            <TooltipContent>
                              <p>
                                Website klik {analyticsTotals.websiteClicks.toLocaleString("da-DK")} (
                                {websiteShare}%)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger
                              className="relative h-full bg-[#8fa6d6] cursor-help"
                              style={{
                                width: `${emailShare}%`,
                              }}
                              aria-label="Email klik andel"
                            />
                            <TooltipContent>
                              <p>
                                Email klik {analyticsTotals.emailClicks.toLocaleString("da-DK")} (
                                {emailShare}%)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger
                              className="relative h-full bg-[#b8c8e6] cursor-help"
                              style={{
                                width: `${bookingShare}%`,
                              }}
                              aria-label="Booking klik andel"
                            />
                            <TooltipContent>
                              <p>
                                Booking klik {analyticsTotals.bookingClicks.toLocaleString("da-DK")} (
                                {bookingShare}%)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </TooltipProvider>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-gray-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#2f5fa7]" />
                          <span className="px-2 font-medium text-gray-900 tabular-nums">
                            {analyticsTotals.phoneClicks.toLocaleString("da-DK")}
                          </span>
                          <span>Vist tlf nummer</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-gray-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#4f6ea8]" />
                          <span className="px-2 font-medium text-gray-900 tabular-nums">
                            {analyticsTotals.websiteClicks.toLocaleString("da-DK")}
                          </span>
                          <span>Website klik</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-gray-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#8fa6d6]" />
                          <span className="px-2 font-medium text-gray-900 tabular-nums">
                            {analyticsTotals.emailClicks.toLocaleString("da-DK")}
                          </span>
                          <span>Email klik</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center text-gray-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#b8c8e6]" />
                          <span className="px-2 font-medium text-gray-900 tabular-nums">
                            {analyticsTotals.bookingClicks.toLocaleString("da-DK")}
                          </span>
                          <span>Booking klik</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              {hasLeadOpportunity && !hasAnyPremiumClinic && (
                <div className="border-t border-logo-blue/20 bg-logo-blue/5 px-6 py-4">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2 text-sm font-semibold text-gray-900">
                      <TrendingUp className="mt-0.5 h-4 w-4 text-logo-blue" />
                      Du går glip af patienter
                    </p>
                    <p className="text-sm text-gray-700">
                      Der var {finalLeadOpportunityTotal.toLocaleString("da-DK")} klik til andre klinikker spredt over{" "}
                      {formatAreaList(finalLeadAreas)}.
                    </p>
                    <p className="text-sm text-gray-700">
                      Bliv synlig på flere byer og få flere patienter.
                    </p>
                    {primaryUpgradeClinicId ? (
                      <Button asChild type="button" size="sm" className="sm:shrink-0">
                        <Link href={`/dashboard/clinic/${primaryUpgradeClinicId}/premium`}>
                          Opgrader
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" size="sm" className="sm:shrink-0" disabled>
                        Opgrader
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card className="flex h-full flex-col overflow-hidden">
              <CardContent className="flex-1 pt-6">
                <div>
                  <div className="space-y-1">
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-bold tracking-tight text-gray-900 tabular-nums">
                        {totalViews.toLocaleString("da-DK")}
                      </p>
                      <p className="text-xl font-medium tracking-tight text-gray-500">
                        Visninger
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Så mange potentielle patienter har set din klinik.
                    </p>
                  </div>
                <div className="mt-6 space-y-3">
                  <TooltipProvider delayDuration={100}>
                    <div className="h-5 w-full overflow-hidden rounded-full bg-brand-beige">
                      <div className="flex h-full w-full">
                        <Tooltip>
                          <TooltipTrigger
                            className="h-full bg-[#8fa6d6] cursor-help border-r border-white/50"
                            style={{
                              width: `${listShare}%`,
                            }}
                            aria-label="Søgeresultat-visning andel"
                          />
                          <TooltipContent>
                            <p>
                              I søgeresultater {analyticsTotals.listImpressions.toLocaleString("da-DK")} (
                              {listShare}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger
                            className="h-full bg-[#2f5fa7] cursor-help"
                            style={{
                              width: `${profileShare}%`,
                            }}
                            aria-label="Klinikside-visning andel"
                          />
                          <TooltipContent>
                            <p>
                              På kliniksider {analyticsTotals.profileViews.toLocaleString("da-DK")} (
                              {profileShare}%)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TooltipProvider>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="flex items-center text-gray-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#8fa6d6]" />
                        <span className="px-2 font-medium text-gray-900 tabular-nums">
                          {analyticsTotals.listImpressions.toLocaleString("da-DK")}
                        </span>
                        <span>I søgeresultater</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="flex items-center text-gray-700">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#2f5fa7]" />
                        <span className="px-2 font-medium text-gray-900 tabular-nums">
                          {analyticsTotals.profileViews.toLocaleString("da-DK")}
                        </span>
                        <span>På kliniksider</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </CardContent>
              {hasViewsOpportunity && !hasAnyPremiumClinic && (
                <div className="border-t border-logo-blue/20 bg-logo-blue/5 px-6 py-4">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2 text-sm font-semibold text-gray-900">
                      <TrendingUp className="mt-0.5 h-4 w-4 text-logo-blue" />
                      Du går glip af patienter
                    </p>
                    <p className="text-sm text-gray-700">
                      Der var {finalViewsOpportunityTotal.toLocaleString("da-DK")} visninger af andre klinikker spredt over{" "}
                      {formatAreaList(finalViewsAreas)}.
                    </p>
                    <p className="text-sm text-gray-700">
                      Bliv synlig på flere byer og få flere patienter.
                    </p>
                    {primaryUpgradeClinicId ? (
                      <Button asChild type="button" size="sm" className="sm:shrink-0">
                        <Link href={`/dashboard/clinic/${primaryUpgradeClinicId}/premium`}>
                          Opgrader
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" size="sm" className="sm:shrink-0" disabled>
                        Opgrader
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>

          </div>
        )}

        {/* Admin Claims Section - Full Width for Admins */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <AdminClaimsSection />
          </div>
        )}

        {/* Admin Stats Section - Full Width for Admins */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <AdminStatsSection />
          </div>
        )}

        {/* Admin Analytics Section - Full Width for Admins */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <AdminAnalyticsSection />
          </div>
        )}

        {/* Divider after admin sections */}
        {isAdmin && (
          <div className="md:col-span-2 lg:col-span-3">
            <hr className="border-gray-200" />
          </div>
        )}

        {/* Your Clinics Section */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Dine klinikker</CardTitle>
              {hasAnyClinics && (
                <CardDescription className="mt-1">
                  {totalClinicCount} {totalClinicCount === 1 ? "klinik" : "klinikker"}
                </CardDescription>
              )}
            </div>
            {hasAnyClinics && (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/claim">Tilføj klinik</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {hasAnyClinics ? (
              <>
                {/* Owned Clinics — max two per row (half width each from md and up) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {ownedClinics.map((clinic) => (
                    <OwnedClinicCard key={clinic.clinics_id} clinic={clinic} />
                  ))}
                </div>
                {/* Pending Claims - displayed like clinic cards */}
                <UserClaimsSection
                  claims={userClaims}
                  creationRequests={userCreationRequests}
                />
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-4 text-sm text-gray-600">
                  Ingen tilknyttet klinikker. Tilføj en klinik og få flere patienter.
                </p>
                <Button asChild>
                  <Link href="/dashboard/claim">Tilknyt din klinik</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
            <CardDescription>Har du spørgsmål? Vi hjælper gerne</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Skriv til os, hvis du har spørgsmål eller har brug for hjælp.
              </p>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <Link
                  href="mailto:kontakt@fysfinder.dk"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  kontakt@fysfinder.dk
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
      {isDevelopment && (
        <Suspense fallback={null}>
          <DashboardDevToolbar />
        </Suspense>
      )}
    </div>
  );
}

