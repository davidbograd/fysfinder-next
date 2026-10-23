import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FtpCalculator } from "../FtpCalculator";

describe("FtpCalculator", () => {
  it("only offers the two test methods", () => {
    render(<FtpCalculator />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.queryByLabelText(/Jeg kender min FTP/)).not.toBeInTheDocument();
  });

  it("estimates FTP from a 20-minute test and shows its seven watt zones", async () => {
    const user = userEvent.setup();
    render(<FtpCalculator />);

    // 263 x 0,95 = 249,85 -> 250 W
    await user.type(
      screen.getByLabelText("Gennemsnitlig effekt over 20 minutter (watt)"),
      "263"
    );
    await user.click(screen.getByRole("button", { name: "Beregn min FTP" }));

    const primary = screen.getByText("Din estimerede FTP").closest("div")!;
    expect(within(primary).getByText("250 watt")).toBeInTheDocument();
    expect(screen.getByText("Dine wattzoner til cykeltræning")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    expect(screen.getByText("225–262 W")).toBeInTheDocument();
    expect(screen.getByText("Fra 300 W")).toBeInTheDocument();
    expect(screen.getByText("Maksimal sprintindsats – individuelt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "watt pr. kg-beregner" })).toHaveAttribute(
      "href",
      "/vaerktoejer/watt-pr-kg-beregner"
    );
    expect(screen.getByRole("link", { name: "Del din FTP - Download" })).toHaveAttribute(
      "href",
      "/api/og/ftp?ftp=250&test=test20"
    );
    expect(primary.querySelector("svg.lucide-bike")).toBeInTheDocument();
  });

  it("estimates FTP from a ramp test and hides the result when the method changes", async () => {
    const user = userEvent.setup();
    render(<FtpCalculator />);

    await user.click(screen.getByLabelText(/Ramptest/));
    await user.type(
      screen.getByLabelText("Bedste gennemsnitlige effekt over ét minut (watt)"),
      "360"
    );
    await user.click(screen.getByRole("button", { name: "Beregn min FTP" }));

    expect(screen.getByText("Din estimerede FTP")).toBeInTheDocument();
    expect(screen.getByText("270 watt")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/20-minutterstest/));
    expect(screen.queryByText("270 watt")).not.toBeInTheDocument();
  });

  it("offers only the image download, not a copy action", async () => {
    const user = userEvent.setup();
    render(<FtpCalculator />);

    await user.type(
      screen.getByLabelText("Gennemsnitlig effekt over 20 minutter (watt)"),
      "280"
    );
    await user.click(screen.getByRole("button", { name: "Beregn min FTP" }));

    expect(screen.getByRole("link", { name: "Del din FTP - Download" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Kopiér/ })).not.toBeInTheDocument();
  });

  it("asks for the missing watt instead of calculating", async () => {
    const user = userEvent.setup();
    render(<FtpCalculator />);

    await user.click(screen.getByRole("button", { name: "Beregn min FTP" }));

    expect(screen.getByText("Udfyld watt")).toBeInTheDocument();
    expect(screen.queryByText("Dine wattzoner til cykeltræning")).not.toBeInTheDocument();
  });
});
