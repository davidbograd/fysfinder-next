import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MacroCalculator } from "../MacroCalculator";

describe("MacroCalculator", () => {
  it("splits a known calorie target into grams and per-meal portions", async () => {
    const user = userEvent.setup();
    render(<MacroCalculator />);

    await user.click(
      screen.getByRole("button", { name: "Jeg kender mit kalorietal" })
    );
    await user.type(screen.getByLabelText("Kalorier om dagen"), "2500");
    await user.type(screen.getByLabelText("Vægt"), "80");
    await user.type(screen.getByLabelText("Alder"), "30");
    await user.click(screen.getByRole("button", { name: "Beregn makroer" }));

    const kcal = screen.getByText("2.500 kcal");
    expect(kcal.querySelector("svg.lucide-chart-pie, svg.lucide-pie-chart")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Gem dine makroer - Download" }).getAttribute("href")
    ).toMatch(/^\/api\/og\/makro\?kcal=2500&protein=112-18&/);
    expect(screen.getByText("112 g")).toBeInTheDocument();
    expect(screen.getByText("326 g")).toBeInTheDocument();
    expect(screen.getByTestId("per-meal-protein")).toHaveTextContent("37 g");

    await user.selectOptions(screen.getByLabelText("Måltider om dagen"), "4");
    expect(screen.getByTestId("per-meal-protein")).toHaveTextContent("28 g");
  });

  it("only asks for the calorie target with the Nordic split", async () => {
    const user = userEvent.setup();
    render(<MacroCalculator />);

    await user.click(
      screen.getByRole("button", { name: "Jeg kender mit kalorietal" })
    );
    await user.click(screen.getByLabelText(/Nordiske anbefalinger/));

    expect(screen.queryByLabelText("Vægt")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Alder")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Aktivitetsniveau")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Mål")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Kalorier om dagen"), "2500");
    await user.click(screen.getByRole("button", { name: "Beregn makroer" }));

    expect(screen.getByText("2.500 kcal")).toBeInTheDocument();
    expect(screen.getByText("94 g")).toBeInTheDocument();
    expect(screen.queryByText(/pr\. kg kropsvægt/)).not.toBeInTheDocument();
  });

  it("explains when a split falls outside the Nordic recommendations", async () => {
    const user = userEvent.setup();
    render(<MacroCalculator />);

    await user.click(
      screen.getByRole("button", { name: "Jeg kender mit kalorietal" })
    );
    await user.type(screen.getByLabelText("Kalorier om dagen"), "2500");
    await user.type(screen.getByLabelText("Vægt"), "80");
    await user.type(screen.getByLabelText("Alder"), "30");
    await user.click(screen.getByLabelText(/Lavere kulhydrat/));
    await user.click(screen.getByRole("button", { name: "Beregn makroer" }));

    expect(
      screen.getByText(/Uden for de nordiske anbefalinger/)
    ).toBeInTheDocument();
  });

  it("asks for sex and height when it estimates the calories itself", async () => {
    const user = userEvent.setup();
    render(<MacroCalculator />);

    await user.click(screen.getByRole("button", { name: "Beregn makroer" }));

    expect(screen.getByText("Vælg køn")).toBeInTheDocument();
    expect(screen.getByText("Udfyld højde")).toBeInTheDocument();
    expect(screen.queryByLabelText("Kalorier om dagen")).not.toBeInTheDocument();
  });
});
