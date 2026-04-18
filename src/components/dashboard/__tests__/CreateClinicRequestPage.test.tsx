import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateClinicRequestPage } from "../CreateClinicRequestPage";

const mockSubmitClinicCreationRequest = jest.fn();
const mockToast = jest.fn();

jest.mock("@/app/actions/create-clinic-request", () => ({
  submitClinicCreationRequest: (...args: unknown[]) =>
    mockSubmitClinicCreationRequest(...args),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: (...args: unknown[]) => mockToast(...args) }),
}));

describe("CreateClinicRequestPage", () => {
  beforeEach(() => {
    mockSubmitClinicCreationRequest.mockReset();
    mockToast.mockReset();
  });

  it("shows switch city action next to address suffix", () => {
    render(
      <CreateClinicRequestPage
        userProfile={{ full_name: "Test Person", email: "test@example.com" }}
        initialCity={{
          id: "city-1",
          name: "Aabenraa",
          slug: "aabenraa",
          postalCode: "6200",
        }}
      />
    );

    expect(screen.getByText(", Aabenraa 6200")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skift by" })).toBeInTheDocument();
  });

  it("submits a clinic creation request", async () => {
    const user = userEvent.setup();
    mockSubmitClinicCreationRequest.mockResolvedValue({ success: true });

    render(
      <CreateClinicRequestPage
        userProfile={{ full_name: "Test Person", email: "test@example.com" }}
        initialCity={{
          id: "city-1",
          name: "Aabenraa",
          slug: "aabenraa",
          postalCode: "6200",
        }}
      />
    );

    await user.type(screen.getByLabelText("Kliniknavn"), "Ny Klinik");
    await user.type(screen.getByLabelText("Adresse (vej og nr)"), "Testvej 10");
    await user.type(screen.getByLabelText("Din rolle i klinikken"), "Ejer");

    await user.click(
      screen.getByRole("button", { name: "Opret din klinik" })
    );

    await waitFor(() => {
      expect(mockSubmitClinicCreationRequest).toHaveBeenCalledWith({
        clinic_name: "Ny Klinik",
        address: "Testvej 10",
        postal_code: "6200",
        city_id: "city-1",
        city_name: "Aabenraa",
        requester_name: "Test Person",
        requester_email: "test@example.com",
        requester_role: "Ejer",
        website: "",
      });
    });
  });

  it("submits when website does not include protocol", async () => {
    const user = userEvent.setup();
    mockSubmitClinicCreationRequest.mockResolvedValue({ success: true });

    render(
      <CreateClinicRequestPage
        userProfile={{ full_name: "Test Person", email: "test@example.com" }}
        initialCity={{
          id: "city-1",
          name: "Aabenraa",
          slug: "aabenraa",
          postalCode: "6200",
        }}
      />
    );

    await user.type(screen.getByLabelText("Kliniknavn"), "Ny Klinik");
    await user.type(screen.getByLabelText("Adresse (vej og nr)"), "Testvej 10");
    await user.type(screen.getByLabelText("Din rolle i klinikken"), "Ejer");
    await user.type(screen.getByLabelText("Website (valgfrit)"), "www.klinik.dk");

    await user.click(screen.getByRole("button", { name: "Opret din klinik" }));

    await waitFor(() => {
      expect(mockSubmitClinicCreationRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          website: "www.klinik.dk",
        })
      );
    });
  });

  it("shows a clinic name field error when the name is already taken", async () => {
    const user = userEvent.setup();
    mockSubmitClinicCreationRequest.mockResolvedValue({
      fieldErrors: {
        clinic_name:
          "En klinik med dette navn findes allerede. Tilføj evt din by til navnet for at gøre det unikt.",
      },
    });

    render(
      <CreateClinicRequestPage
        userProfile={{ full_name: "Test Person", email: "test@example.com" }}
        initialCity={{
          id: "city-1",
          name: "Aabenraa",
          slug: "aabenraa",
          postalCode: "6200",
        }}
      />
    );

    await user.type(screen.getByLabelText("Kliniknavn"), "Dobbelt Navn");
    await user.type(screen.getByLabelText("Adresse (vej og nr)"), "Testvej 10");
    await user.type(screen.getByLabelText("Din rolle i klinikken"), "Ejer");
    await user.click(screen.getByRole("button", { name: "Opret din klinik" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "En klinik med dette navn findes allerede. Tilføj evt din by til navnet for at gøre det unikt."
        )
      ).toBeInTheDocument();
    });
    expect(mockToast).not.toHaveBeenCalled();
  });
});
