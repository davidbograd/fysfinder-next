// Admin UI for premium subscriptions: overview of every premium listing plus
// manual add/remove. Stripe-backed listings are shown but their period is
// owned by Stripe, so removing one only ends access here.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getPremiumListingsForAdmin,
  grantPremiumForAdmin,
  revokePremiumForAdmin,
} from "@/app/actions/admin-premium";
import { searchClinicsForAdmin } from "@/app/actions/admin-clinic-owners";
import {
  PREMIUM_GRANT_PRESET_MONTHS,
  type AdminPremiumListing,
} from "@/lib/admin-premium";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CreditCard, Info, Loader2, Plus, Search } from "lucide-react";

interface ClinicSearchResult {
  clinics_id: string;
  klinikNavn: string;
  lokation: string | null;
  adresse: string | null;
  postnummer: number | null;
}

const dateFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Ukendt dato";
  return dateFormatter.format(parsed);
}

// By- og specialesider er ISR-cachet i 24 timer, så en ændring her er ikke
// synlig i søgeresultaterne med det samme.
function CacheDelayNote() {
  return (
    <p className="flex items-start gap-2 text-xs text-gray-500">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        Der kan gå op til 24 timer, før ændringen slår igennem i søgeresultaterne på
        bysiderne. Klinikkens egen side opdateres med det samme.
      </span>
    </p>
  );
}

export function AdminPremiumSection() {
  const { toast } = useToast();

  const [listings, setListings] = useState<AdminPremiumListing[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  const [clinicQuery, setClinicQuery] = useState("");
  const [clinicResults, setClinicResults] = useState<ClinicSearchResult[]>([]);
  const [isSearchingClinics, setIsSearchingClinics] = useState(false);
  const [isClinicPopoverOpen, setIsClinicPopoverOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicSearchResult | null>(null);
  const clinicSearchContainerRef = useRef<HTMLDivElement | null>(null);

  const [selectedMonths, setSelectedMonths] = useState<number | null>(12);
  const [customEndDate, setCustomEndDate] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const [listingPendingRemoval, setListingPendingRemoval] =
    useState<AdminPremiumListing | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadListings = useCallback(async () => {
    try {
      const result = await getPremiumListingsForAdmin();
      if ("error" in result) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      setListings(result.listings);
      setActiveCount(result.activeCount);
      setExpiredCount(result.expiredCount);
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke hente premium-abonnementer",
        variant: "destructive",
      });
    } finally {
      setIsLoadingListings(false);
    }
  }, [toast]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    const handleOutsideMouseDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (
        clinicSearchContainerRef.current &&
        !clinicSearchContainerRef.current.contains(targetNode)
      ) {
        setIsClinicPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, []);

  const handleClinicSearch = async () => {
    const trimmedQuery = clinicQuery.trim();
    if (!trimmedQuery) {
      setClinicResults([]);
      setIsClinicPopoverOpen(false);
      return;
    }

    setIsSearchingClinics(true);
    setIsClinicPopoverOpen(true);
    try {
      const result = await searchClinicsForAdmin(trimmedQuery);
      if ("error" in result) {
        toast({
          title: "Fejl ved søgning",
          description: result.error,
          variant: "destructive",
        });
        setClinicResults([]);
        setIsClinicPopoverOpen(false);
        return;
      }
      setClinicResults(result.clinics);
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke søge efter klinikker",
        variant: "destructive",
      });
      setClinicResults([]);
      setIsClinicPopoverOpen(false);
    } finally {
      setIsSearchingClinics(false);
    }
  };

  const handleGrant = async () => {
    if (!selectedClinic) return;

    setIsGranting(true);
    try {
      const result = await grantPremiumForAdmin({
        clinicId: selectedClinic.clinics_id,
        durationMonths: customEndDate ? null : selectedMonths,
        customEndDate: customEndDate || null,
      });

      if ("error" in result) {
        toast({
          title: "Kunne ikke tilføje premium",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: result.extended ? "Premium forlænget" : "Premium tilføjet",
        description: `${result.clinicName} har premium til og med ${formatDate(result.endDate)}.`,
      });

      setSelectedClinic(null);
      setClinicQuery("");
      setClinicResults([]);
      setCustomEndDate("");
      setSelectedMonths(12);
      await loadListings();
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl under tilføjelse af premium",
        variant: "destructive",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevoke = async () => {
    if (!listingPendingRemoval) return;

    setIsRevoking(true);
    try {
      const result = await revokePremiumForAdmin({
        listingId: listingPendingRemoval.listingId,
      });

      if ("error" in result) {
        toast({
          title: "Kunne ikke fjerne premium",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Premium fjernet",
        description: result.hadStripeSubscription
          ? `${result.clinicName} har ikke længere premium. Stripe-abonnementet kører stadig - annuller det i Stripe, ellers giver næste betaling premium igen.`
          : `${result.clinicName} har ikke længere premium.`,
        variant: result.hadStripeSubscription ? "destructive" : "default",
      });

      setListingPendingRemoval(null);
      await loadListings();
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl under fjernelse af premium",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tilføj premium</CardTitle>
          <CardDescription>
            Giv en klinik premium uden betaling, f.eks. som prøveperiode eller aftale.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 rounded-xl border bg-gray-50/60 p-4">
            <Label htmlFor="admin-premium-clinic-search">Søg klinik</Label>
            <div className="relative" ref={clinicSearchContainerRef}>
              <div className="flex gap-3">
                <Input
                  id="admin-premium-clinic-search"
                  value={clinicQuery}
                  onChange={(event) => setClinicQuery(event.target.value)}
                  placeholder="Søg på kliniknavn eller by"
                  aria-label="Søg efter klinik"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleClinicSearch();
                    }
                  }}
                  onFocus={() => {
                    if (clinicResults.length > 0 || isSearchingClinics) {
                      setIsClinicPopoverOpen(true);
                    }
                  }}
                />
                <Button type="button" onClick={handleClinicSearch} disabled={isSearchingClinics}>
                  {isSearchingClinics ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Søg</span>
                </Button>
              </div>

              {isClinicPopoverOpen && (
                <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border bg-white p-2 shadow-lg">
                  {isSearchingClinics ? (
                    <p className="flex items-center px-2 py-2 text-sm text-gray-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Søger klinikker...
                    </p>
                  ) : clinicResults.length > 0 ? (
                    <div className="grid gap-2">
                      {clinicResults.map((clinic) => (
                        <button
                          key={clinic.clinics_id}
                          type="button"
                          onClick={() => {
                            setSelectedClinic(clinic);
                            setIsClinicPopoverOpen(false);
                          }}
                          className="flex min-h-10 items-center justify-between rounded-full border bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{clinic.klinikNavn}</span>
                          <span className="text-sm text-gray-500">
                            {clinic.lokation || "Ukendt by"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-2 text-sm text-gray-600">
                      Ingen klinikker matcher din søgning
                    </p>
                  )}
                </div>
              )}
            </div>

            {selectedClinic && (
              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm font-medium text-gray-500">Valgt klinik</p>
                <p className="text-base font-semibold text-gray-900">
                  {selectedClinic.klinikNavn}
                </p>
                {selectedClinic.lokation && (
                  <p className="text-sm text-gray-600">{selectedClinic.lokation}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-xl border bg-gray-50/60 p-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Periode</h3>
              <p className="text-sm text-gray-600">
                Premium starter i dag og slutter automatisk, når perioden er udløbet.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PREMIUM_GRANT_PRESET_MONTHS.map((months) => {
                const isSelected = !customEndDate && selectedMonths === months;
                return (
                  <Button
                    key={months}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedMonths(months);
                      setCustomEndDate("");
                    }}
                  >
                    {months} {months === 1 ? "måned" : "måneder"}
                  </Button>
                );
              })}
            </div>

            <div className="max-w-xs space-y-2">
              <Label htmlFor="admin-premium-custom-end-date">Eller vælg en slutdato</Label>
              <Input
                id="admin-premium-custom-end-date"
                type="date"
                value={customEndDate}
                onChange={(event) => {
                  setCustomEndDate(event.target.value);
                  setSelectedMonths(event.target.value ? null : 12);
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleGrant}
              disabled={!selectedClinic || isGranting}
              className="w-full"
            >
              {isGranting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tilføjer...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tilføj premium
                </>
              )}
            </Button>
            <CacheDelayNote />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            Klinikker med premium
          </CardTitle>
          <CardDescription className="tabular-nums">
            {activeCount} {activeCount === 1 ? "aktiv" : "aktive"} · {expiredCount} udløbet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingListings ? (
            <div className="flex justify-center py-12">
              <Spinner size="md" className="text-gray-400" />
            </div>
          ) : listings.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-600">
              Ingen klinikker har premium endnu.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Klinik</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Byer</TableHead>
                  <TableHead>Kilde</TableHead>
                  <TableHead>
                    <span className="sr-only">Handling</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.listingId}>
                    <TableCell>
                      {listing.clinicSlug ? (
                        <Link
                          href={`/klinik/${listing.clinicSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {listing.clinicName}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">{listing.clinicName}</span>
                      )}
                      {listing.location && (
                        <p className="text-sm text-gray-500">{listing.location}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {listing.isActive ? (
                        <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Udløbet</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-700 tabular-nums">
                      {formatDate(listing.startDate)} – {formatDate(listing.endDate)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {listing.cityNames.length > 0 ? listing.cityNames.join(", ") : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {listing.isStripeManaged ? "Stripe" : "Manuel"}
                    </TableCell>
                    <TableCell>
                      {listing.isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Fjern premium for ${listing.clinicName}`}
                          onClick={() => setListingPendingRemoval(listing)}
                        >
                          Fjern
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(listingPendingRemoval)}
        onOpenChange={(open) => {
          if (!open) setListingPendingRemoval(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fjern premium</DialogTitle>
            <DialogDescription>
              {listingPendingRemoval?.clinicName} mister premium-placeringer med det samme.
            </DialogDescription>
          </DialogHeader>

          {listingPendingRemoval?.isStripeManaged && (
            <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Klinikken betaler via Stripe. Abonnementet bliver ikke annulleret her, så
                klinikken bliver faktureret igen - og næste betaling giver premium tilbage.
                Annuller abonnementet i Stripe for at stoppe det helt.
              </p>
            </div>
          )}

          <CacheDelayNote />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setListingPendingRemoval(null)}
              disabled={isRevoking}
            >
              Annuller
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fjerner...
                </>
              ) : (
                "Ja, fjern premium"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
