// Tests for OwnedClinicCard upgrade action and profile completeness.
// Added: verifies the upgrade CTA routes to the premium flow.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OwnedClinicCard } from "@/components/dashboard/OwnedClinicCard";
import type { ClinicProfileCompleteness } from "@/lib/clinic-profile-completeness";
import {
  CLINIC_PROFILE_CONTACT_ADD_INFO_CTA_DA,
  CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA,
} from "@/lib/clinic-profile-completeness";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}));

const profileComplete: ClinicProfileCompleteness = {
  completedCount: 7,
  totalCount: 7,
  percent: 100,
  missingKeys: [],
};

const profileMotivationCopy =
  "Klinikker med en udfyldt profil får flere patienter";

/** Contact + pricing OK; still missing five lower-priority items (matches 2 af 7). */
const profileIncomplete: ClinicProfileCompleteness = {
  completedCount: 2,
  totalCount: 7,
  percent: 29,
  missingKeys: ["specialties", "about", "openingHours", "team", "insurances"],
};

const profileMissingContact: ClinicProfileCompleteness = {
  completedCount: 5,
  totalCount: 7,
  percent: 71,
  missingKeys: ["contact", "pricing"],
};

describe("OwnedClinicCard", () => {
  it("routes to clinic premium checkout when upgrade is clicked", async () => {
    const user = userEvent.setup();

    render(
      <OwnedClinicCard
        clinic={{
          clinics_id: "clinic-123",
          klinikNavn: "Test Klinik",
          klinikNavnSlug: "test-klinik",
          lokation: "Aabenraa",
          verified_klinik: true,
          hasActivePremium: false,
          premiumCityNames: [],
          profileCompleteness: profileIncomplete,
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /opgrader til premium/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/clinic/clinic-123/premium");
    expect(screen.getByRole("link", { name: /se klinik/i })).toHaveAttribute(
      "href",
      "/klinik/test-klinik"
    );
    expect(screen.queryByRole("button", { name: /fjern ejerskab/i })).not.toBeInTheDocument();
  });

  it("shows premium tag and selected cities without upgrade button", () => {
    render(
      <OwnedClinicCard
        clinic={{
          clinics_id: "clinic-456",
          klinikNavn: "Premium Klinik",
          klinikNavnSlug: "premium-klinik",
          lokation: "Odense",
          verified_klinik: true,
          hasActivePremium: true,
          premiumCityNames: ["Odense", "Svendborg"],
          profileCompleteness: profileComplete,
        }}
      />
    );

    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("Odense + Svendborg (fra premium)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /opgrader til premium/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /fjern ejerskab/i })).not.toBeInTheDocument();
  });

  it("shows the contact warning instead of Tilføj f.eks when contact is missing", () => {
    render(
      <OwnedClinicCard
        clinic={{
          clinics_id: "clinic-no-contact",
          klinikNavn: "Uden kontakt",
          klinikNavnSlug: "uden-kontakt",
          lokation: null,
          verified_klinik: true,
          hasActivePremium: false,
          premiumCityNames: [],
          profileCompleteness: profileMissingContact,
        }}
      />
    );

    expect(
      screen.getByText(CLINIC_PROFILE_CONTACT_NO_INFO_WARNING_DA)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Tilføj f\.eks\./i)).not.toBeInTheDocument();
    const addInfo = screen.getByRole("link", {
      name: CLINIC_PROFILE_CONTACT_ADD_INFO_CTA_DA,
    });
    expect(addInfo).toHaveAttribute(
      "href",
      "/dashboard/clinic/clinic-no-contact/edit"
    );
    expect(screen.getByText(profileMotivationCopy)).toBeInTheDocument();
  });

  it("shows profile progress when the checklist is incomplete", () => {
    render(
      <OwnedClinicCard
        clinic={{
          clinics_id: "clinic-789",
          klinikNavn: "Progress Klinik",
          klinikNavnSlug: "progress-klinik",
          lokation: null,
          verified_klinik: true,
          hasActivePremium: false,
          premiumCityNames: [],
          profileCompleteness: profileIncomplete,
        }}
      />
    );

    expect(screen.getByText("Klinikprofil")).toBeInTheDocument();
    expect(screen.getByText("2 af 7")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /2 af 7 trin fuldført på klinikprofilen/i })
    ).toBeInTheDocument();
    expect(screen.getByText(profileMotivationCopy)).toBeInTheDocument();
  });

  it("shows complete state when the checklist is done", () => {
    render(
      <OwnedClinicCard
        clinic={{
          clinics_id: "clinic-full",
          klinikNavn: "Fuld Klinik",
          klinikNavnSlug: "fuld-klinik",
          lokation: null,
          verified_klinik: true,
          hasActivePremium: false,
          premiumCityNames: [],
          profileCompleteness: profileComplete,
        }}
      />
    );

    expect(screen.getByText("Klinik profil er komplet")).toBeInTheDocument();
    expect(screen.queryByText("Klinikprofil")).not.toBeInTheDocument();
    expect(screen.queryByText(profileMotivationCopy)).not.toBeInTheDocument();
  });

  it("does not show partial-profile motivation when nothing is completed yet", () => {
    render(
      <OwnedClinicCard
        clinic={{
          clinics_id: "clinic-empty",
          klinikNavn: "Tom profil",
          klinikNavnSlug: "tom-profil",
          lokation: null,
          verified_klinik: true,
          hasActivePremium: false,
          premiumCityNames: [],
          profileCompleteness: {
            completedCount: 0,
            totalCount: 7,
            percent: 0,
            missingKeys: [
              "contact",
              "pricing",
              "specialties",
              "about",
              "openingHours",
              "team",
              "insurances",
            ],
          },
        }}
      />
    );

    expect(screen.queryByText(profileMotivationCopy)).not.toBeInTheDocument();
  });
});
