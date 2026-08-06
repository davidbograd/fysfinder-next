import { render, screen } from "@testing-library/react";
import { PartnershipBanner } from "../PartnershipBanner";

describe("PartnershipBanner", () => {
  it("shows the Dansk Skoliose Forening partnership on the skoliose specialty", () => {
    render(<PartnershipBanner specialtySlug="skoliose" />);

    expect(screen.getByAltText("Dansk Skoliose Forening")).toHaveAttribute(
      "src",
      "/images/samarbejdspartnere/dansk-skoliose-forening.png"
    );
    expect(
      screen.getByText(/I samarbejde med Dansk Skoliose Forening/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/indebærer ikke en faglig vurdering/)
    ).not.toBeInTheDocument();
  });

  it("shows the Hovedpine Foreningen partnership on hovedpine and migraene", () => {
    const { unmount } = render(<PartnershipBanner specialtySlug="hovedpine" />);
    expect(screen.getByAltText("Hovedpine Foreningen")).toBeInTheDocument();
    expect(
      screen.getByText(/indebærer ikke en faglig vurdering/)
    ).toBeInTheDocument();
    unmount();

    render(<PartnershipBanner specialtySlug="migraene" />);
    expect(screen.getByAltText("Hovedpine Foreningen")).toBeInTheDocument();
  });

  it("renders nothing for specialties without a partnership", () => {
    const { container } = render(<PartnershipBanner specialtySlug="ryg" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when no specialty is given", () => {
    const { container } = render(<PartnershipBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
