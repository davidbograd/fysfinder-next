"use client";

// Clinic sidebar with contact actions and analytics tracking metadata context.
// Updated: reuses shared premium-active entitlement helper for booking-link visibility.

import { StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { EmailButton } from "@/components/EmailButton";
import { PhoneButton } from "@/components/PhoneButton";
import { WebsiteButton } from "@/components/WebsiteButton";
import { BookingButton } from "@/components/BookingButton";
import { useClinicAnalytics } from "@/app/hooks/useClinicAnalytics";
import { VerifyClinicModal } from "./VerifyClinicModal";
import { isPremiumListingActive } from "@/lib/clinic-entitlements";

interface ClinicSidebarProps {
  clinic: {
    klinikNavn: string;
    avgRating: number;
    ratingCount: number;
    website: string | null;
    tlf: string | null;
    email: string | null;
    id?: string;
    cityId?: string | null;
    verified_klinik: boolean;
    premium_listing?: {
      booking_link: string | null;
      start_date: string;
      end_date: string;
    } | null;
  };
}

export function ClinicSidebar({ clinic }: ClinicSidebarProps) {
  const {
    trackWebsiteClick,
    trackPhoneClick,
    trackEmailClick,
    trackBookingClick,
  } = useClinicAnalytics({
    clinicName: clinic.klinikNavn,
    clinicId: clinic.id,
    contextCityId: clinic.cityId,
  });

  // Helper function to check if a string is empty or null
  const hasValue = (str: string | null): boolean => {
    return str !== null && str.trim() !== "";
  };

  const hasWebsite = hasValue(clinic.website);
  const hasPhone = hasValue(clinic.tlf);
  const hasEmail = hasValue(clinic.email);
  const hasAnyContactInfo = hasWebsite || hasPhone || hasEmail;

  // Check if clinic is premium and has booking link
  const isPremium = isPremiumListingActive(clinic.premium_listing);
  const hasBookingLink =
    isPremium &&
    clinic.premium_listing?.booking_link &&
    hasValue(clinic.premium_listing.booking_link);

  return (
    <div className="order-first lg:order-none lg:w-2/5">
      <div className="lg:sticky lg:top-20 sm:top-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Name + rating: only in sidebar on lg+; on mobile the page header already shows this */}
          <div className="mb-4 hidden items-center lg:flex">
            <div>
              <p className="mb-4 text-2xl font-semibold">{clinic.klinikNavn}</p>
              <div className="mt-1 flex items-center">
                <StarIcon className="mr-2 h-5 w-5 text-amber-500" />
                <span className="mr-2 font-semibold">
                  {clinic.avgRating != null
                    ? clinic.avgRating.toFixed(1)
                    : "N/A"}
                </span>
                <span className="text-sm text-gray-500">
                  ({clinic.ratingCount} anmeldelser)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-0 space-y-4 lg:mt-6">
            {hasBookingLink && (
              <BookingButton
                bookingLink={clinic.premium_listing!.booking_link!}
                onClick={trackBookingClick}
              />
            )}
            <div className="space-y-2">
              {hasAnyContactInfo ? (
                <>
                  {hasWebsite && (
                    <WebsiteButton
                      website={clinic.website!}
                      onClick={trackWebsiteClick}
                    />
                  )}
                  {hasPhone && (
                    <PhoneButton
                      phoneNumber={clinic.tlf!}
                      onClick={trackPhoneClick}
                    />
                  )}
                  {hasEmail && (
                    <EmailButton
                      email={clinic.email!}
                      onClick={trackEmailClick}
                    />
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-2">
                  Vi har ingen kontakt oplysninger på denne klinik.
                </p>
              )}
            </div>
          </div>
        </div>

        {!clinic.verified_klinik && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Ejer du denne klinik?</p>
            <VerifyClinicModal>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Verificer klinik
              </Button>
            </VerifyClinicModal>
          </div>
        )}
      </div>
    </div>
  );
}
