// Added: 2026-09-07 - Verifies the body-area picker reuses the styrkeoevelser illustrations, keeps them decorative, and degrades cleanly for areas that have no illustration.

import fs from "fs";
import path from "path";
import { render, screen } from "@testing-library/react";
import { BodyAreaGrid } from "../BodyAreaGrid";
import { getBodyAreaImage, getBodyAreas } from "@/lib/symptomer";
import type { BodyArea } from "@/lib/symptomer/types";

const inactiveWithImage: BodyArea = {
  slug: "nakke",
  name: "Nakke",
  description: "Smerter og stivhed i nakken.",
  isActive: false,
};

const inactiveWithoutImage: BodyArea = {
  slug: "findes-ikke",
  name: "Ukendt område",
  description: "Har ingen illustration.",
  isActive: false,
};

describe("BodyAreaGrid illustrations", () => {
  it("reuses the styrkeoevelser illustration for a body area", () => {
    expect(getBodyAreaImage("knae")).toBe(
      "/images/styrkeoevelser/kropsdele/styrkeovelser-knae.jpg"
    );
  });

  it("renders illustrations as decorative so screen readers only hear the label", () => {
    const { container } = render(
      <BodyAreaGrid bodyAreas={[inactiveWithImage]} />
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(screen.getByText("Nakke")).toBeInTheDocument();
  });

  it("renders no image element for a body area without an illustration", () => {
    const { container } = render(
      <BodyAreaGrid bodyAreas={[inactiveWithoutImage]} />
    );

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Ukendt område")).toBeInTheDocument();
  });

  it("points every resolved illustration at a file that exists in public/", () => {
    const missing = getBodyAreas()
      .map((area) => getBodyAreaImage(area.slug))
      .filter((src): src is string => Boolean(src))
      .filter((src) => !fs.existsSync(path.join(process.cwd(), "public", src)));

    expect(missing).toEqual([]);
  });

  it("gives every active body area an illustration", () => {
    const activeWithoutImage = getBodyAreas()
      .filter((area) => area.isActive)
      .filter((area) => !getBodyAreaImage(area.slug))
      .map((area) => area.slug);

    expect(activeWithoutImage).toEqual([]);
  });
});
