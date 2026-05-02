import { fireEvent, render, screen, within } from "@testing-library/react";
import { AdminSuburbAnalyticsTable } from "../AdminSuburbAnalyticsTable";

describe("AdminSuburbAnalyticsTable", () => {
  const rows = [
    {
      suburb: "Aabenraa",
      leadClicks: 14,
      phoneClicks: 4,
      websiteClicks: 5,
      emailClicks: 2,
      bookingClicks: 3,
      views: 200,
    },
    {
      suburb: "Rødekro",
      leadClicks: 22,
      phoneClicks: 7,
      websiteClicks: 8,
      emailClicks: 3,
      bookingClicks: 4,
      views: 120,
    },
    {
      suburb: "Padborg",
      leadClicks: 7,
      phoneClicks: 2,
      websiteClicks: 3,
      emailClicks: 1,
      bookingClicks: 1,
      views: 350,
    },
  ];

  const getFirstSuburb = () => {
    const tableRows = screen.getAllByRole("row");
    const firstDataRow = tableRows[1];
    return within(firstDataRow).getAllByRole("cell")[0].textContent;
  };

  it("sorts by lead clicks descending by default", () => {
    render(<AdminSuburbAnalyticsTable rows={rows} />);

    expect(getFirstSuburb()).toBe("Rødekro");
  });

  it("sorts by views when clicking the Visninger header", () => {
    render(<AdminSuburbAnalyticsTable rows={rows} />);

    fireEvent.click(screen.getByRole("button", { name: /visninger/i }));
    expect(getFirstSuburb()).toBe("Padborg");

    fireEvent.click(screen.getByRole("button", { name: /visninger/i }));
    expect(getFirstSuburb()).toBe("Rødekro");
  });

  it("sorts by lead click breakdown columns", () => {
    render(<AdminSuburbAnalyticsTable rows={rows} />);

    fireEvent.click(screen.getByRole("button", { name: /telefon/i }));
    expect(getFirstSuburb()).toBe("Rødekro");

    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    expect(getFirstSuburb()).toBe("Rødekro");

    fireEvent.click(screen.getByRole("button", { name: /booking/i }));
    expect(getFirstSuburb()).toBe("Rødekro");
  });

  it("shows the lead click breakdown columns", () => {
    render(<AdminSuburbAnalyticsTable rows={rows} />);

    expect(screen.getAllByText("Telefon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Website").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Email").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Booking").length).toBeGreaterThan(0);
  });

  it("toggles breakdown columns off", () => {
    render(<AdminSuburbAnalyticsTable rows={rows} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Vis Telefon" }));

    expect(screen.getByRole("checkbox", { name: "Vis Telefon" })).not.toBeChecked();
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).not.toContain(
      "Telefon"
    );
  });

  it("shows a total row", () => {
    render(<AdminSuburbAnalyticsTable rows={rows} />);

    const totalRow = screen.getByText("Total").closest("tr");
    expect(totalRow).not.toBeNull();
    expect(within(totalRow as HTMLTableRowElement).getByText("43")).toBeInTheDocument();
    expect(within(totalRow as HTMLTableRowElement).getByText("670")).toBeInTheDocument();
  });
});
