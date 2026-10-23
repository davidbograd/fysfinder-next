import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaceCalculator } from "../PaceCalculator";

describe("PaceCalculator", () => {
  it("offers the run as an image once distance and time give a pace", async () => {
    const user = userEvent.setup();
    render(<PaceCalculator />);

    expect(
      screen.queryByRole("link", { name: "Del dit løb - Download" })
    ).not.toBeInTheDocument();

    await user.type(screen.getAllByLabelText("Distance")[0], "10");
    const [, minutes, seconds] = screen.getAllByRole("spinbutton");
    await user.type(minutes, "48");
    await user.type(seconds, "30");

    expect(
      screen.getByRole("link", { name: "Del dit løb - Download" }).getAttribute("href")
    ).toBe("/api/og/resultat/pace?type=loeb&km=10&tid=2910");
  });

  it("offers the plan from a pace and a distance", async () => {
    const user = userEvent.setup();
    render(<PaceCalculator />);

    const [, , , paceMinutes] = screen.getAllByRole("spinbutton");
    await user.type(paceMinutes, "5");
    await user.type(screen.getByLabelText("Distance", { selector: "#pace-distance" }), "21");

    expect(
      screen.getByRole("link", { name: "Gem din løbeplan - Download" }).getAttribute("href")
    ).toBe("/api/og/resultat/pace?type=plan&km=21&tid=6300");
  });
});
