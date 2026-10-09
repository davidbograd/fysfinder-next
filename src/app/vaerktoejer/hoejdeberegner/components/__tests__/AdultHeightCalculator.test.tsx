// Added: 2026-09-21 - Interaction tests for the adult height prediction form.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdultHeightCalculator } from "../AdultHeightCalculator";

async function fillParents(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Mors højde"), "170");
  await user.type(screen.getByLabelText("Fars højde"), "182");
}

describe("AdultHeightCalculator", () => {
  it("predicts a height with its range once a sex and both parents are given", async () => {
    const user = userEvent.setup();
    render(<AdultHeightCalculator />);

    const submit = screen.getByRole("button", { name: "Beregn sluthøjde" });

    await user.click(screen.getByRole("button", { name: "Dreng" }));
    await fillParents(user);
    await user.click(submit);

    const primaryResult = screen
      .getByText("Forventet sluthøjde")
      .closest("div")!;
    expect(within(primaryResult).getByText("182,5 cm")).toBeInTheDocument();
    expect(
      within(primaryResult).getByText(
        "De fleste børn ender mellem 174,0 og 191,0 cm"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("176,0 cm")).toBeInTheDocument();
  });

  it("predicts a lower height for a girl with the same parents", async () => {
    const user = userEvent.setup();
    render(<AdultHeightCalculator />);

    await user.click(screen.getByRole("button", { name: "Pige" }));
    await fillParents(user);
    await user.click(screen.getByRole("button", { name: "Beregn sluthøjde" }));

    const primaryResult = screen
      .getByText("Forventet sluthøjde")
      .closest("div")!;
    expect(within(primaryResult).getByText("169,5 cm")).toBeInTheDocument();
  });

  it("repeats the entered parents and puts all three heights in the figure", async () => {
    const user = userEvent.setup();
    render(<AdultHeightCalculator />);

    await user.click(screen.getByRole("button", { name: "Dreng" }));
    await fillParents(user);
    await user.click(screen.getByRole("button", { name: "Beregn sluthøjde" }));

    expect(
      screen.getByText("Dreng · mor 170 cm · far 182 cm")
    ).toBeInTheDocument();

    // The drawing is decorative, so the heights it shows live in its label too.
    expect(
      screen.getByRole("img", {
        name: "Mor 170,0 cm, far 182,0 cm, og barnets forventede sluthøjde 182,5 cm.",
      })
    ).toBeInTheDocument();
  });

  it("asks for the child's sex rather than guessing it", async () => {
    const user = userEvent.setup();
    render(<AdultHeightCalculator />);

    await fillParents(user);
    await user.click(screen.getByRole("button", { name: "Beregn sluthøjde" }));

    expect(screen.getByText("Vælg barnets køn")).toBeInTheDocument();
    expect(screen.queryByText("Dit resultat")).not.toBeInTheDocument();
  });

  it("recalculates in place when the visitor changes an answer", async () => {
    const user = userEvent.setup();
    render(<AdultHeightCalculator />);

    await user.click(screen.getByRole("button", { name: "Dreng" }));
    await fillParents(user);
    await user.click(screen.getByRole("button", { name: "Beregn sluthøjde" }));
    expect(screen.getAllByText("182,5 cm").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Pige" }));
    await user.click(screen.getByRole("button", { name: "Beregn sluthøjde" }));

    expect(screen.queryByText("182,5 cm")).not.toBeInTheDocument();
    expect(screen.getAllByText("169,5 cm").length).toBeGreaterThan(0);
  });
});
