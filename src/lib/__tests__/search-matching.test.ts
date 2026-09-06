import {
  foldSearchText,
  rankFoldedMatch,
  rankSearchItems,
} from "../search-matching";

describe("foldSearchText", () => {
  it("treats Danish letters and separators as the same alphabet", () => {
    expect(foldSearchText("København K")).toBe("koebenhavnk");
    expect(foldSearchText("koebenhavn-k")).toBe("koebenhavnk");
    expect(foldSearchText("Knæ")).toBe("knae");
  });
});

describe("rankFoldedMatch", () => {
  it("ranks exact, prefix, contains, and 1-edit matches", () => {
    expect(rankFoldedMatch("odense", "Odense")).toBe(0);
    expect(rankFoldedMatch("odens", "Odense")).toBe(1);
    expect(rankFoldedMatch("arhus", "Aarhus C")).toBe(2);
    expect(rankFoldedMatch("odnse", "Odense")).toBe(3);
  });

  it("does not match unrelated short noise", () => {
    expect(rankFoldedMatch("xy", "Odense")).toBeNull();
    expect(rankFoldedMatch("kob", "Odense")).toBeNull();
  });
});

describe("rankSearchItems", () => {
  it("returns the closest city names first", () => {
    const ranked = rankSearchItems(
      ["Risskov", "Aarhus C", "Aarhus N"],
      "arhus",
      (name) => name
    );

    expect(ranked[0]).toBe("Aarhus C");
    expect(ranked).toEqual(expect.arrayContaining(["Aarhus C", "Aarhus N"]));
    expect(ranked).not.toContain("Risskov");
  });

  it("matches Knæ from ASCII typing", () => {
    const ranked = rankSearchItems(
      [
        { name: "Ryg", slug: "ryg" },
        { name: "Knæ", slug: "knae" },
      ],
      "knae",
      (item) => `${item.name} ${item.slug}`
    );

    expect(ranked.map((item) => item.name)).toEqual(["Knæ"]);
  });
});
