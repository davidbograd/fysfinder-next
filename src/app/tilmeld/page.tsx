import { Metadata } from "next";
import { HeroSection } from "@/components/features/tilmeld-landingpage/HeroSection";
import { StatsSection } from "@/components/features/tilmeld-landingpage/StatsSection";
import { FeaturesSection } from "@/components/features/tilmeld-landingpage/FeaturesSection";
import { ClinicSearch } from "@/components/features/tilmeld-landingpage/ClinicSearch";
import { CTASection } from "@/components/features/tilmeld-landingpage/CTASection";

export const metadata: Metadata = {
  title: "Få flere patienter til din fysioterapiklinik",
  description:
    "Få din fysioterapiklinik på Fysfinder og få kontakt med flere patienter. Søg efter din klinik eller opret en ny profil.",
};

export default function ClinicOwnerPage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <ClinicSearch />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
