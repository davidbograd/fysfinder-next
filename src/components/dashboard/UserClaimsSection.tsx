"use client";

import { Clock } from "lucide-react";

interface UserClaim {
  id: string;
  clinic_id: string;
  klinik_navn: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  clinics: {
    clinics_id: string;
    klinikNavn: string;
    adresse: string | null;
    postnummer: number | null;
    lokation: string | null;
  } | null | any;
}

interface UserClaimsSectionProps {
  claims: UserClaim[];
}

export const UserClaimsSection = ({ claims }: UserClaimsSectionProps) => {
  // Only show pending claims - approved become owned clinics, rejected are hidden
  const pendingClaims = claims.filter((c) => c.status === "pending");

  if (pendingClaims.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {pendingClaims.map((claim) => {
        const clinic = Array.isArray(claim.clinics)
          ? claim.clinics[0]
          : claim.clinics;

        return (
          <div
            key={claim.id}
            className="border rounded-lg p-6 bg-white space-y-4"
          >
            {/* Clinic Name and Location */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {claim.klinik_navn}
              </h3>
              {clinic?.lokation && (
                <p className="text-sm text-gray-600">{clinic.lokation}</p>
              )}
            </div>

            {/* Pending Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              Afventer godkendelse
            </div>
          </div>
        );
      })}
    </div>
  );
};
