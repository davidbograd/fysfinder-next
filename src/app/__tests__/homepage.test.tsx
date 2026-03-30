// Added: 2026-03-30 - MVP coverage for homepage success and fallback rendering.
import { render, screen } from "@testing-library/react";

const mockFetchCitiesWithCounts = jest.fn();
const mockFetchSpecialties = jest.fn();
const mockProcessCities = jest.fn();

jest.mock("../utils/cityUtils", () => ({
  fetchCitiesWithCounts: () => mockFetchCitiesWithCounts(),
  fetchSpecialties: () => mockFetchSpecialties(),
  processCities: (...args: unknown[]) => mockProcessCities(...args),
}));

jest.mock("@/components/features/blog-og-ordbog/FAQ", () => ({
  FAQ: () => <div>FAQ mock</div>,
}));

jest.mock("@/components/search/SearchInterface", () => ({
  SearchInterface: () => <div>SearchInterface mock</div>,
}));

jest.mock("@/components/features/search/RegionList", () => ({
  RegionList: () => <div>RegionList mock</div>,
}));

jest.mock("@/components/features/search/HeroDataPoints", () => ({
  HeroDataPoints: () => <div>HeroDataPoints mock</div>,
}));

describe("HomePage", () => {
  beforeEach(() => {
    mockFetchCitiesWithCounts.mockReset();
    mockFetchSpecialties.mockReset();
    mockProcessCities.mockReset();
  });

  it("renders success content with fetched data", async () => {
    mockFetchCitiesWithCounts.mockResolvedValue([
      {
        id: "1",
        bynavn: "Aarhus",
        bynavn_slug: "aarhus",
        postal_codes: ["8000"],
        clinic_count: 10,
      },
    ]);
    mockFetchSpecialties.mockResolvedValue([
      {
        specialty_id: "s1",
        specialty_name: "Ryg",
        specialty_name_slug: "ryg",
      },
    ]);
    mockProcessCities.mockReturnValue([{ name: "Midtjylland", cities: [] }]);

    const HomePage = (await import("../page")).default;
    render(await HomePage());

    expect(screen.getByText("Find fysioterapeut efter område")).toBeInTheDocument();
    expect(screen.getByText("RegionList mock")).toBeInTheDocument();
  });

  it("renders graceful fallback when data fetching fails", async () => {
    mockFetchCitiesWithCounts.mockRejectedValue(new Error("Network down"));

    const HomePage = (await import("../page")).default;
    render(await HomePage());

    expect(
      screen.getByText("Vi har midlertidigt problemer med at hente data.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Data kunne ikke indlæses. Prøv venligst igen senere.")
    ).toBeInTheDocument();
  });
});
