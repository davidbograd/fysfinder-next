import {
  getYoutubePosterImageUrl,
} from "@/components/features/styrkeoevelser/youtube";

describe("getYoutubePosterImageUrl", () => {
  it("returns hqdefault poster URL for youtube.com watch links", () => {
    expect(
      getYoutubePosterImageUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    ).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns poster URL for youtu.be links", () => {
    expect(
      getYoutubePosterImageUrl("https://youtu.be/dQw4w9WgXcQ")
    ).toBe("https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  });

  it("returns null for non-YouTube URLs", () => {
    expect(getYoutubePosterImageUrl("https://example.com/video")).toBeNull();
  });
});
