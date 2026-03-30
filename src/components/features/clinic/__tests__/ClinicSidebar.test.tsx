import { render, screen } from "@testing-library/react";
import { ClinicSidebar } from "../ClinicSidebar";

// Mock the analytics hook
jest.mock("@/app/hooks/useClinicAnalytics", () => ({
  useClinicAnalytics: () => ({
    trackWebsiteClick: jest.fn(),
    trackPhoneClick: jest.fn(),
    trackEmailClick: jest.fn(),
    trackBookingClick: jest.fn(),
  }),
}));

const mockClinic = {
  klinikNavn: "Test Fysioterapi",
  avgRating: 4.8,
  ratingCount: 25,
  website: "https://www.testfysio.dk",
  tlf: "+45 12345678",
  email: "kontakt@testfysio.dk",
  id: "123",
  cityId: "city-1",
  verified_klinik: true,
  premium_listing: {
    booking_link: "https://booking.example.com/test",
    start_date: "2024-01-01T00:00:00.000Z",
    end_date: "2099-01-01T00:00:00.000Z",
  },
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

    // Check phone button text and masked number state
    expect(screen.getByText("Vis nummer")).toBeInTheDocument();

    // Check email
    expect(screen.getByText("kontakt@testfysio.dk")).toBeInTheDocument();
  });

  it("shows booking button for active premium clinics", () => {
    render(<ClinicSidebar clinic={mockClinic} />);
    expect(screen.getByText("Book tid")).toBeInTheDocument();
  });

  it("hides booking button for non-premium clinics", () => {
    render(<ClinicSidebar clinic={{ ...mockClinic, premium_listing: null }} />);
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
