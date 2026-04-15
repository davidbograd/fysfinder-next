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

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("@/app/actions/clinic-management", () => ({
  unclaimClinic: jest.fn(),
}));

describe("Dashboard ClinicCard", () => {
  it("routes to clinic premium checkout when upgrade is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ClinicCard
        clinic={{
          clinics_id: "clinic-123",
          klinikNavn: "Test Klinik",
          lokation: "Aabenraa",
          verified_klinik: true,
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: /opgrader til featured/i }));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/clinic/clinic-123/premium");
  });
});
