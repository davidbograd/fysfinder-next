// Updated: 2026-09-29 - Covers the inline weekly weight-loss dropdown updating the calorie result.
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalorieCalculator } from "../CalorieCalculator";

describe("CalorieCalculator", () => {
  it("calculates and renders results for valid inputs", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<CalorieCalculator />);

    await user.type(screen.getByLabelText("Vægt (kg)"), "70");
    await user.type(screen.getByLabelText("Højde (cm)"), "175");
    await user.type(screen.getByLabelText("Alder (år)"), "30");
    await user.click(screen.getByRole("button", { name: "Mand" }));

    await user.click(screen.getByRole("button", { name: "Beregn kalorier" }));

    act(() => {
      jest.advanceTimersByTime(550);
    });

    expect(screen.getByText("Dine resultater")).toBeInTheDocument();
    expect(screen.getAllByText(/kcal\/dag/).length).toBeGreaterThan(0);

    const weeklyLoss = screen.getByLabelText("Vægttab pr. uge");
    expect(weeklyLoss).toHaveValue("0.5");
    expect(weeklyLoss).toHaveDisplayValue("0,5 kg");
    expect(screen.getByText("1542 kcal/dag")).toBeInTheDocument();
    expect(screen.getByText("For at tabe ca.")).toBeInTheDocument();
    expect(screen.getByText("om ugen")).toBeInTheDocument();

    await user.selectOptions(weeklyLoss, "0.25");
    expect(weeklyLoss).toHaveDisplayValue("0,25 kg");
    expect(screen.getByText("1792 kcal/dag")).toBeInTheDocument();

    await user.selectOptions(weeklyLoss, "1");
    expect(weeklyLoss).toHaveDisplayValue("1 kg");
    expect(screen.getByText("1042 kcal/dag")).toBeInTheDocument();

    jest.useRealTimers();
  });
});
