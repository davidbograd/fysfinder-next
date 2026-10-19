import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WattPerKgCalculator } from "../WattPerKgCalculator";

describe("WattPerKgCalculator", () => {
  it("shows W/kg, the level and how far it is to the next one", async () => {
    const user = userEvent.setup();
    render(<WattPerKgCalculator />);

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await user.type(screen.getByLabelText("FTP"), "250");
    await user.type(screen.getByLabelText("Vægt"), "75");
    await user.click(screen.getByRole("button", { name: "Beregn watt pr. kg" }));

    const primary = screen.getByText("Din watt pr. kg").closest("div")!;
    expect(within(primary).getByText("3,33 W/kg")).toBeInTheDocument();
    expect(within(primary).getByText("Godt trænet")).toBeInTheDocument();
    expect(screen.getByText("+35 W")).toBeInTheDocument();
    expect(screen.getByText("Niveauer for mænd")).toBeInTheDocument();
  });

  it("estimates FTP from a 20-minute test", async () => {
    const user = userEvent.setup();
    render(<WattPerKgCalculator />);

    await user.click(screen.getByLabelText(/20-minutterstest/));
    await user.click(screen.getByRole("button", { name: "Kvinde" }));
    await user.type(
      screen.getByLabelText("Gennemsnitlig effekt på 20 minutter"),
      "200"
    );
    await user.type(screen.getByLabelText("Vægt"), "60");
    await user.click(screen.getByRole("button", { name: "Beregn watt pr. kg" }));

    expect(screen.getByText("190 W")).toBeInTheDocument();
    expect(screen.getByText("3,17 W/kg")).toBeInTheDocument();
  });

  it("names the missing fields instead of calculating", async () => {
    const user = userEvent.setup();
    render(<WattPerKgCalculator />);

    await user.click(screen.getByRole("button", { name: "Beregn watt pr. kg" }));

    expect(screen.getByText("Vælg køn")).toBeInTheDocument();
    expect(screen.getByText("Udfyld watt")).toBeInTheDocument();
    expect(screen.queryByText("Din watt pr. kg")).not.toBeInTheDocument();
  });
});
