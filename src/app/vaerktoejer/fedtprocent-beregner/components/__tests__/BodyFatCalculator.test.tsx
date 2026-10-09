// Added: 2026-10-09 - The body-fat button stays enabled and names the missing fields.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BodyFatCalculator } from "../BodyFatCalculator";

describe("BodyFatCalculator", () => {
  it("keeps the calculate button enabled and names the missing fields", async () => {
    const user = userEvent.setup();
    render(<BodyFatCalculator />);

    const submit = screen.getByRole("button", { name: "Beregn fedtprocent" });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(screen.getByText("Vælg køn")).toBeInTheDocument();
    expect(screen.getByText("Udfyld højde")).toBeInTheDocument();
    expect(screen.getByText("Udfyld halsomkreds")).toBeInTheDocument();
    expect(screen.getByText("Udfyld taljeomkreds")).toBeInTheDocument();
    expect(screen.getByText("Udfyld vægt")).toBeInTheDocument();
    expect(screen.queryByText("Resultat")).not.toBeInTheDocument();
  });

  it("asks women for the hip measurement too", async () => {
    const user = userEvent.setup();
    render(<BodyFatCalculator />);

    await user.click(screen.getByRole("button", { name: "Kvinde" }));
    await user.type(screen.getByLabelText("Højde (cm)"), "168");
    await user.type(screen.getByLabelText("Halsomkreds (cm)"), "33");
    await user.type(screen.getByLabelText("Taljeomkreds (cm)"), "75");
    await user.type(screen.getByLabelText("Vægt (kg)"), "62");
    await user.click(screen.getByRole("button", { name: "Beregn fedtprocent" }));

    expect(screen.getByText("Udfyld hofteomkreds")).toBeInTheDocument();
    expect(screen.queryByText("Udfyld højde")).not.toBeInTheDocument();
  });
});
