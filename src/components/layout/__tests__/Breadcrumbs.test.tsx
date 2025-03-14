import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "../Breadcrumbs";

describe("Breadcrumbs", () => {
  const mockItems = [
    { text: "Home", link: "/" },
    { text: "Fysioterapeut", link: "/find/fysioterapeut" },
    { text: "København" },
  ];

  it("renders all breadcrumb items", () => {
    render(<Breadcrumbs items={mockItems} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Fysioterapeut")).toBeInTheDocument();
    expect(screen.getByText("København")).toBeInTheDocument();
  });

  it("renders correct number of separators", () => {
    render(<Breadcrumbs items={mockItems} />);
    const separators = screen.getAllByText("/");
    expect(separators).toHaveLength(2);
  });

  it("renders last item without link", () => {
    render(<Breadcrumbs items={mockItems} />);
    const lastItem = screen.getByText("København");
    expect(lastItem.tagName).toBe("SPAN");
    expect(lastItem.closest("a")).toBeNull();
  });

  it("renders links with correct hrefs", () => {
    render(<Breadcrumbs items={mockItems} />);

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");

    const fysioLink = screen.getByText("Fysioterapeut").closest("a");
    expect(fysioLink).toHaveAttribute("href", "/find/fysioterapeut");
  });
});
