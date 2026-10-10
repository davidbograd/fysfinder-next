// Updated: 2026-10-10 - Added courses teaser linking to /for-klinikker/kurser before the FAQ.
import { Metadata } from "next";
import { ReactNode } from "react";
import { HeroSection } from "@/components/features/tilmeld-landingpage/HeroSection";
import { ClinicSearch } from "@/components/features/tilmeld-landingpage/ClinicSearch";
import { TilmeldClinicTestimonials } from "@/components/features/tilmeld-landingpage/TilmeldClinicTestimonials";
import {
  ComparisonSection,
  TextImageSection,
} from "@/components/features/tilmeld-landingpage/TextImageSection";
import { FeaturesSection } from "@/components/features/tilmeld-landingpage/FeaturesSection";
import { RevenueCalculatorSection } from "@/components/features/tilmeld-landingpage/RevenueCalculatorSection";
import { SignupCtaSplitSection } from "@/components/features/tilmeld-landingpage/SignupCtaSplitSection";
import { FaqSection } from "@/components/features/tilmeld-landingpage/FaqSection";
import { CoursesTeaserSection } from "@/components/features/tilmeld-landingpage/CoursesTeaserSection";
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
        <ComparisonSection />
      </FullBleedSection>
      <FullBleedSection>
        <RevenueCalculatorSection />
      </FullBleedSection>
      <FullBleedSection>
        <TextImageSection />
      </FullBleedSection>
      <FullBleedSection>
        <SignupCtaSplitSection />
      </FullBleedSection>
      <FullBleedSection>
        <CoursesTeaserSection />
      </FullBleedSection>
      <FullBleedSection>
        <FaqSection />
      </FullBleedSection>
    </>
  );
}
