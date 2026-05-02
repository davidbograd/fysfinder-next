import { fireEvent, render, screen, within } from "@testing-library/react";
import { AdminClinicAnalyticsTable } from "../AdminClinicAnalyticsTable";

describe("AdminClinicAnalyticsTable", () => {
  const rows = [
    {
      clinicId: "clinic-1",
      clinicName: "Aabenraa Fys",
      suburb: "Aabenraa",
      leadClicks: 14,
      phoneClicks: 4,
      websiteClicks: 5,
      emailClicks: 2,
      bookingClicks: 3,
      views: 200,
      listImpressions: 150,
      profileViews: 50,
    },
    {
      clinicId: "clinic-2",
      clinicName: "Rødekro Klinik",
      suburb: "Rødekro",
      leadClicks: 22,
      phoneClicks: 7,
      websiteClicks: 8,
      emailClicks: 3,
      bookingClicks: 4,
      views: 120,
      listImpressions: 95,
      profileViews: 25,
    },
    {
      clinicId: "clinic-3",
      clinicName: "Padborg Fysioterapi",
      suburb: "Padborg",
      leadClicks: 7,
      phoneClicks: 2,
      websiteClicks: 3,
      emailClicks: 1,
      bookingClicks: 1,
      views: 350,
      listImpressions: 300,
      profileViews: 50,
    },
  ];

  const getFirstClinic = () => {
    const tableRows = screen.getAllByRole("row");
    const firstDataRow = tableRows.find((row) => {
      const firstCell = within(row).queryAllByRole("cell")[0];
      return firstCell && firstCell.textContent !== "Total";
    });
    if (!firstDataRow) {
      throw new Error("Could not find first clinic row");
    }
    return within(firstDataRow).getAllByRole("cell")[0].textContent;
  };

  it("sorts by lead clicks descending by default", () => {
    render(<AdminClinicAnalyticsTable rows={rows} />);

    expect(getFirstClinic()).toContain("Rødekro Klinik");
  });

  it("sorts by views when clicking the Visninger header", () => {
    render(<AdminClinicAnalyticsTable rows={rows} />);

    fireEvent.click(screen.getByRole("button", { name: /visninger/i }));
    expect(getFirstClinic()).toContain("Padborg Fysioterapi");

    fireEvent.click(screen.getByRole("button", { name: /visninger/i }));
    expect(getFirstClinic()).toContain("Rødekro Klinik");
  });

  it("toggles breakdown columns and keeps the total row", () => {
    render(<AdminClinicAnalyticsTable rows={rows} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Vis Telefon" }));

    expect(screen.getByRole("checkbox", { name: "Vis Telefon" })).not.toBeChecked();
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).not.toContain(
      "Telefon"
    );

    const totalRow = screen.getByText("Total").closest("tr");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow as HTMLTableRowElement).getByText("43")).toBeInTheDocument();
    expect(within(totalRow as HTMLTableRowElement).getByText("670")).toBeInTheDocument();
    expect(within(totalRow as HTMLTableRowElement).getByText("545")).toBeInTheDocument();
  });
});
