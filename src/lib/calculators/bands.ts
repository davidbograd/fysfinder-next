import { formatDecimal } from "./format";

/** Et referenceniveau; grænserne er "fra og med" min og "under" max. */
export interface ToolBand {
  label: string;
  /** null på det laveste niveau, som ingen bund har. */
  min: number | null;
  /** null på det højeste niveau, som intet loft har. */
  max: number | null;
}

export function describeBand(band: ToolBand, decimals = 1): string {
  const format = (value: number) => formatDecimal(value, decimals);
  if (band.min === null) return `Under ${format(band.max ?? 0)}`;
  if (band.max === null) return `${format(band.min)} og derover`;
  return `${format(band.min)} – ${format(band.max)}`;
}

export function findBand<T extends ToolBand>(bands: readonly T[], value: number): T {
  return (
    bands.find(
      (band) => (band.min === null || value >= band.min) && (band.max === null || value < band.max)
    ) ?? bands[bands.length - 1]
  );
}
