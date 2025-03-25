"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailButton } from "@/components/EmailButton";
import { PhoneButton } from "@/components/PhoneButton";
import { useClinicAnalytics } from "@/app/hooks/useClinicAnalytics";
import { getDisplayUrl } from "./utils";

interface ClinicSidebarMobileProps {
  clinic: {
    klinikNavn: string;
    website: string | null;
    tlf: string | null;
    email: string | null;
    northstar: boolean;
    id?: string;
    verified_klinik: boolean;
  };
}

export function ClinicSidebarMobile({ clinic }: ClinicSidebarMobileProps) {
  const { trackWebsiteClick, trackPhoneClick, trackEmailClick } =
    useClinicAnalytics({
      clinicName: clinic.klinikNavn,
      clinicId: clinic.id,
    });

  // Helper function to check if a string is empty or null
  const hasValue = (str: string | null): boolean => {
    return str !== null && str.trim() !== "";
  };

  const hasWebsite = hasValue(clinic.website);
  const hasPhone = hasValue(clinic.tlf);
  const hasEmail = hasValue(clinic.email);
  const hasAnyContactInfo = hasWebsite || hasPhone || hasEmail;

  // Helper function to add UTM parameters to URLs
  const addUtmParameters = (url: string): string => {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("utm_source", "fysfinder-dk");
      urlObj.searchParams.set("utm_medium", "referral");
      return urlObj.toString();
    } catch (e) {
      // If URL parsing fails, return original URL
      return url;
    }
  };

  return (
    <div className="lg:hidden">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          {clinic.northstar && (
            <Button className="w-full mb-4" variant="default" asChild>
              <a
                href="https://application.complimentawork.dk/CamClientPortal/CamClientPortal.html?clinic=00000A00CA04000007D404000000016B027EE85F66BAA6BB"
                target="_blank"
                rel="noopener"
              >
                Book tid
              </a>
            </Button>
          )}
          <div className="space-y-2">
            {hasAnyContactInfo ? (
              <>
                {hasWebsite && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-start"
                    asChild
                  >
                    <a
                      href={
                        hasWebsite ? addUtmParameters(clinic.website!) : "#"
                      }
                      target="_blank"
                      rel="noopener nofollow"
                      onClick={trackWebsiteClick}
                    >
                      <Globe className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="truncate">
                        {getDisplayUrl(clinic.website!)}
                      </span>
                    </a>
                  </Button>
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
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            asChild
          >
            <a
              href="https://tally.so/r/wdk75r"
              target="_blank"
              rel="noopener noreferrer"
            >
              Verificer klinik
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
