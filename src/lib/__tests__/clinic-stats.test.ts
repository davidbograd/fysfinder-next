import { mapEventCountsToClinicStats } from "../clinic-stats";

describe("mapEventCountsToClinicStats", () => {
  it("maps the six dashboard event types and totals interaktioner", () => {
    const stats = mapEventCountsToClinicStats("clinic-1", "30 dage", [
      { event_type: "phone_click", count: 2 },
      { event_type: "website_click", count: 3 },
      { event_type: "email_click", count: 1 },
      { event_type: "booking_click", count: 4 },
      { event_type: "list_impression", count: 11 },
      { event_type: "profile_view", count: 1 },
    ]);

    expect(stats).toEqual({
      clinicId: "clinic-1",
      period: "30 dage",
      phoneClicks: 2,
      websiteClicks: 3,
      emailClicks: 1,
      bookingClicks: 4,
      listImpressions: 11,
      profileViews: 1,
      totalContactClicks: 10,
    });
  });

  it("treats missing event types as zero and coerces numeric strings", () => {
    const stats = mapEventCountsToClinicStats("clinic-2", "august", [
      { event_type: "list_impression", count: "5" },
    ]);

    expect(stats.listImpressions).toBe(5);
    expect(stats.profileViews).toBe(0);
    expect(stats.totalContactClicks).toBe(0);
  });
});
