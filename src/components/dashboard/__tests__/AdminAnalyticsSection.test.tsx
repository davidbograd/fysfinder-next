import { render, screen, waitFor } from "@testing-library/react";
import { AdminAnalyticsSection } from "@/components/dashboard/AdminAnalyticsSection";
import { getAggregateAnalytics } from "@/app/actions/admin-stats";

jest.mock("@/app/actions/admin-stats", () => ({
  getAggregateAnalytics: jest.fn(),
}));

jest.mock("@/components/dashboard/AdminSuburbLeadsSection", () => ({
  AdminSuburbLeadsSection: () => <div data-testid="suburb-leads-section" />,
}));

describe("AdminAnalyticsSection", () => {
  it("shows side-by-side visninger and lead klik breakdowns", async () => {
    (getAggregateAnalytics as jest.Mock).mockResolvedValue({
      error: null,
      stats: {
        totalEvents: 200,
        uniqueClinicsWithEvents: 12,
        listImpressions: 150,
        profileViews: 50,
        phoneClicks: 18,
        websiteClicks: 9,
        emailClicks: 3,
        bookingClicks: 2,
      },
    });

    render(<AdminAnalyticsSection />);

    await waitFor(() => {
      expect(screen.getByText("Visninger")).toBeInTheDocument();
    });

    expect(screen.getByText("Lead klik")).toBeInTheDocument();
    expect(screen.getByText("i søgeresultater")).toBeInTheDocument();
    expect(screen.getByText("på kliniksider")).toBeInTheDocument();
    expect(screen.getByText("vist tlf nummer")).toBeInTheDocument();
    expect(screen.getByText("website klik")).toBeInTheDocument();
    expect(screen.getByText("email klik")).toBeInTheDocument();
    expect(screen.getByText("booking klik")).toBeInTheDocument();
    expect(screen.getByTestId("suburb-leads-section")).toBeInTheDocument();
  });
});
