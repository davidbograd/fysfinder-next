import { render, screen, waitFor } from "@testing-library/react";
import { AdminSuburbLeadsSection } from "@/components/dashboard/AdminSuburbLeadsSection";
import { getSuburbAnalytics } from "@/app/actions/admin-stats";

jest.mock("@/app/actions/admin-stats", () => ({
  getSuburbAnalytics: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("AdminSuburbLeadsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders lead breakdown columns and CTA below table", async () => {
    (getSuburbAnalytics as jest.Mock).mockResolvedValue({
      rows: [
        {
          suburb: "Aabenraa",
          leadClicks: 18,
          phoneClicks: 7,
          websiteClicks: 8,
          emailClicks: 3,
          bookingClicks: 0,
          views: 120,
        },
      ],
      error: null,
    });

    render(<AdminSuburbLeadsSection variant="inline" />);

    await waitFor(() => {
      expect(screen.getByText("Aabenraa")).toBeInTheDocument();
    });

    expect(screen.queryByText("Sidste 30 dage")).not.toBeInTheDocument();
    expect(screen.getByText("Lead klik")).toBeInTheDocument();
    expect(screen.getByText("Tlf")).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();

    const leadCell = screen.getByText("18");
    expect(leadCell).toHaveClass("tabular-nums");
    expect(leadCell).toHaveClass("text-right");

    const seeAllLink = screen.getByRole("link", { name: "Se alle" });
    expect(seeAllLink).toHaveAttribute("href", "/dashboard/admin/analytics");
  });

  it("shows skeleton rows and CTA while suburb data is loading", () => {
    (getSuburbAnalytics as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<AdminSuburbLeadsSection variant="inline" />);

    expect(screen.getByRole("status", { name: "Bydata indlæses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Se alle" })).toHaveAttribute(
      "href",
      "/dashboard/admin/analytics"
    );
  });
});
