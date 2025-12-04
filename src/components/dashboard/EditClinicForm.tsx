"use client";

/**
 * Edit Clinic Form Component
 * Allows clinic owners to edit their clinic data including:
 * - Basic info (email, tlf, website, adresse, lokation)
 * - Opening hours (mandag-søndag)
 * - Services (hjemmetræning, holdtræning, parkering, handicapadgang)
 * - Pricing (førsteKons, opfølgning)
 * - Specialties (max 10)
 * - Insurances (all selected by default)
 * Note: klinikNavn and postnummer are NOT editable
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/app/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  updateClinic,
  updateClinicSpecialties,
  updateClinicInsurances,
  updateClinicTeamMembers,
} from "@/app/actions/clinic-management";
import { Loader2, Mail, Phone, Globe, Plus, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface EditClinicFormProps {
  clinic: any;
  specialties: Array<{ specialty_id: string; specialty_name: string }>;
  insurances: Array<{ insurance_id: string; insurance_name: string }>;
  teamMembers: Array<{ id: string; name: string; role: string; image_url: string; display_order: number }>;
}

interface TeamMemberForm {
  id?: string;
  name: string;
  role: string;
  image_url: string;
  display_order: number;
}

export const EditClinicForm = ({ clinic, specialties, insurances, teamMembers: initialTeamMembers }: EditClinicFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Extract current clinic data
  const currentSpecialties = (clinic.clinic_specialties || []).map(
    (cs: any) => {
      const specialty = Array.isArray(cs.specialty) ? cs.specialty[0] : cs.specialty;
      return specialty?.specialty_id;
    }
  ).filter(Boolean);

  const currentInsurances = (clinic.clinic_insurances || []).map(
    (ci: any) => {
      const insurance = Array.isArray(ci.insurance) ? ci.insurance[0] : ci.insurance;
      return insurance?.insurance_id;
    }
  ).filter(Boolean);

  // Form state
  // Clean phone number on load - remove +45 if present
  const initialPhone = clinic.tlf || "";
  const cleanInitialPhone = initialPhone.startsWith("+45") 
    ? initialPhone.replace(/^\+45\s*/, "").trim() 
    : initialPhone;
  
  const [formData, setFormData] = useState({
    email: clinic.email || "",
    tlf: cleanInitialPhone,
    website: clinic.website || "",
    adresse: clinic.adresse || "",
    lokation: clinic.lokation || "",
    mandag: clinic.mandag || "",
    tirsdag: clinic.tirsdag || "",
    onsdag: clinic.onsdag || "",
    torsdag: clinic.torsdag || "",
    fredag: clinic.fredag || "",
    lørdag: clinic.lørdag || "",
    søndag: clinic.søndag || "",
    hjemmetræning: clinic.hjemmetræning || "",
    holdtræning: clinic.holdtræning || "",
    parkering: clinic.parkering || "",
    handicapadgang: clinic.handicapadgang ?? null,
    ydernummer: clinic.ydernummer ?? null,
    førsteKons: clinic.førsteKons || "",
    opfølgning: clinic.opfølgning || "",
    første_kons_minutter: clinic.første_kons_minutter?.toString() || "60",
    opfølgning_minutter: clinic.opfølgning_minutter?.toString() || "30",
    om_os: clinic.om_os || "",
    online_fysioterapeut: clinic.online_fysioterapeut ?? false,
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(currentSpecialties);
  // For insurance UX: when not accepting all, we select the ones NOT accepted (exclusions)
  // Initialize exclusions from current data: if not all are accepted, exclusions = all - accepted
  const initialExcludedInsurances = (() => {
    if (currentInsurances.length === 0) return [] as string[]; // treat as accepts all by default
    const allIds = insurances.map((i) => i.insurance_id);
    const isAll = allIds.length > 0 && allIds.every((id) => currentInsurances.includes(id));
    return isAll ? [] : allIds.filter((id) => !currentInsurances.includes(id));
  })();
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>(initialExcludedInsurances);
  
  // Check if all insurances are currently selected (to determine default "accepts all")
  const allInsuranceIds = insurances.map((i) => i.insurance_id);
  const hasAllInsurances = allInsuranceIds.length > 0 && 
    allInsuranceIds.every((id) => currentInsurances.includes(id));
  
  // State for "accepts all insurances" - default to true if all are selected, otherwise false
  const [acceptsAllInsurances, setAcceptsAllInsurances] = useState<boolean>(
    hasAllInsurances || currentInsurances.length === 0 // true means accepts all; otherwise false
  );
  
  // State for "has ydernummer" - no default, use current value or null
  const [hasYdernummer, setHasYdernummer] = useState<string>(
    clinic.ydernummer === true ? "yes" : clinic.ydernummer === false ? "no" : ""
  );
  
  // Track which team member image is uploading
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);
  
  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMemberForm[]>(
    initialTeamMembers.length > 0
      ? initialTeamMembers.map((tm) => ({
          id: tm.id,
          name: tm.name,
          role: tm.role,
          image_url: tm.image_url,
          display_order: tm.display_order,
        }))
      : [
          {
            name: "",
            role: "",
            image_url: "",
            display_order: 1,
          },
        ]
  );

  const handleInputChange = (field: string, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(specialtyId)) {
        return prev.filter((id) => id !== specialtyId);
      } else {
        if (prev.length >= 10) {
          toast({
            title: "Maksimum nået",
            description: "Du kan maksimalt vælge 10 specialiteter",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, specialtyId];
      }
    });
  };

  const handleInsuranceToggle = (insuranceId: string) => {
    setSelectedInsurances((prev) => {
      if (prev.includes(insuranceId)) {
        return prev.filter((id) => id !== insuranceId);
      } else {
        return [...prev, insuranceId];
      }
    });
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMemberForm, value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddTeamMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      {
        name: "",
        role: "",
        image_url: "",
        display_order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Update display_order for remaining members
      return updated.map((member, i) => ({
        ...member,
        display_order: i + 1,
      }));
    });
  };

  const handleImageUpload = async (index: number, file: File) => {
    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Ugyldigt filtype",
        description: "Kun JPEG, PNG eller WEBP billeder er tilladt",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "Fil for stor",
        description: "Billedet må maksimalt være 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingImageIndex(index);

    try {
      const supabase = createClient();
      
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${clinic.clinics_id}/${Date.now()}-${index}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("clinic-team-pics")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          error: uploadError,
          fileName,
          clinicId: clinic.clinics_id,
        });
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("clinic-team-pics").getPublicUrl(fileName);

      // Update the team member's image_url
      handleTeamMemberChange(index, "image_url", publicUrl);

      toast({
        title: "Billede uploadet",
        description: "Billedet er blevet uploadet",
      });
    } catch (error: any) {
      setUploadingImageIndex(null);
      console.error("Error uploading image:", error);
      
      // More detailed error message
      let errorMessage = "Kunne ikke uploade billedet";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
      
      toast({
        title: "Fejl ved upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update clinic basic data
      // Note: lokation and postnummer are NOT included as they cannot be changed
      // Clean phone number - remove +45 if present
      let cleanPhone = formData.tlf || null;
      if (cleanPhone && cleanPhone.startsWith("+45")) {
        cleanPhone = cleanPhone.replace(/^\+45\s*/, "").trim() || null;
      }
      
      const updateData: any = {
        email: formData.email || null,
        tlf: cleanPhone,
        website: formData.website || null,
        adresse: formData.adresse || null,
        mandag: formData.mandag || null,
        tirsdag: formData.tirsdag || null,
        onsdag: formData.onsdag || null,
        torsdag: formData.torsdag || null,
        fredag: formData.fredag || null,
        lørdag: formData.lørdag || null,
        søndag: formData.søndag || null,
        hjemmetræning: formData.hjemmetræning || null,
        holdtræning: formData.holdtræning || null,
        parkering: formData.parkering || null,
        handicapadgang: formData.handicapadgang,
        ydernummer: hasYdernummer === "yes",
        førsteKons: hasYdernummer === "no" ? (formData.førsteKons || null) : null,
        opfølgning: hasYdernummer === "no" ? (formData.opfølgning || null) : null,
        første_kons_minutter: hasYdernummer === "no" && formData.første_kons_minutter ? parseInt(formData.første_kons_minutter) : null,
        opfølgning_minutter: hasYdernummer === "no" && formData.opfølgning_minutter ? parseInt(formData.opfølgning_minutter) : null,
        om_os: formData.om_os || null,
        online_fysioterapeut: formData.online_fysioterapeut,
      };

      const clinicUpdateResult = await updateClinic(clinic.clinics_id, updateData);
      if (clinicUpdateResult.error) {
        throw new Error(clinicUpdateResult.error);
      }

      // Update specialties
      const specialtiesResult = await updateClinicSpecialties(
        clinic.clinics_id,
        selectedSpecialties
      );
      if (specialtiesResult.error) {
        throw new Error(specialtiesResult.error);
      }

      // Update team members (filter out empty ones and ensure image_url is not empty)
      const validTeamMembers = teamMembers
        .filter(
          (member) => member.name.trim() !== "" && member.role.trim() !== ""
        )
        .map((member) => ({
          ...member,
          image_url: member.image_url.trim() || "", // Ensure image_url is at least empty string, not null
        }));
      const teamMembersResult = await updateClinicTeamMembers(
        clinic.clinics_id,
        validTeamMembers
      );
      if (teamMembersResult.error) {
        throw new Error(teamMembersResult.error);
      }

      // Update insurances
      // If "accepts all" is true, submit all insurance IDs
      // If "no", user selected EXCLUDED insurances; submit accepted = all - excluded
      const insuranceIdsToSubmit = acceptsAllInsurances
        ? allInsuranceIds
        : allInsuranceIds.filter((id) => !selectedInsurances.includes(id));
      
      const insurancesResult = await updateClinicInsurances(
        clinic.clinics_id,
        insuranceIdsToSubmit
      );
      if (insurancesResult.error) {
        throw new Error(insurancesResult.error);
      }

      toast({
        title: "Klinik opdateret",
        description: "Din kliniks oplysninger er blevet opdateret",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Fejl",
        description: error.message || "Kunne ikke opdatere klinik",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Grundlæggende information</CardTitle>
          <CardDescription>Kontaktoplysninger og lokation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="klinikNavn">Klinik navn</Label>
            <Input
              id="klinikNavn"
              value={clinic.klinikNavn || ""}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lokation">Lokation</Label>
              <Input
                id="lokation"
                value={clinic.lokation || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postnummer">Postnummer</Label>
              <Input
                id="postnummer"
                value={clinic.postnummer?.toString() || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>
          <div className="pt-2 pb-4">
            <p className="text-sm text-gray-600">
              <strong>Bemærk:</strong> Klinik navn og postnummer kan ikke ændres her. Kontakt os hvis du har brug for at opdatere disse oplysninger.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tlf" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                Telefon
              </Label>
              <div className="flex gap-2">
                <Input
                  value="+45"
                  disabled
                  className="w-16 bg-gray-50 text-center"
                />
                <Input
                  id="tlf"
                  type="tel"
                  value={formData.tlf}
                  onChange={(e) => {
                    // Remove +45 if user types it
                    let value = e.target.value;
                    if (value.startsWith("+45")) {
                      value = value.replace(/^\+45\s*/, "");
                    }
                    handleInputChange("tlf", value);
                  }}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
              />
            </div>
          </div>
          {/* Priser (moved into Grundlæggende information) */}
          <div className="space-y-4 pt-6 border-t">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Har klinikken ydernummer?
              </Label>
              <RadioGroup
                value={hasYdernummer}
                onValueChange={(value) => {
                  setHasYdernummer(value);
                  handleInputChange("ydernummer", value === "yes");
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="ydernummer-yes" />
                  <Label htmlFor="ydernummer-yes" className="cursor-pointer">
                    Ja
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="ydernummer-no" />
                  <Label htmlFor="ydernummer-no" className="cursor-pointer">
                    Nej
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {hasYdernummer === "no" && (
              <div className="space-y-4 pt-2 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="førsteKons">Pris, første konsultation (DKK)</Label>
                    <Input
                      id="førsteKons"
                      value={formData.førsteKons}
                      onChange={(e) => handleInputChange("førsteKons", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="første_kons_minutter">Varighed, første konsultation (Minutter)</Label>
                    <Input
                      id="første_kons_minutter"
                      type="number"
                      min="5"
                      max="180"
                      value={formData.første_kons_minutter}
                      onChange={(e) => handleInputChange("første_kons_minutter", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opfølgning">Pris, opfølgning (DKK)</Label>
                    <Input
                      id="opfølgning"
                      value={formData.opfølgning}
                      onChange={(e) => handleInputChange("opfølgning", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opfølgning_minutter">Varighed, opfølgning (Minutter)</Label>
                    <Input
                      id="opfølgning_minutter"
                      type="number"
                      min="5"
                      max="180"
                      value={formData.opfølgning_minutter}
                      onChange={(e) => handleInputChange("opfølgning_minutter", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Specialties - Moved to second section */}
      <Card>
        <CardHeader>
          <CardTitle>Specialiteter</CardTitle>
                  <CardDescription>
                    Vælg specialer som klinikken er eksperter i ({selectedSpecialties.length}/10)
                  </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
            {specialties.map((specialty) => (
              <div key={specialty.specialty_id} className="flex items-center space-x-2">
                <Checkbox
                  id={`specialty-${specialty.specialty_id}`}
                  checked={selectedSpecialties.includes(specialty.specialty_id)}
                  onCheckedChange={() => handleSpecialtyToggle(specialty.specialty_id)}
                />
                <Label
                  htmlFor={`specialty-${specialty.specialty_id}`}
                  className="cursor-pointer text-sm"
                >
                  {specialty.specialty_name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About - Moved to third section */}
      <Card>
        <CardHeader>
          <CardTitle>Om klinikken</CardTitle>
          <CardDescription>Beskrivelse af din klinik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="om_os">Om os</Label>
            <Textarea
              id="om_os"
              value={formData.om_os}
              onChange={(e) => handleInputChange("om_os", e.target.value)}
              rows={6}
            />
            <p className="text-xs text-gray-500">
              Max 320 karakterer
            </p>
          </div>
          
          <div className="pt-4 border-t space-y-4">
            <p className="text-sm font-medium text-gray-900">Har klinikken...</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="handicapadgang"
                  checked={formData.handicapadgang === true}
                  onCheckedChange={(checked) =>
                    handleInputChange("handicapadgang", checked === true ? true : checked === false ? false : null)
                  }
                />
                <Label htmlFor="handicapadgang" className="cursor-pointer">
                  Handicapadgang?
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="online_fysioterapeut"
                  checked={formData.online_fysioterapeut}
                  onCheckedChange={(checked) =>
                    handleInputChange("online_fysioterapeut", checked === true)
                  }
                />
                <Label htmlFor="online_fysioterapeut" className="cursor-pointer">
                  Online fysioterapeut?
                </Label>
              </div>
            </div>
            
            {/* Hjemmetræning og Holdtræning (moved here) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hjemmetræning">Hjemmetræning</Label>
                <Input
                  id="hjemmetræning"
                  value={formData.hjemmetræning}
                  onChange={(e) => handleInputChange("hjemmetræning", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holdtræning">Holdtræning</Label>
                <Input
                  id="holdtræning"
                  value={formData.holdtræning}
                  onChange={(e) => handleInputChange("holdtræning", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parkering">Parkering</Label>
              <Input
                id="parkering"
                value={formData.parkering}
                onChange={(e) => handleInputChange("parkering", e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Beskriv parkeringsmuligheder, f.eks. &quot;Gratis i baggården&quot;, &quot;Betalt, men masser af muligheder&quot;
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Åbningstider</CardTitle>
          <CardDescription>Indtast åbningstider for hver dag</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"].map((day) => (
              <div key={day} className="space-y-2">
                <Label htmlFor={day} className="capitalize">{day}</Label>
                <Input
                  id={day}
                  value={formData[day as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(day, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services & Features - removed (moved fields to Om klinikken) */}

      {/* Pricing - removed (moved into Grundlæggende information) */}

      {/* Team Members - Second to last section */}
      <Card>
        <CardHeader>
          <CardTitle>Behandlere</CardTitle>
          <CardDescription>Tilføj behandlere til din klinik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">
                  Behandler {index + 1}
                </h4>
                {teamMembers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTeamMember(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Fjern
                  </Button>
                )}
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image upload on the left */}
                <div className="space-y-2 md:w-1/4">
                  <Label htmlFor={`team-member-image-${index}`}>
                    Billede
                  </Label>
                  <div className="space-y-2">
                    {member.image_url ? (
                      <div className="relative w-full aspect-square max-w-[150px] rounded-lg overflow-hidden border">
                        <Image
                          src={member.image_url}
                          alt={`${member.name || "Behandler"} billede`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleTeamMemberChange(index, "image_url", "")}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`team-member-image-${index}`}
                        className={`flex flex-col items-center justify-center w-full h-28 max-w-[150px] border-2 border-dashed rounded-lg transition-colors ${
                          uploadingImageIndex === index
                            ? "border-blue-400 bg-blue-50 cursor-wait"
                            : "border-gray-300 hover:border-gray-400 cursor-pointer"
                        }`}
                      >
                        {uploadingImageIndex === index ? (
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                            <p className="text-sm text-blue-600">
                              Uploader...
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 mb-1">
                              Klik for at uploade
                            </p>
                            <p className="text-xs text-gray-400">
                              JPEG, PNG
                            </p>
                          </div>
                        )}
                      </label>
                    )}
                    <Input
                      id={`team-member-image-${index}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(index, file);
                        }
                      }}
                      className="cursor-pointer"
                      disabled={uploadingImageIndex === index}
                      style={{ display: member.image_url ? "block" : "none" }}
                    />
                  </div>
                </div>
                {/* Name and Title on the right */}
                <div className="space-y-4 md:w-3/4 md:flex md:flex-col md:justify-start">
                  <div className="space-y-2">
                    <Label htmlFor={`team-member-name-${index}`}>Navn</Label>
                    <Input
                      id={`team-member-name-${index}`}
                      value={member.name}
                      onChange={(e) =>
                        handleTeamMemberChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`team-member-role-${index}`}>Titel</Label>
                    <Input
                      id={`team-member-role-${index}`}
                      value={member.role}
                      onChange={(e) =>
                        handleTeamMemberChange(index, "role", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTeamMember}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tilføj behandler
          </Button>
        </CardContent>
      </Card>

      {/* Insurances */}
      <Card>
        <CardHeader>
          <CardTitle>Forsikringer</CardTitle>
          <CardDescription>Konfigurer hvilke forsikringer I accepterer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Accepterer klinikken alle forsikringer?
            </Label>
            <RadioGroup
              value={acceptsAllInsurances ? "yes" : "no"}
              onValueChange={(value) => {
                const newValue = value === "yes";
                setAcceptsAllInsurances(newValue);
                // If switching to "yes", clear exclusions
                // If switching to "no", start with no exclusions selected
                if (newValue) {
                  setSelectedInsurances([]);
                } else {
                  setSelectedInsurances([]);
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="accepts-all-yes" />
                <Label htmlFor="accepts-all-yes" className="cursor-pointer">
                  Ja
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="accepts-all-no" />
                <Label htmlFor="accepts-all-no" className="cursor-pointer">
                  Nej
                </Label>
              </div>
            </RadioGroup>
          </div>

          {!acceptsAllInsurances && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-sm font-medium">
                Vælg forsikringer som IKKE er accepteret:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {insurances.map((insurance) => (
                  <div key={insurance.insurance_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`insurance-${insurance.insurance_id}`}
                      checked={selectedInsurances.includes(insurance.insurance_id)}
                      onCheckedChange={() => handleInsuranceToggle(insurance.insurance_id)}
                    />
                    <Label
                      htmlFor={`insurance-${insurance.insurance_id}`}
                      className="cursor-pointer text-sm"
                    >
                      {insurance.insurance_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isLoading}
        >
          Annuller
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gem ændringer
        </Button>
      </div>
    </form>
  );
};

