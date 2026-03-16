import { render, screen } from "@testing-library/react";
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
});
