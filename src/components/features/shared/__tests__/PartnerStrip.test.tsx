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
  });
});
