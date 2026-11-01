// Regression: location-page skeleton must follow the live header + list/map layout.
import { render, screen } from "@testing-library/react";
import Loading from "../loading";

let mockParams: { location: string; specialty?: string } = { location: "aarhus" };
jest.mock("next/navigation", () => ({
  useParams: () => mockParams,
}));

function findByClass(container: HTMLElement, className: string) {
  return Array.from(container.querySelectorAll<HTMLElement>("*")).find((el) =>
    typeof el.className === "string" && el.className.split(" ").includes(className)
  );
}

describe("Location loading skeleton", () => {
  it("uses the full-width list/map grid instead of a narrow padded column", () => {
    const { container } = render(<Loading />);
    const wrapper = findByClass(container, "w-full");

    expect(wrapper).toBeTruthy();
    expect(wrapper!.className.split(" ")).not.toContain("container");
    expect(wrapper!.className).not.toMatch(/\bpx-4\b/);

    expect(findByClass(container, "max-w-[800px]")).toBeTruthy();
    expect(
      findByClass(container, "xl:grid-cols-[minmax(0,1fr)_420px]")
    ).toBeTruthy();
    expect(findByClass(container, "md:h-[520px]")).toBeTruthy();
  });

  // Regression: the skeleton left out the filter chips and specialty row, so the list jumped down on reveal.
  it("reserves space for the filter chips, specialty row and result count", () => {
    mockParams = { location: "aarhus" };
    render(<Loading />);

    for (const label of ["Med ydernummer", "Handicapadgang", "Online fysioterapi"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(/med speciale i/)).toBeInTheDocument();
    expect(screen.getByText(/klinikker fundet/)).toBeInTheDocument();
  });

  it("leaves out the specialty row on specialty pages, which don't show it", () => {
    mockParams = { location: "aarhus", specialty: "sportsskader" };
    render(<Loading />);

    expect(screen.queryByText(/med speciale i/)).toBeNull();
    expect(screen.getByText("Med ydernummer")).toBeInTheDocument();
  });

  it("keeps the sample content out of the accessibility tree", () => {
    render(<Loading />);

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.queryAllByRole("heading", { hidden: true }).length).toBeGreaterThan(0);
  });
});
