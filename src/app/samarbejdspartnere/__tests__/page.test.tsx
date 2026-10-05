import { render, screen, within } from "@testing-library/react";
import PartnersPage from "../page";

describe("PartnersPage", () => {
  it("lists Dansk Dystoniforening with logo and site, without the clinic disclaimer", () => {
    render(<PartnersPage />);

    const section = screen.getByRole("heading", { name: "Dansk Dystoniforening" })
      .parentElement as HTMLElement;

    expect(screen.getByAltText("Dansk Dystoniforening logo")).toHaveAttribute(
      "src",
      "/images/samarbejdspartnere/dansk-dystoniforening.png"
    );
    expect(within(section).getByRole("link", { name: /dystoni\.dk/ })).toHaveAttribute(
      "href",
      "https://dystoni.dk"
    );
    expect(
      within(section).queryByText(/indebærer ikke en faglig vurdering/)
    ).not.toBeInTheDocument();
  });
});
