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

import { useMemo, useState } from "react";
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
import {
  Loader2,
  Mail,
  Phone,
  Globe,
  Plus,
  X,
  Image as ImageIcon,
  Check,
  Minus,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  CLINIC_PROFILE_RECOMMENDATION_ORDER,
  clinicProfileEditSidebarLabelsDa,
  computeClinicProfileCompleteness,
  getClinicProfileCompletenessAriaDa,
  type ClinicProfileCompletenessInput,
} from "@/lib/clinic-profile-completeness";
import { cn } from "@/lib/utils";
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

/** Danish ordering (CLDR da-DK): Latin letters then æ, ø, å after z. */
const DANISH_SPECIALTY_COLLATOR = new Intl.Collator("da-DK", {
  sensitivity: "base",
  numeric: true,
});

const OM_OS_MAX_LENGTH = 320;

const isOptionalEmailValid = (email: string): boolean => {
  const t = email.trim();
  if (!t) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
};

const isOptionalWebsiteValid = (website: string): boolean => {
  const t = website.trim();
  if (!t) return true;
  try {
    const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    new URL(withProto);
    return true;
  } catch {
    return false;
  }
};

/** Strips http(s):// and leading slashes so the input only holds host + path. */
const normalizeWebsiteSuffixInput = (raw: string): string => {
  let t = raw.trim();
  t = t.replace(/^https?:\/\//i, "");
  t = t.replace(/^\/+/, "");
  return t.trim();
};

/** Full URL for validation and DB; empty string if the website field is left blank. */
const buildFullWebsiteUrlFromSuffix = (suffix: string): string => {
  const normalized = normalizeWebsiteSuffixInput(suffix);
  if (!normalized) return "";
  return `https://${normalized}`;
};

const isMinuteFieldInRange = (value: string): boolean => {
  const t = value.trim();
  if (!t) return true;
  const n = parseInt(t, 10);
  return !Number.isNaN(n) && n >= 5 && n <= 180;
};

type EditClinicValidationInput = {
  email: string;
  website: string;
  om_os: string;
  hasYdernummer: string;
  første_kons_minutter: string;
  opfølgning_minutter: string;
  allInsuranceTypesCount: number;
  acceptedInsuranceCount: number;
  selectedSpecialtiesCount: number;
  teamMembers: TeamMemberForm[];
};

const getEditClinicValidationMessage = ({
  email,
  website,
  om_os,
  hasYdernummer,
  første_kons_minutter,
  opfølgning_minutter,
  allInsuranceTypesCount,
  acceptedInsuranceCount,
  selectedSpecialtiesCount,
  teamMembers,
}: EditClinicValidationInput): string | null => {
  if (!isOptionalEmailValid(email)) {
    return "E-mail ser ikke gyldig ud. Brug formatet navn@domæne.dk, eller lad feltet stå tomt.";
  }
  if (!isOptionalWebsiteValid(website)) {
    return "Website skal være en gyldig adresse efter https://, f.eks. www.ditklinik.dk eller ditklinik.dk.";
  }
  if (om_os.trim().length > OM_OS_MAX_LENGTH) {
    return `Teksten under «Om os» må højst være ${OM_OS_MAX_LENGTH} tegn (nu: ${om_os.trim().length}). Forkort teksten, og prøv igen.`;
  }
  if (hasYdernummer === "no") {
    if (!isMinuteFieldInRange(første_kons_minutter)) {
      return "Varighed for første konsultation skal være et heltal mellem 5 og 180 minutter, eller lad feltet stå tomt.";
    }
    if (!isMinuteFieldInRange(opfølgning_minutter)) {
      return "Varighed for opfølgning skal være et heltal mellem 5 og 180 minutter, eller lad feltet stå tomt.";
    }
  }
  if (allInsuranceTypesCount > 0 && acceptedInsuranceCount === 0) {
    return "Vælg mindst én forsikring, I accepterer, eller vælg «Ja» under om klinikken accepterer alle forsikringer.";
  }
  if (selectedSpecialtiesCount > 10) {
    return "Du kan maksimalt vælge 10 specialer. Fjern ét eller flere, og prøv igen.";
  }
  for (const m of teamMembers) {
    const hasName = m.name.trim() !== "";
    const hasRole = m.role.trim() !== "";
    if (hasName !== hasRole) {
      return "For hver behandler skal både navn og rolle udfyldes. Fjern tomme rækker med X, hvis de ikke skal bruges.";
    }
  }
  return null;
};

const mapClinicSaveErrorToUserMessage = (raw: string): string => {
  const known: Record<string, string> = {
    "Ikke logget ind":
      "Du er ikke logget ind. Opdater siden eller log ind igen, og prøv at gemme.",
    "Du ejer ikke denne klinik":
      "Du har ikke adgang til at ændre denne klinik. Kontakt os, hvis det er en fejl.",
    "Maksimum 10 specialiteter tilladt":
      "Du kan maksimalt vælge 10 specialer. Fjern ét eller flere, og gem igen.",
    "Fejl ved opdatering af klinik":
      "Kunne ikke gemme klinikoplysningerne. Tjek forbindelsen og prøv igen. Kontakt os, hvis problemet fortsætter.",
    "Fejl ved opdatering af specialiteter":
      "Kunne ikke gemme specialer. Prøv igen om et øjeblik.",
    "Fejl ved opdatering af behandlere":
      "Kunne ikke gemme behandlere. Tjek at hver række har både navn og rolle, og prøv igen.",
    "Fejl ved opdatering af forsikringer":
      "Kunne ikke gemme forsikringer. Prøv igen om et øjeblik.",
    "Adgang til behandlere er midlertidigt utilgængelig":
      "Behandlere kan ikke opdateres lige nu. Prøv igen senere.",
  };
  return known[raw] ?? raw;
};

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
    website: normalizeWebsiteSuffixInput(clinic.website || ""),
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
  const [specialtySearchQuery, setSpecialtySearchQuery] = useState("");
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

  const handleWebsiteSuffixChange = (raw: string) => {
    handleInputChange("website", normalizeWebsiteSuffixInput(raw));
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    const isSelected = selectedSpecialties.includes(specialtyId);

    if (!isSelected && selectedSpecialties.length >= 10) {
      toast({
        title: "Maksimum nået",
        description: "Du kan maksimalt vælge 10 specialiteter",
        variant: "destructive",
      });
      return;
    }

    setSelectedSpecialties((prev) => {
      if (prev.includes(specialtyId)) {
        return prev.filter((id) => id !== specialtyId);
      }
      return [...prev, specialtyId];
    });

    if (!isSelected && specialtySearchQuery.trim()) {
      setSpecialtySearchQuery("");
    }
  };

  const specialtyOptions = useMemo(
    () =>
      specialties
        .filter((s) => !["Skoliose"].includes(s.specialty_name))
        .sort((a, b) =>
          DANISH_SPECIALTY_COLLATOR.compare(a.specialty_name, b.specialty_name)
        ),
    [specialties]
  );

  const filteredSpecialtyOptions = useMemo(() => {
    const q = specialtySearchQuery.trim().toLowerCase();
    if (!q) {
      return specialtyOptions;
    }
    return specialtyOptions.filter((s) =>
      s.specialty_name.toLowerCase().includes(q)
    );
  }, [specialtyOptions, specialtySearchQuery]);

  const selectedSpecialtyTags = useMemo(() => {
    const byId = new Map(
      specialtyOptions.map((s) => [s.specialty_id, s])
    );
    return selectedSpecialties
      .map((id) => byId.get(id))
      .filter((s): s is (typeof specialtyOptions)[number] => Boolean(s))
      .sort((a, b) =>
        DANISH_SPECIALTY_COLLATOR.compare(a.specialty_name, b.specialty_name)
      );
  }, [selectedSpecialties, specialtyOptions]);

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

  const validTeamMemberCount = useMemo(
    () =>
      teamMembers.filter(
        (member) => member.name.trim() !== "" && member.role.trim() !== ""
      ).length,
    [teamMembers]
  );

  const profileCompleteness = useMemo(() => {
    const totalInsuranceTypesCount = insurances.length;
    const acceptedInsuranceCount = acceptsAllInsurances
      ? totalInsuranceTypesCount
      : insurances.filter(
          (i) => !selectedInsurances.includes(i.insurance_id)
        ).length;

    const input: ClinicProfileCompletenessInput = {
      email: formData.email,
      tlf: formData.tlf,
      website: buildFullWebsiteUrlFromSuffix(formData.website),
      om_os: formData.om_os,
      mandag: formData.mandag,
      tirsdag: formData.tirsdag,
      onsdag: formData.onsdag,
      torsdag: formData.torsdag,
      fredag: formData.fredag,
      lørdag: formData.lørdag,
      søndag: formData.søndag,
      førsteKons: formData.førsteKons,
      opfølgning: formData.opfølgning,
      ydernummer:
        hasYdernummer === "yes"
          ? true
          : hasYdernummer === "no"
            ? false
            : null,
      specialtyCount: selectedSpecialties.length,
      teamMemberCount: validTeamMemberCount,
      acceptedInsuranceCount,
      totalInsuranceTypesCount,
    };
    return computeClinicProfileCompleteness(input);
  }, [
    insurances,
    acceptsAllInsurances,
    selectedInsurances,
    formData.email,
    formData.tlf,
    formData.website,
    formData.om_os,
    formData.mandag,
    formData.tirsdag,
    formData.onsdag,
    formData.torsdag,
    formData.fredag,
    formData.lørdag,
    formData.søndag,
    formData.førsteKons,
    formData.opfølgning,
    hasYdernummer,
    selectedSpecialties.length,
    validTeamMemberCount,
  ]);

  const profileMissingKeySet = useMemo(
    () => new Set(profileCompleteness.missingKeys),
    [profileCompleteness.missingKeys]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalInsuranceTypesCount = insurances.length;
    const acceptedInsuranceCount = acceptsAllInsurances
      ? totalInsuranceTypesCount
      : allInsuranceIds.filter((id) => !selectedInsurances.includes(id)).length;

    const clientValidationMessage = getEditClinicValidationMessage({
      email: formData.email,
      website: buildFullWebsiteUrlFromSuffix(formData.website),
      om_os: formData.om_os,
      hasYdernummer,
      første_kons_minutter: formData.første_kons_minutter,
      opfølgning_minutter: formData.opfølgning_minutter,
      allInsuranceTypesCount: totalInsuranceTypesCount,
      acceptedInsuranceCount,
      selectedSpecialtiesCount: selectedSpecialties.length,
      teamMembers,
    });

    if (clientValidationMessage) {
      toast({
        title: "Kan ikke gemme",
        description: clientValidationMessage,
        variant: "destructive",
      });
      return;
    }

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
        website: buildFullWebsiteUrlFromSuffix(formData.website) || null,
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
    } catch (error: unknown) {
      const raw =
        error instanceof Error ? error.message : String(error ?? "");
      toast({
        title: "Fejl",
        description:
          mapClinicSaveErrorToUserMessage(raw) || "Kunne ikke opdatere klinik",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="min-w-0 flex-1 space-y-6"
        aria-describedby="clinic-profile-progress-summary"
      >
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
              <Label
                htmlFor="email"
                className="flex min-h-5 items-center gap-2"
              >
                <Mail className="h-4 w-4 shrink-0 text-gray-500" />
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
              <Label
                htmlFor="tlf"
                className="flex min-h-5 items-center gap-2"
              >
                <Phone className="h-4 w-4 shrink-0 text-gray-500" />
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
              <Label
                htmlFor="website"
                className="flex min-h-5 items-center gap-2"
              >
                <Globe className="h-4 w-4 shrink-0 text-gray-500" />
                Website
              </Label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span
                  className="flex shrink-0 items-center border-r border-input bg-gray-50 px-3 text-sm text-gray-500 select-none"
                  aria-hidden="true"
                >
                  https://
                </span>
                <Input
                  id="website"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  value={formData.website}
                  onChange={(e) => handleWebsiteSuffixChange(e.target.value)}
                  placeholder="www.ditklinik.dk"
                  aria-describedby="website-https-hint"
                  className="h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <p id="website-https-hint" className="sr-only">
                Adressen gemmes med https. Du behøver ikke skrive https i feltet.
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="adresse"
                className="flex min-h-5 items-center gap-2"
              >
                Adresse
              </Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priser og ydernummer</CardTitle>
          <CardDescription>
            Angiv om klinikken har ydernummer, eller udfyld priser for privatpatienter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specialer</CardTitle>
          <CardDescription>
            Vælg ét eller flere specialer, som klinikken er stærk i ({selectedSpecialties.length}/10)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedSpecialtyTags.length > 0 ? (
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Valgte specialer"
            >
              {selectedSpecialtyTags.map((s) => (
                <span
                  key={s.specialty_id}
                  role="listitem"
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-brand-primary/20 bg-brand-beige py-1 pl-2.5 pr-1 text-sm text-brand-label"
                >
                  <span className="truncate">{s.specialty_name}</span>
                  <button
                    type="button"
                    onClick={() => handleSpecialtyToggle(s.specialty_id)}
                    className="shrink-0 rounded-full p-1 text-brand-primary hover:bg-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Fjern ${s.specialty_name}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden={true} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="specialty-search">Søg efter speciale</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                aria-hidden={true}
              />
              <Input
                id="specialty-search"
                type="search"
                value={specialtySearchQuery}
                onChange={(e) => setSpecialtySearchQuery(e.target.value)}
                placeholder="F.eks. knæ, ryg, hovedpine…"
                className="pl-9"
                autoComplete="off"
                aria-controls="specialty-checklist"
              />
            </div>
          </div>
          <div
            id="specialty-checklist"
            role="group"
            aria-label="Liste over specialer"
            className="grid max-h-96 grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto pr-1 md:grid-cols-2"
          >
            {filteredSpecialtyOptions.length === 0 ? (
              <p className="col-span-full text-sm text-gray-600">
                Ingen specialer matcher søgningen. Prøv et andet søgeord.
              </p>
            ) : (
              filteredSpecialtyOptions.map((specialty) => {
                const inputId = `specialty-${specialty.specialty_id}`;
                const checked = selectedSpecialties.includes(specialty.specialty_id);
                const atSpecialtyLimit = !checked && selectedSpecialties.length >= 10;
                return (
                  <div
                    key={specialty.specialty_id}
                    className={cn(
                      "flex items-center gap-2 py-1",
                      atSpecialtyLimit && "cursor-not-allowed opacity-55"
                    )}
                  >
                    <Checkbox
                      id={inputId}
                      checked={checked}
                      className="rounded-none"
                      disabled={atSpecialtyLimit}
                      onCheckedChange={() => handleSpecialtyToggle(specialty.specialty_id)}
                    />
                    <Label
                      htmlFor={inputId}
                      className={cn(
                        "cursor-pointer text-sm font-medium leading-snug",
                        atSpecialtyLimit && "cursor-not-allowed"
                      )}
                    >
                      {specialty.specialty_name}
                    </Label>
                  </div>
                );
              })
            )}
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
            <p className="text-sm font-medium text-gray-900">Vores klinik har...</p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="handicapadgang"
                  className="rounded-none"
                  checked={formData.handicapadgang === true}
                  onCheckedChange={(checked) =>
                    handleInputChange("handicapadgang", checked === true ? true : checked === false ? false : null)
                  }
                />
                <Label htmlFor="handicapadgang" className="cursor-pointer">
                  Handicapadgang
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="online_fysioterapeut"
                  className="rounded-none"
                  checked={formData.online_fysioterapeut}
                  onCheckedChange={(checked) =>
                    handleInputChange("online_fysioterapeut", checked === true)
                  }
                />
                <Label htmlFor="online_fysioterapeut" className="cursor-pointer">
                  Online fysioterapeut
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
          <CardDescription className="text-pretty">
            Indtast åbningstider for hver dag, f.eks{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono text-foreground">
              09:00-17:00
            </code>{" "}
            eller{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono text-foreground">
              Lukket
            </code>
          </CardDescription>
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

      {/* Below sticky Header (h-16) + small gap so the card doesn’t sit flush */}
      <aside
        className="w-full shrink-0 lg:w-72 xl:w-80 lg:sticky lg:top-[calc(4rem+0.75rem)] lg:self-start"
        aria-label="Klinikprofil: hvad der er udfyldt"
      >
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold tracking-tight">
              <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                Klinik profil{" "}
                <span className="tabular-nums text-emerald-700">
                  {profileCompleteness.completedCount}/
                  {profileCompleteness.totalCount}
                </span>
              </span>
            </CardTitle>
            <p
              id="clinic-profile-progress-summary"
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {getClinicProfileCompletenessAriaDa(profileCompleteness)}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-0">
            <ul className="space-y-2.5" role="list">
              {CLINIC_PROFILE_RECOMMENDATION_ORDER.map((key) => {
                const done = !profileMissingKeySet.has(key);
                const label = clinicProfileEditSidebarLabelsDa[key];
                return (
                  <li
                    key={key}
                    className="flex items-start gap-2.5 text-sm leading-snug text-gray-700"
                  >
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
                      aria-hidden={true}
                    >
                      {done ? (
                        <Check
                          className="h-4 w-4 text-emerald-600"
                          strokeWidth={2.5}
                          aria-hidden={true}
                        />
                      ) : (
                        <Minus
                          className="h-4 w-4 text-gray-300"
                          strokeWidth={2}
                          aria-hidden={true}
                        />
                      )}
                    </span>
                    <span className={done ? "font-medium text-gray-900" : ""}>
                      {label}
                      <span className="sr-only">
                        {done ? ", udfyldt" : ", mangler endnu"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div
              className="flex gap-2.5 rounded-md bg-brand-beige px-3 py-2.5 text-sm text-brand-label"
              role="note"
            >
              <TrendingUp
                className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                strokeWidth={1.75}
                aria-hidden={true}
              />
              <p className="leading-snug">
                Klinikker med en udfyldt profil får flere patienter
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
};

