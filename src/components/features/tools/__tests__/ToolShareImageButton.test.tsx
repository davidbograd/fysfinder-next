import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolShareImageButton } from "../ToolShareImageButton";

describe("ToolShareImageButton", () => {
  const sendBeacon = jest.fn(() => true);

  beforeEach(() => {
    sendBeacon.mockClear();
    Object.defineProperty(navigator, "sendBeacon", { value: sendBeacon, configurable: true });
  });

  it("counts a result download for its tool when clicked", async () => {
    render(
      <ToolShareImageButton
        toolSlug="pace-beregner"
        variant="plan"
        href="/api/og/resultat/pace?type=plan&km=10&tid=3000"
        fileName="loebeplan-10-km.png"
        label="Gem din løbeplan - Download"
      />
    );

    const link = screen.getByRole("link", { name: "Gem din løbeplan - Download" });
    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [url, body] = sendBeacon.mock.calls[0] as unknown as [string, string];
    expect(url).toBe("/api/tool-event");
    expect(JSON.parse(body)).toMatchObject({
      toolSlug: "pace-beregner",
      eventType: "result_download",
      variant: "plan",
    });
  });
});
