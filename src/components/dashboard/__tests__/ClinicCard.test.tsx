// Tests for dashboard clinic card upgrade action.
// Added: verifies the upgrade CTA routes to the premium flow.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClinicCard } from "@/components/dashboard/ClinicCard";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}));

describe("Dashboard ClinicCard", () => {
  it("routes to clinic premium checkout when upgrade is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ClinicCard
        clinic={{
          clinics_id: "clinic-123",
          klinikNavn: "Test Klinik",
          klinikNavnSlug: "test-klinik",
          lokation: "Aabenraa",
          verified_klinik: true,
          hasActivePremium: false,
          premiumCityNames: [],
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
      <ClinicCard
        clinic={{
          clinics_id: "clinic-456",
          klinikNavn: "Premium Klinik",
          klinikNavnSlug: "premium-klinik",
          lokation: "Odense",
          verified_klinik: true,
          hasActivePremium: true,
          premiumCityNames: ["Odense", "Svendborg"],
        }}
      />
    );

    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("Odense + Svendborg (fra premium)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /opgrader til premium/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /fjern ejerskab/i })).not.toBeInTheDocument();
  });
});
