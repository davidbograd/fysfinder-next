// Updated: 2026-03-30 - Added verified badge and hover event MVP assertions.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClinicCard from "../ClinicCard";

const mockClinic = {
  clinicId: "test-clinic-id",
  klinikNavn: "Fysioterapi Klinikken",
  klinikNavnSlug: "fysioterapi-klinikken",
  ydernummer: true,
  avgRating: 4.5,
  ratingCount: 42,
  adresse: "Hovedgaden 123",
  postnummer: 2100,
  lokation: "København Ø",
  specialties: [
    { specialty_name: "Sportsfysioterapi", specialty_id: "1" },
    { specialty_name: "Børnefysioterapi", specialty_id: "2" },
  ],
  team_members: [
    {
      id: "1",
      name: "John Doe",
      role: "Fysioterapeut",
      image_url: "/test.jpg",
      display_order: 1,
    },
  ],
};

describe("ClinicCard", () => {
  it("renders basic clinic information", () => {
    render(<ClinicCard {...mockClinic} />);

    // Check clinic name
    expect(screen.getByText("Fysioterapi Klinikken")).toBeInTheDocument();

    // Check address
    expect(
      screen.getByText(/Hovedgaden 123, 2100 København Ø/)
    ).toBeInTheDocument();

    // Check rating
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(42 anmeldelser)")).toBeInTheDocument();
  });

  it("displays ydernummer badge when clinic has ydernummer", () => {
    render(<ClinicCard {...mockClinic} />);
    expect(screen.getByText("Har ydernummer")).toBeInTheDocument();
  });

  it("shows specialties with badges", () => {
    render(<ClinicCard {...mockClinic} />);
    expect(screen.getByText("Sportsfysioterapi")).toBeInTheDocument();
    expect(screen.getByText("Børnefysioterapi")).toBeInTheDocument();
  });

  it("shows distance when provided", () => {
    render(<ClinicCard {...mockClinic} distance={2.5} />);
    expect(screen.getByText(/2.5/)).toBeInTheDocument();
    expect(screen.getByText(/km væk/)).toBeInTheDocument();
  });

  it("shows verified clinic icon when clinic is verified", () => {
    render(<ClinicCard {...mockClinic} verified_klinik />);
    expect(screen.getByAltText("Verified clinic")).toBeInTheDocument();
  });

  it("renders logo.dev image when website and token are provided", () => {
    const previousToken = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = "pk_test_token";

    render(
      <ClinicCard {...mockClinic} website="https://www.example.com/clinic" />
    );

    const logo = screen.getByAltText("Fysioterapi Klinikken logo");
    expect(logo).toHaveAttribute(
      "src",
      "https://img.logo.dev/example.com?token=pk_test_token&size=64&format=png&fallback=404&retina=true"
    );

    process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY = previousToken;
  });

  it("dispatches card hover event on mouse enter", async () => {
    const user = userEvent.setup();
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    render(<ClinicCard {...mockClinic} />);
    const card = document.getElementById("clinic-card-test-clinic-id");
    expect(card).toBeTruthy();

    await user.hover(card!);

    expect(dispatchSpy).toHaveBeenCalled();
    const [eventArg] = dispatchSpy.mock.calls[0];
    expect(eventArg).toBeInstanceOf(CustomEvent);
    expect((eventArg as CustomEvent).type).toBe("fysfinder:clinic-card-hover");
    dispatchSpy.mockRestore();
  });
});
