import { buildKeywordMap } from "../build-keyword-map";
import type { LinkConfig } from "../types";

const testConfig: LinkConfig = {
  linkMappings: {
    ordbog: [
      {
        keywords: ["Skulder", "Skulderen", "Skuldre", "Skuldrene"],
        destination: "/ordbog/skulder",
      },
      {
        keywords: ["Skuldersmerter", "Skuldersmerte"],
        destination: "/ordbog/skuldersmerter",
      },
      {
        keywords: ["Kropsholdning"],
        destination: "/ordbog/kropsholdning",
      },
      {
        keywords: ["Knæ", "Knæet"],
        destination: "/ordbog/knae",
      },
    ],
    styrkeoevelser: [
      {
        keywords: ["Skulder"],
        destination: "/styrkeoevelser/skulder",
      },
      {
        keywords: ["Knæ"],
        destination: "/styrkeoevelser/knae",
      },
      {
        keywords: ["Face Pull"],
        destination: "/styrkeoevelser/face-pull",
      },
    ],
    blog: [],
    location: [],
    misc: [],
  },
};

describe("buildKeywordMap body-part silo", () => {
  it("on styrkeøvelser pages, remaps ordbog body-part inflections to the exercise universe", () => {
    const map = buildKeywordMap(testConfig, "/styrkeoevelser/ryg");

    expect(map.get("skulder")?.destination).toBe("/styrkeoevelser/skulder");
    expect(map.get("skuldre")?.destination).toBe("/styrkeoevelser/skulder");
    expect(map.get("skulderen")?.destination).toBe("/styrkeoevelser/skulder");
    expect(map.get("knæ")?.destination).toBe("/styrkeoevelser/knae");
  });

  it("on styrkeøvelser pages, keeps specific ordbog terms and named exercises", () => {
    const map = buildKeywordMap(testConfig, "/styrkeoevelser/skulder");

    expect(map.get("skuldersmerter")?.destination).toBe(
      "/ordbog/skuldersmerter"
    );
    expect(map.get("kropsholdning")?.destination).toBe(
      "/ordbog/kropsholdning"
    );
    expect(map.get("face pull")?.destination).toBe(
      "/styrkeoevelser/face-pull"
    );
  });

  it("on ordbog pages, remaps styrkeøvelser body-part hubs to ordbog", () => {
    const map = buildKeywordMap(testConfig, "/ordbog/skuldersmerter");

    expect(map.get("skulder")?.destination).toBe("/ordbog/skulder");
    expect(map.get("knæ")?.destination).toBe("/ordbog/knae");
  });

  it("on ordbog pages, still allows links to named exercise pages", () => {
    const map = buildKeywordMap(testConfig, "/ordbog/skulder");

    expect(map.get("face pull")?.destination).toBe(
      "/styrkeoevelser/face-pull"
    );
  });

  it("on blog pages, body-part head terms resolve to ordbog not øvelser", () => {
    const map = buildKeywordMap(testConfig, "/blog/some-post");

    expect(map.get("skuldre")?.destination).toBe("/ordbog/skulder");
    expect(map.get("knæet")?.destination).toBe("/ordbog/knae");
  });
});
