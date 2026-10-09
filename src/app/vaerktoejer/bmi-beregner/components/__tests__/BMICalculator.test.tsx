// Added: 2026-10-09 - The BMI button stays enabled and names the missing fields.
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BMICalculator } from "../BMICalculator";

describe("BMICalculator", () => {
  it("keeps the calculate button enabled and names the missing fields", async () => {
    const user = userEvent.setup();
    render(<BMICalculator />);

    const submit = screen.getByRole("button", { name: "Beregn BMI" });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(screen.getByText("Udfyld vægt")).toBeInTheDocument();
    expect(screen.getByText("Udfyld højde")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Vægt (kg)"), "70");
    expect(screen.queryByText("Udfyld vægt")).not.toBeInTheDocument();
    expect(screen.getByText("Udfyld højde")).toBeInTheDocument();
  });

  it("calculates once both fields are filled", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<BMICalculator />);

    await user.type(screen.getByLabelText("Vægt (kg)"), "70");
    await user.type(screen.getByLabelText("Højde (cm)"), "175");
    await user.click(screen.getByRole("button", { name: "Beregn BMI" }));

    act(() => {
      jest.advanceTimersByTime(550);
    });

    expect(screen.getByText("Dit BMI: 22.9")).toBeInTheDocument();
    jest.useRealTimers();
  });
});
