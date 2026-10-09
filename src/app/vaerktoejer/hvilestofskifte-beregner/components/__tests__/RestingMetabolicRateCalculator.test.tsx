// Added: 2026-09-21 - Interaction tests for the resting metabolic rate form.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RestingMetabolicRateCalculator } from "../RestingMetabolicRateCalculator";

async function fillBody(
  user: ReturnType<typeof userEvent.setup>,
  { age = "35", height = "180", weight = "80" } = {}
) {
  await user.type(screen.getByLabelText("Alder"), age);
  await user.type(screen.getByLabelText("Højde"), height);
  await user.type(screen.getByLabelText("Vægt"), weight);
}

describe("RestingMetabolicRateCalculator", () => {
  it("calculates the daily resting metabolism and its conversions", async () => {
    const user = userEvent.setup();
    render(<RestingMetabolicRateCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await fillBody(user);
    await user.click(
      screen.getByRole("button", { name: "Beregn hvilestofskifte" })
    );

    expect(screen.getByText("1.755 kcal/dag")).toBeInTheDocument();
    expect(screen.getByText("73,1 kcal")).toBeInTheDocument();
    expect(screen.getByText("7.343 kJ/dag")).toBeInTheDocument();
  });

  it("repeats the entered profile above the result", async () => {
    const user = userEvent.setup();
    render(<RestingMetabolicRateCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await fillBody(user, { age: "31", height: "193", weight: "100" });
    await user.click(
      screen.getByRole("button", { name: "Beregn hvilestofskifte" })
    );

    expect(
      screen.getByText("31-årig mand · 193 cm · 100 kg")
    ).toBeInTheDocument();
  });

  it("keeps the decimals the visitor typed in that summary", async () => {
    const user = userEvent.setup();
    render(<RestingMetabolicRateCalculator />);

    await user.click(screen.getByRole("button", { name: "Kvinde" }));
    await fillBody(user, { age: "42", height: "167,5", weight: "62,4" });
    await user.click(
      screen.getByRole("button", { name: "Beregn hvilestofskifte" })
    );

    expect(
      screen.getByText("42-årig kvinde · 167,5 cm · 62,4 kg")
    ).toBeInTheDocument();
  });

  it("names the missing piece instead of calculating on a guess", async () => {
    const user = userEvent.setup();
    render(<RestingMetabolicRateCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await fillBody(user, { age: "35", height: "180", weight: "5" });
    await user.click(
      screen.getByRole("button", { name: "Beregn hvilestofskifte" })
    );

    expect(
      screen.getByText("Indtast en vægt mellem 30 og 400 kg.")
    ).toBeInTheDocument();
  });
});
