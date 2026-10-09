// Added: 2026-09-21 - Interaction tests for the muscle mass calculator's two methods.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MuscleMassCalculator } from "../MuscleMassCalculator";

async function fillBody(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Alder"), "35");
  await user.type(screen.getByLabelText("Højde"), "180");
  await user.type(screen.getByLabelText("Vægt"), "80");
}

describe("MuscleMassCalculator", () => {
  it("derives muscle mass from the tape measurements and shows the body composition behind it", async () => {
    const user = userEvent.setup();
    render(<MuscleMassCalculator />);

    await user.click(screen.getByRole("radio", { name: /Med målebånd/ }));
    await user.click(screen.getByRole("button", { name: "Mand" }));
    await fillBody(user);
    await user.type(screen.getByLabelText("Halsomkreds"), "38");
    await user.type(screen.getByLabelText("Taljeomkreds"), "85");
    await user.click(screen.getByRole("button", { name: "Beregn muskelmasse" }));

    const primaryResult = screen
      .getByText("Estimeret muskelmasse")
      .closest("div")!;
    expect(within(primaryResult).getByText("35,5 kg")).toBeInTheDocument();
    expect(
      within(primaryResult).getByText("Svarer til 44,4 % af din kropsvægt")
    ).toBeInTheDocument();

    expect(screen.getByText("16,2 %")).toBeInTheDocument();
    expect(screen.getByText("67,0 kg")).toBeInTheDocument();
    expect(
      screen.getByText("35-årig mand · 180 cm · 80 kg")
    ).toBeInTheDocument();
  });

  it("asks women for a hip measurement as well", async () => {
    const user = userEvent.setup();
    render(<MuscleMassCalculator />);

    await user.click(screen.getByRole("radio", { name: /Med målebånd/ }));
    expect(screen.queryByLabelText("Hofteomkreds")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Kvinde" }));
    await fillBody(user);
    await user.type(screen.getByLabelText("Halsomkreds"), "32");
    await user.type(screen.getByLabelText("Taljeomkreds"), "72");

    expect(screen.getByLabelText("Hofteomkreds")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Beregn muskelmasse" }));
    expect(screen.getByText("Udfyld hofteomkreds")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Hofteomkreds"), "95");
    await user.click(screen.getByRole("button", { name: "Beregn muskelmasse" }));

    expect(screen.getByText("Dit resultat")).toBeInTheDocument();
  });

  it("starts on the quick method, without the tape fields or the fat stats", async () => {
    const user = userEvent.setup();
    render(<MuscleMassCalculator />);

    expect(screen.getByRole("radio", { name: /Uden målebånd/ })).toBeChecked();
    expect(screen.queryByLabelText("Halsomkreds")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Taljeomkreds")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mand" }));
    await fillBody(user);
    await user.click(screen.getByRole("button", { name: "Beregn muskelmasse" }));

    expect(screen.getByText("33,4 kg")).toBeInTheDocument();
    expect(screen.queryByText("Fedtprocent")).not.toBeInTheDocument();
    expect(screen.queryByText("Fedtmasse")).not.toBeInTheDocument();
  });
});
