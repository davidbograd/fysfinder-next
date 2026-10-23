import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RmBeregner } from "../RmBeregner";

describe("RmBeregner", () => {
  it("offers the estimated 1RM as an image once weight and reps are filled", async () => {
    const user = userEvent.setup();
    render(<RmBeregner />);

    expect(
      screen.queryByRole("link", { name: "Del din 1RM - Download" })
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Vægt løftet"), "87");
    await user.type(screen.getByLabelText("Gentagelser"), "5");

    expect(
      screen.getByRole("link", { name: "Del din 1RM - Download" }).getAttribute("href")
    ).toBe("/api/og/resultat/rm?kg=100");
  });
});
