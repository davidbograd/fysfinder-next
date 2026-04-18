// Updated: 2026-04-18 - Added featured clinic testimonials below ClinicSearch (Sådan bliver du fundet…).
import { Metadata } from "next";
import { ReactNode } from "react";
import { HeroSection } from "@/components/features/tilmeld-landingpage/HeroSection";
import { ClinicSearch } from "@/components/features/tilmeld-landingpage/ClinicSearch";
import { TilmeldClinicTestimonials } from "@/components/features/tilmeld-landingpage/TilmeldClinicTestimonials";
import { TextImageSection } from "@/components/features/tilmeld-landingpage/TextImageSection";
import { FeaturesSection } from "@/components/features/tilmeld-landingpage/FeaturesSection";
import { SignupCtaSplitSection } from "@/components/features/tilmeld-landingpage/SignupCtaSplitSection";
import { FaqSection } from "@/components/features/tilmeld-landingpage/FaqSection";
import { PartnerStrip } from "@/components/features/shared/PartnerStrip";

export const metadata: Metadata = {
  title: "Tilmeld klinik | Få flere lokale patienter",
  description:
    "Bliv synlig for patienter, der aktivt søger fysioterapi i dit område. Opret din klinik gratis på få minutter.",
};

function FullBleedSection({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 w-dvw max-w-none -translate-x-1/2 overflow-x-clip">
      {children}
    </div>
  );
}

export default function ClinicOwnerPage() {
  return (
    <>
      <FullBleedSection>
        <HeroSection />
      </FullBleedSection>
      <FullBleedSection>
        <FeaturesSection />
      </FullBleedSection>
      <FullBleedSection>
        <ClinicSearch />
      </FullBleedSection>
      <FullBleedSection>
        <TilmeldClinicTestimonials />
      </FullBleedSection>
      <FullBleedSection>
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
          <PartnerStrip />
        </div>
      </FullBleedSection>
      <FullBleedSection>
        <TextImageSection />
      </FullBleedSection>
      <FullBleedSection>
        <SignupCtaSplitSection />
      </FullBleedSection>
      <FullBleedSection>
        <FaqSection />
      </FullBleedSection>
    </>
  );
}
