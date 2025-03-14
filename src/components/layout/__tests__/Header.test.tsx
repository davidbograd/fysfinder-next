import { render, screen } from "@testing-library/react";
import Header from "../Header";

describe("Header", () => {
  it("renders logo and navigation links", () => {
    render(<Header />);

    // Check logo link
    const logoLink = screen.getByRole("link", { name: "" });
    expect(logoLink).toHaveAttribute("href", "/");

    // Check navigation links
    expect(screen.getByText("Ordbog")).toBeInTheDocument();
    expect(screen.getByText("Find fysioterapeut")).toBeInTheDocument();

    // Check navigation links have correct hrefs
    const ordbogLink = screen.getByText("Ordbog").closest("a");
    expect(ordbogLink).toHaveAttribute("href", "/ordbog");

    const findLink = screen.getByText("Find fysioterapeut").closest("a");
    expect(findLink).toHaveAttribute("href", "/find/fysioterapeut/danmark");
  });
});
