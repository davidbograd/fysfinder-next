import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditClinicHeaderActions } from "@/components/dashboard/EditClinicHeaderActions";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockToast = jest.fn();
const mockUnclaimClinic = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

jest.mock("@/app/actions/clinic-management", () => ({
  unclaimClinic: (...args: unknown[]) => mockUnclaimClinic(...args),
}));

describe("EditClinicHeaderActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Fjern ejerskab option in the three-dot menu", async () => {
    const user = userEvent.setup();
    render(
      <EditClinicHeaderActions
        clinicId="clinic-123"
        clinicName="Test Klinik"
      />
    );

    await user.click(screen.getByRole("button", { name: /flere handlinger/i }));
    expect(screen.getByRole("button", { name: /fjern ejerskab/i })).toBeInTheDocument();
  });

  it("unclaims and redirects to dashboard after confirmation", async () => {
    const user = userEvent.setup();
    mockUnclaimClinic.mockResolvedValue({ success: true });

    render(
      <EditClinicHeaderActions
        clinicId="clinic-123"
        clinicName="Test Klinik"
      />
    );

    await user.click(screen.getByRole("button", { name: /flere handlinger/i }));
    await user.click(screen.getByRole("button", { name: /^fjern ejerskab$/i }));
    await user.click(screen.getByRole("button", { name: /^fjern ejerskab$/i }));

    expect(mockUnclaimClinic).toHaveBeenCalledWith("clinic-123");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    expect(mockRefresh).toHaveBeenCalled();
  });
});
