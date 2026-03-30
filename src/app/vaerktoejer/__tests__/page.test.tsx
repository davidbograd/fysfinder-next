// Added: 2026-03-30 - MVP smoke coverage for tools overview page.
import { render, screen } from "@testing-library/react";
import ToolsPage from "../page";

describe("ToolsPage", () => {
  it("renders heading and key tool links", () => {
    render(<ToolsPage />);

    expect(
      screen.getByText("Gratis værktøjer og beregnere til bedre træning, kost og sundhed")
    ).toBeInTheDocument();
    expect(screen.getByText("Kalorieberegner").closest("a")).toHaveAttribute(
      "href",
      "/vaerktoejer/kalorieberegner"
    );
  });
});
