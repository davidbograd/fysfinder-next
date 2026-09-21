// Added: 2026-09-21 - Interaction tests for the protein calculator.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProteinCalculator } from "../ProteinCalculator";

async function fillProfile(
  user: ReturnType<typeof userEvent.setup>,
  { weight = "80", age = "35" } = {}
) {
  await user.type(screen.getByLabelText("Vægt"), weight);
  await user.type(screen.getByLabelText("Alder"), age);
}

describe("ProteinCalculator", () => {
  it("turns the goal and activity level into a daily target with a range", async () => {
    const user = userEvent.setup();
    render(<ProteinCalculator />);

    await fillProfile(user);
    await user.click(screen.getByRole("button", { name: "Muskelopbygning" }));
    await user.selectOptions(
      screen.getByLabelText("Aktivitetsniveau"),
      "haard"
    );
    await user.click(
      screen.getByRole("button", { name: "Beregn proteinbehov" })
    );

    const primaryResult = screen
      .getByText("Dit daglige proteinbehov")
      .closest("div")!;
    expect(within(primaryResult).getByText("160 g protein")).toBeInTheDocument();
    expect(
      within(primaryResult).getByText("Anbefalet interval: 144–176 g om dagen")
    ).toBeInTheDocument();
    expect(
      screen.getByText("35 år · 80 kg · muskelopbygning · hård træning")
    ).toBeInTheDocument();
  });

  it("splits the target across the chosen number of meals", async () => {
    const user = userEvent.setup();
    render(<ProteinCalculator />);

    await fillProfile(user);
    await user.click(screen.getByRole("button", { name: "Muskelopbygning" }));
    await user.selectOptions(screen.getByLabelText("Aktivitetsniveau"), "haard");
    await user.selectOptions(screen.getByLabelText("Måltider om dagen"), "5");
    await user.click(
      screen.getByRole("button", { name: "Beregn proteinbehov" })
    );

    expect(screen.getByText("32 g")).toBeInTheDocument();
    expect(screen.getByText("Fordelt på 5 måltider")).toBeInTheDocument();
  });

  it("raises a sedentary visitor over 65 above the usual floor and says so", async () => {
    const user = userEvent.setup();
    render(<ProteinCalculator />);

    await fillProfile(user, { age: "70" });
    await user.selectOptions(
      screen.getByLabelText("Aktivitetsniveau"),
      "stillesiddende"
    );
    await user.click(
      screen.getByRole("button", { name: "Beregn proteinbehov" })
    );

    expect(screen.getByText(/Justeret for alder/)).toBeInTheDocument();
    expect(screen.getByText("1,2–1,5 g")).toBeInTheDocument();
  });

  it("leaves the same profile alone below 65", async () => {
    const user = userEvent.setup();
    render(<ProteinCalculator />);

    await fillProfile(user, { age: "35" });
    await user.selectOptions(
      screen.getByLabelText("Aktivitetsniveau"),
      "stillesiddende"
    );
    await user.click(
      screen.getByRole("button", { name: "Beregn proteinbehov" })
    );

    expect(screen.queryByText(/Justeret for alder/)).not.toBeInTheDocument();
    expect(screen.getByText("0,8–1,0 g")).toBeInTheDocument();
  });
});
