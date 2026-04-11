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
  creationRequests: {
    id: string;
    clinic_name: string;
    address: string;
    postal_code: string;
    city_name: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    admin_notes: string | null;
  }[];
}

export const UserClaimsSection = ({ claims, creationRequests }: UserClaimsSectionProps) => {
  // Only show pending claims - approved become owned clinics, rejected are hidden
  const pendingClaims = claims.filter((c) => c.status === "pending");
  // Approved creation requests become owned clinics and should not render here.
  const visibleCreationRequests = creationRequests.filter(
    (request) => request.status !== "approved"
  );
  const sortedCreationRequests = [...visibleCreationRequests].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1
  );

  if (pendingClaims.length === 0 && sortedCreationRequests.length === 0) {
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

      {sortedCreationRequests.map((request) => {
        const statusStyles: Record<string, string> = {
          pending: "bg-yellow-50 text-yellow-700",
          approved: "bg-green-50 text-green-700",
          rejected: "bg-red-50 text-red-700",
        };
        const statusLabel: Record<string, string> = {
          pending: "Afventer godkendelse",
          approved: "Godkendt",
          rejected: "Afvist",
        };

        return (
          <div
            key={request.id}
            className="border rounded-lg p-6 bg-white space-y-4"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {request.clinic_name}
              </h3>
              <p className="text-sm text-gray-600">
                {request.address}, {request.postal_code} {request.city_name}
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${
                statusStyles[request.status] || statusStyles.pending
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {statusLabel[request.status] || "Afventer godkendelse"}
            </div>

            {request.status === "rejected" && request.admin_notes && (
              <p className="text-sm text-red-700">{request.admin_notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
