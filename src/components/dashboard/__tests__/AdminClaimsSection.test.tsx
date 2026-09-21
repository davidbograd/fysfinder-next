import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockGetPendingClaims = jest.fn();
const mockApproveClaim = jest.fn();
const mockRejectClaim = jest.fn();
const mockGetPendingClinicCreationRequests = jest.fn();
const mockApproveClinicCreationRequest = jest.fn();
const mockRejectClinicCreationRequest = jest.fn();
const mockToast = jest.fn();

jest.mock("@/app/actions/admin-claims", () => ({
  getPendingClaims: (...args: unknown[]) => mockGetPendingClaims(...args),
  approveClaim: (...args: unknown[]) => mockApproveClaim(...args),
  rejectClaim: (...args: unknown[]) => mockRejectClaim(...args),
  getPendingClinicCreationRequests: (...args: unknown[]) =>
    mockGetPendingClinicCreationRequests(...args),
  approveClinicCreationRequest: (...args: unknown[]) =>
    mockApproveClinicCreationRequest(...args),
  rejectClinicCreationRequest: (...args: unknown[]) => mockRejectClinicCreationRequest(...args),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { AdminClaimsSection } from "../AdminClaimsSection";

const pendingClaim = {
  id: "claim-1",
  clinic_id: "clinic-1",
  klinik_navn: "Klinik Nord",
  job_titel: "Ejer",
  fulde_navn: "Anna Andersen",
  email: "anna@klinik-nord.dk",
  telefon: "12345678",
  status: "pending",
  created_at: "2026-04-10T10:00:00.000Z",
  clinics: [
    {
      clinics_id: "clinic-1",
      klinikNavn: "Klinik Nord",
      adresse: "Testvej 1",
      postnummer: 8000,
      lokation: "Aarhus C",
      verified_klinik: false,
      email: "kontakt@klinik-nord.dk",
      tlf: "12345678",
    },
  ],
};

const pendingCreationRequest = {
  id: "request-1",
  requester_name: "Bo Bertelsen",
  requester_email: "bo@ny-klinik.dk",
  requester_phone: "87654321",
  requester_role: "Ejer",
  clinic_name: "Ny Klinik",
  address: "Testvej 2",
  postal_code: "6200",
  city_name: "Aabenraa",
  website: null,
  description: null,
  status: "pending",
  created_at: "2026-04-11T10:00:00.000Z",
};

describe("AdminClaimsSection", () => {
  let confirmSpy: jest.SpyInstance<boolean, [message?: string]>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPendingClaims.mockResolvedValue({ claims: [pendingClaim] });
    mockGetPendingClinicCreationRequests.mockResolvedValue({ requests: [pendingCreationRequest] });
    mockApproveClaim.mockResolvedValue({ success: true });
    mockApproveClinicCreationRequest.mockResolvedValue({ success: true });
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it("asks for confirmation before approving a claim without a Google Maps-link", async () => {
    const user = userEvent.setup();
    render(<AdminClaimsSection />);

    await user.click(await screen.findByRole("button", { name: /Godkend anmodning/ }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("Google Maps-link"));
    expect(mockApproveClaim).toHaveBeenCalledWith("claim-1", { googleMapsUrl: undefined });
  });

  it("does not approve when the admin cancels the missing-link confirmation", async () => {
    confirmSpy.mockReturnValue(false);
    const user = userEvent.setup();
    render(<AdminClaimsSection />);

    await user.click(await screen.findByRole("button", { name: /Godkend anmodning/ }));

    expect(mockApproveClaim).not.toHaveBeenCalled();
  });

  it("approves without confirmation when a Google Maps-link is filled in", async () => {
    const user = userEvent.setup();
    render(<AdminClaimsSection />);

    await user.type(
      await screen.findByLabelText("Google Maps-link til klinikken efter godkendelse"),
      "https://maps.app.goo.gl/abc"
    );
    await user.click(screen.getByRole("button", { name: /Godkend anmodning/ }));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockApproveClaim).toHaveBeenCalledWith("claim-1", {
      googleMapsUrl: "https://maps.app.goo.gl/abc",
    });
  });

  it("asks for confirmation before creating a clinic without a Google Maps-link", async () => {
    confirmSpy.mockReturnValue(false);
    const user = userEvent.setup();
    render(<AdminClaimsSection />);

    await user.click(await screen.findByRole("button", { name: /Godkend og opret klinik/ }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("Google Maps-link"));
    expect(mockApproveClinicCreationRequest).not.toHaveBeenCalled();
  });
});
