/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "../route";
import { renderDueDateShareImage } from "@/lib/og/due-date-share-image";

jest.mock("@/lib/og/due-date-share-image", () => ({
  renderDueDateShareImage: jest.fn(),
}));

const mockRender = renderDueDateShareImage as jest.MockedFunction<
  typeof renderDueDateShareImage
>;

function request(query: string) {
  return new NextRequest(`https://www.fysfinder.dk/api/og/termin?${query}`);
}

describe("GET /api/og/termin", () => {
  beforeEach(() => {
    mockRender.mockReset().mockResolvedValue(new Response("png") as never);
  });

  it("renders the card with the due date and week", async () => {
    const response = await GET(request("termin=2027-06-30&dag=30"));

    expect(response.status).toBe(200);
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: new Date(Date.UTC(2027, 5, 30)),
        progress: expect.objectContaining({ weeks: 4, days: 2, trimester: 1 }),
      }),
      expect.objectContaining({ "Cache-Control": expect.stringContaining("s-maxage") })
    );
  });

  it("rejects an invalid due date", async () => {
    expect((await GET(request("termin=nope"))).status).toBe(400);
    expect(mockRender).not.toHaveBeenCalled();
  });
});
