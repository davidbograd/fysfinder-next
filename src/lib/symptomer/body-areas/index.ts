// Added: 2026-09-07 - Ordered list of body areas for the symptom universe. Only active areas get routes and links; inactive ones exist so the grid can show the whole body.

import { knae } from "./knae";
import type { BodyArea, InactiveBodyArea } from "../types";

function inactive(
  slug: string,
  name: string,
  description: string
): InactiveBodyArea {
  return { slug, name, description, isActive: false };
}

/** Head-to-toe order, matching how the grid is read. */
export const bodyAreas: BodyArea[] = [
  inactive("nakke", "Nakke", "Smerter og stivhed i nakke og halshvirvelsøjle."),
  inactive("skulder", "Skulder", "Gener i skulderled, rotatorcuff og senevæv."),
  inactive("albue", "Albue", "Smerter på ind- eller ydersiden af albuen."),
  inactive("haandled", "Håndled", "Gener i håndled, hånd og fingre."),
  inactive("ryg", "Ryg", "Smerter i den øvre og midterste del af ryggen."),
  inactive("laend", "Lænd", "Smerter i lænden og nedre del af ryggen."),
  inactive("hofte", "Hofte", "Smerter i og omkring hofteleddet og ballen."),
  inactive("lyske", "Lyske", "Gener i lysken og de indvendige lårmuskler."),
  knae,
  inactive("ankel", "Ankel", "Gener i ankelled, akillessene og ledbånd."),
  inactive("fod", "Fod", "Smerter i fodsål, hæl, forfod og tæer."),
];
