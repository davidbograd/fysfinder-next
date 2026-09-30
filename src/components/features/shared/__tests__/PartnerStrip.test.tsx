import { render, screen } from "@testing-library/react";
import { PartnerStrip } from "../PartnerStrip";

describe("PartnerStrip", () => {
  it("renders every partner association logo", () => {
    render(<PartnerStrip />);

    expect(screen.getByAltText("FAKS logo")).toBeInTheDocument();
    expect(screen.getByAltText("Hovedpineforeningen logo")).toBeInTheDocument();
    expect(
      screen.getByAltText("Dansk Skoliose Forening logo")
    ).toHaveAttribute(
      "src",
      "/images/samarbejdspartnere/dansk-skoliose-forening.png"
    );
    expect(screen.getByAltText("Dansk Dystoniforening logo")).toHaveAttribute(
      "src",
      "/images/samarbejdspartnere/dansk-dystoniforening.jpg"
    );
    expect(screen.getByAltText("FAKS logo").parentElement).toHaveClass(
      "max-sm:grid-cols-2",
      "max-sm:justify-items-center",
      "sm:flex-row"
    );
  });
});
