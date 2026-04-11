"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitClinicCreationRequest } from "@/app/actions/create-clinic-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CityOption {
  id: string;
  bynavn: string;
  bynavn_slug: string;
  postal_codes: string[];
  distance?: number;
}

interface CreateClinicRequestPageProps {
  userProfile: {
    full_name: string;
    email: string;
  } | null;
  initialCity?: {
    id: string;
    name: string;
    slug: string;
    postalCode?: string;
  } | null;
}

export const CreateClinicRequestPage = ({
  userProfile,
  initialCity = null,
}: CreateClinicRequestPageProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const getPrimaryPostalCode = (city: CityOption | null) => city?.postal_codes?.[0] || "";
  const formatAddressSuffix = (city: CityOption | null) => {
    if (!city) return "Vælg by først";
    const primaryPostalCode = getPrimaryPostalCode(city);
    return primaryPostalCode
      ? `, ${city.bynavn} ${primaryPostalCode}`
      : `, ${city.bynavn}`;
  };
  const formatCitySelection = (city: CityOption) => {
    const primaryPostalCode = getPrimaryPostalCode(city);
    return primaryPostalCode ? `${primaryPostalCode} ${city.bynavn}` : city.bynavn;
  };

  const initialSelectedCity = initialCity
    ? {
        id: initialCity.id,
        bynavn: initialCity.name,
        bynavn_slug: initialCity.slug,
        postal_codes: initialCity.postalCode ? [initialCity.postalCode] : [],
      }
    : null;

  const selectedCity = initialSelectedCity;
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    clinic_name: "",
    address: "",
    requester_role: "",
    requester_name: userProfile?.full_name || "",
    requester_email: userProfile?.email || "",
    website: "",
  });


  const handleSubmitCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCity) {
      toast({
        title: "Vælg en by",
        description: "Du skal vælge en by, før du kan oprette en ny klinik.",
        variant: "destructive",
      });
      return;
    }

    const selectedPostalCode = getPrimaryPostalCode(selectedCity);
    if (!selectedPostalCode) {
      toast({
        title: "Postnummer mangler",
        description:
          "Vi kunne ikke finde et postnummer for den valgte by. Vælg en anden by eller prøv igen.",
        variant: "destructive",
      });
      return;
    }

    if (!createFormData.requester_email) {
      toast({
        title: "Email mangler",
        description:
          "Din brugerprofil mangler email. Opdater profilen og prøv igen.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const result = await submitClinicCreationRequest({
        clinic_name: createFormData.clinic_name,
        address: createFormData.address,
        postal_code: selectedPostalCode,
        city_id: selectedCity.id,
        city_name: selectedCity.bynavn,
        requester_name: createFormData.requester_name,
        requester_email: createFormData.requester_email,
        requester_role: createFormData.requester_role,
        website: createFormData.website,
      });

      if (result.error) {
        toast({
          title: "Fejl",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Anmodning indsendt",
        description:
          "Din anmodning om at oprette en ny klinik er sendt til godkendelse hos en administrator.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Uventet fejl",
        description: "Der opstod en fejl. Prøv igen senere.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  return (
    <div className="py-8 w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Opret ny klinik
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Udfyld oplysningerne. En administrator skal godkende klinikken, før den bliver aktiv.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Om klinikken</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitCreateRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clinic_name">Kliniknavn</Label>
              <Input
                id="clinic_name"
                value={createFormData.clinic_name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, clinic_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse (vej og nr)</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="space-y-2 flex-1">
                  <Input
                    id="address"
                    value={createFormData.address}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatAddressSuffix(selectedCity)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto rounded-full px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => router.push("/dashboard/claim")}
                  >
                    Skift by
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (valgfrit)</Label>
              <Input
                id="website"
                type="text"
                placeholder="www.din-klinik.dk"
                value={createFormData.website}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    website: e.target.value,
                  })
                }
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Om dig</CardTitle>
                <CardDescription>
                  Fortæl os kort om din rolle i klinikken
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requester_name">Dit fulde navn</Label>
                  <Input
                    id="requester_name"
                    value={createFormData.requester_name}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        requester_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requester_role">Din rolle i klinikken</Label>
                  <Input
                    id="requester_role"
                    value={createFormData.requester_role}
                    onChange={(e) =>
                      setCreateFormData({
                        ...createFormData,
                        requester_role: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div>
              <Button
                type="submit"
                className="rounded-full"
                disabled={isSubmittingCreate || !selectedCity}
              >
                {isSubmittingCreate ? "Indsender..." : "Opret din klinik"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
