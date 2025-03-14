import { render, screen, fireEvent } from "@testing-library/react";
import { ClinicSidebar } from "../ClinicSidebar";

// Mock the analytics hook
jest.mock("@/app/hooks/useClinicAnalytics", () => ({
  useClinicAnalytics: () => ({
    trackWebsiteClick: jest.fn(),
    trackPhoneClick: jest.fn(),
    trackEmailClick: jest.fn(),
  }),
}));

const mockClinic = {
  klinikNavn: "Test Fysioterapi",
  avgRating: 4.8,
  ratingCount: 25,
  website: "https://www.testfysio.dk",
  tlf: "+45 12345678",
  email: "kontakt@testfysio.dk",
  northstar: true,
  id: "123",
};

describe("ClinicSidebar", () => {
  it("renders clinic name and rating", () => {
    render(<ClinicSidebar clinic={mockClinic} />);

    expect(screen.getByText("Test Fysioterapi")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("(25 anmeldelser)")).toBeInTheDocument();
  });

  it("displays contact information when provided", () => {
    render(<ClinicSidebar clinic={mockClinic} />);

    // Check website
    expect(screen.getByText("testfysio.dk")).toBeInTheDocument();

    // Check phone
    expect(screen.getByText("+45 12345678")).toBeInTheDocument();

    // Check email
    expect(screen.getByText("kontakt@testfysio.dk")).toBeInTheDocument();
  });

  it("shows booking button for northstar clinics", () => {
    render(<ClinicSidebar clinic={mockClinic} />);
    expect(screen.getByText("Book tid")).toBeInTheDocument();
  });

  it("hides booking button for non-northstar clinics", () => {
    render(<ClinicSidebar clinic={{ ...mockClinic, northstar: false }} />);
    expect(screen.queryByText("Book tid")).not.toBeInTheDocument();
  });

  it("shows message when no contact information is available", () => {
    const clinicWithNoContact = {
      ...mockClinic,
      website: null,
      tlf: null,
      email: null,
    };

    render(<ClinicSidebar clinic={clinicWithNoContact} />);
    expect(
      screen.getByText("Vi har ingen kontakt oplysninger på denne klinik.")
    ).toBeInTheDocument();
  });
});
