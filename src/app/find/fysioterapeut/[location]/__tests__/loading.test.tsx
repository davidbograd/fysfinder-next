// Regression: location-page skeleton must follow the live header + list/map layout.
import { render, screen } from "@testing-library/react";
import Loading from "../loading";

let mockParams: { location: string; specialty?: string } = { location: "aarhus" };
jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

function findByClass(container: HTMLElement, className: string) {
  return Array.from(container.querySelectorAll<HTMLElement>("*")).find((el) =>
    el.className.split(" ").includes(className)
  );
}

describe("Location loading skeleton", () => {
  beforeEach(() => {
    mockParams = { location: "aarhus" };
  });

  it("uses the full-width list/map grid instead of a narrow padded column", () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper).toHaveClass("w-full");
    expect(wrapper.className.split(" ")).not.toContain("container");
    expect(wrapper.className).not.toMatch(/\bpx-4\b/);

    expect(findByClass(container, "max-w-[800px]")).toBeTruthy();
    expect(
      findByClass(container, "xl:grid-cols-[minmax(0,1fr)_420px]")
    ).toBeTruthy();
    expect(findByClass(container, "md:h-[520px]")).toBeTruthy();
  });

  // Regression: the skeleton left out the filter tab and specialty row, so the list jumped down on load.
  it("reserves space for the three filter chips and the specialty row", () => {
    render(<Loading />);

    expect(screen.getByTestId("filter-tab-skeleton").children).toHaveLength(3);
    expect(screen.getByTestId("specialties-skeleton")).toBeInTheDocument();
  });

  it("leaves out the specialty row on specialty pages, which don't show it", () => {
    mockParams = { location: "aarhus", specialty: "sportsskader" };
    render(<Loading />);

    expect(screen.queryByTestId("specialties-skeleton")).toBeNull();
    expect(screen.getByTestId("filter-tab-skeleton")).toBeInTheDocument();
  });
});
