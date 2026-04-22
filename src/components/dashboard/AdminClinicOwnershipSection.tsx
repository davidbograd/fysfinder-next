// Admin dashboard UI for searching clinics/users and confirming ownership transfers.
"use client";

import { useMemo, useState } from "react";
import {
  getClinicOwnerForAdmin,
  searchClinicsForAdmin,
  searchUsersForAdmin,
  setClinicOwnerForAdmin,
} from "@/app/actions/admin-clinic-owners";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, Search, UserCheck, UserRound } from "lucide-react";

interface ClinicSearchResult {
  clinics_id: string;
  klinikNavn: string;
  lokation: string | null;
  adresse: string | null;
  postnummer: number | null;
}

interface UserSearchResult {
  id: string;
  full_name: string;
  email: string;
}

interface CurrentOwnerState {
  owner: {
    userId: string;
    fullName: string | null;
    email: string | null;
  } | null;
  ownerCount: number;
}

export function AdminClinicOwnershipSection() {
  const { toast } = useToast();

  const [clinicQuery, setClinicQuery] = useState("");
  const [clinicResults, setClinicResults] = useState<ClinicSearchResult[]>([]);
  const [isSearchingClinics, setIsSearchingClinics] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicSearchResult | null>(null);
  const [ownerState, setOwnerState] = useState<CurrentOwnerState | null>(null);
  const [isLoadingOwner, setIsLoadingOwner] = useState(false);

  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canTransfer = Boolean(selectedClinic && selectedUser);
  const selectedClinicAddress = useMemo(() => {
    if (!selectedClinic) {
      return "";
    }
    const cityAndPostal = [selectedClinic.postnummer, selectedClinic.lokation]
      .filter(Boolean)
      .join(" ");
    return [selectedClinic.adresse, cityAndPostal].filter(Boolean).join(", ");
  }, [selectedClinic]);

  const handleClinicSearch = async () => {
    const trimmedQuery = clinicQuery.trim();
    if (!trimmedQuery) {
      setClinicResults([]);
      return;
    }

    setIsSearchingClinics(true);
    try {
      const result = await searchClinicsForAdmin(trimmedQuery);
      if ("error" in result) {
        toast({
          title: "Fejl ved søgning",
          description: result.error,
          variant: "destructive",
        });
        setClinicResults([]);
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
    } finally {
      setIsSearchingClinics(false);
    }
  };

  const handleClinicSelect = async (clinic: ClinicSearchResult) => {
    setSelectedClinic(clinic);
    setSelectedUser(null);
    setUserResults([]);
    setIsLoadingOwner(true);
    try {
      const ownerResult = await getClinicOwnerForAdmin(clinic.clinics_id);
      if ("error" in ownerResult) {
        toast({
          title: "Fejl",
          description: ownerResult.error,
          variant: "destructive",
        });
        setOwnerState({ owner: null, ownerCount: 0 });
        return;
      }
      setOwnerState(ownerResult);
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke hente nuværende ejer",
        variant: "destructive",
      });
      setOwnerState({ owner: null, ownerCount: 0 });
    } finally {
      setIsLoadingOwner(false);
    }
  };

  const handleUserSearch = async () => {
    const trimmedQuery = userQuery.trim();
    if (!trimmedQuery) {
      setUserResults([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const result = await searchUsersForAdmin(trimmedQuery);
      if ("error" in result) {
        toast({
          title: "Fejl ved søgning",
          description: result.error,
          variant: "destructive",
        });
        setUserResults([]);
        return;
      }
      setUserResults(result.users);
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Kunne ikke søge efter brugere",
        variant: "destructive",
      });
      setUserResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedClinic || !selectedUser) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await setClinicOwnerForAdmin({
        clinicId: selectedClinic.clinics_id,
        newOwnerUserId: selectedUser.id,
      });
      if ("error" in result) {
        toast({
          title: "Kunne ikke opdatere ejerskab",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Ejerskab opdateret",
        description: `${selectedClinic.klinikNavn} ejes nu af ${selectedUser.full_name}.`,
      });
      setIsConfirmOpen(false);

      const refreshedOwner = await getClinicOwnerForAdmin(selectedClinic.clinics_id);
      if ("error" in refreshedOwner) {
        return;
      }
      setOwnerState(refreshedOwner);
    } catch {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl under opdatering af ejerskab",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Klinik-ejerskab</CardTitle>
        <CardDescription>
          Vælg en klinik og overdrag ejerskab til én bruger. Hver klinik har kun én ejer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
          <section className="space-y-4 rounded-xl border bg-gray-50/60 p-4">
            <h3 className="text-base font-semibold text-gray-900">Vælg klinik</h3>
            <Label htmlFor="clinic-owner-clinic-search">Søg klinik</Label>
            <div className="flex gap-3">
              <Input
                id="clinic-owner-clinic-search"
                value={clinicQuery}
                onChange={(event) => setClinicQuery(event.target.value)}
                placeholder="Søg på kliniknavn eller by"
                aria-label="Søg efter klinik"
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

            <div className="grid gap-2">
              {clinicResults.map((clinic) => (
                <button
                  key={clinic.clinics_id}
                  type="button"
                  onClick={() => handleClinicSelect(clinic)}
                  className="flex min-h-10 items-center justify-between rounded-full border bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{clinic.klinikNavn}</span>
                  <span className="text-sm text-gray-500">{clinic.lokation || "Ukendt by"}</span>
                </button>
              ))}
            </div>

            {selectedClinic && (
              <div className="space-y-4 rounded-xl border bg-white p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Valgt klinik</p>
                  <p className="text-base font-semibold text-gray-900">{selectedClinic.klinikNavn}</p>
                  {selectedClinicAddress && (
                    <p className="text-sm text-gray-600">{selectedClinicAddress}</p>
                  )}
                </div>

                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="mb-1 text-sm font-medium text-gray-500">Nuværende ejer</p>
                  {isLoadingOwner ? (
                    <p className="flex items-center text-sm text-gray-600">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Henter ejer...
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {ownerState?.owner ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">
                            {ownerState.owner.fullName || ownerState.owner.userId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: {ownerState.owner.email || "Ukendt bruger-email"}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          Ingen ejer er tilknyttet endnu
                        </p>
                      )}
                      {(ownerState?.ownerCount || 0) > 1 && (
                        <Badge
                          variant="outline"
                          className="rounded-full border-amber-300 bg-amber-50 text-amber-800"
                        >
                          Der er {ownerState?.ownerCount} ejere registreret nu. Overdragelsen rydder op
                          til én ejer.
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <div className="flex items-center justify-center py-2 md:h-full md:py-0">
            <div className="rounded-full border bg-white p-2 shadow-sm">
              <ArrowRight className="h-4 w-4 text-gray-600" />
            </div>
          </div>

          <section className="space-y-4 rounded-xl border bg-brand-beige/40 p-4">
            <h3 className="text-base font-semibold text-gray-900">Hvem skal være den nye ejer?</h3>
            <Label htmlFor="clinic-owner-user-search">Søg bruger</Label>
            <div className="flex gap-3">
              <Input
                id="clinic-owner-user-search"
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
                placeholder="Søg på navn eller email"
                disabled={!selectedClinic}
                aria-label="Søg efter bruger"
              />
              <Button
                type="button"
                onClick={handleUserSearch}
                disabled={!selectedClinic || isSearchingUsers}
              >
                {isSearchingUsers ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Søg</span>
              </Button>
            </div>
            <div className="grid gap-2">
              {userResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className="flex min-h-10 items-center justify-between rounded-full border bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-900">{user.full_name}</span>
                  <span className="text-sm text-gray-600">{user.email}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="mb-2 text-sm font-medium text-gray-500">Ny ejer</p>
              {selectedUser ? (
                <p className="flex items-center text-sm font-medium text-gray-900">
                  <UserCheck className="mr-2 h-4 w-4 text-green-700" />
                  {selectedUser.full_name} ({selectedUser.email})
                </p>
              ) : (
                <p className="flex items-center text-sm text-gray-600">
                  <UserRound className="mr-2 h-4 w-4" />
                  Ingen bruger valgt endnu
                </p>
              )}
            </div>
          </section>
        </div>

        <Button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!canTransfer}
          className="w-full"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Bekræft overdragelse
        </Button>
      </CardContent>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekræft ejerskift</DialogTitle>
            <DialogDescription>
              Denne handling erstatter den nuværende ejer og gør den valgte bruger til eneste ejer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Klinik:</span> {selectedClinic?.klinikNavn}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Ny ejer:</span> {selectedUser?.full_name} (
              {selectedUser?.email})
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSaving}
            >
              Annuller
            </Button>
            <Button type="button" onClick={handleTransfer} disabled={isSaving || !canTransfer}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gemmer...
                </>
              ) : (
                "Ja, overdrag ejerskab"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
