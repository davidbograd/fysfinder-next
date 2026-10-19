import { ReactNode } from "react";
import { formatDecimal } from "@/lib/calculators/format";
import { cn } from "@/lib/utils";

export interface ToolBand {
  label: string;
  /** null på det laveste niveau, som ingen bund har. */
  min: number | null;
  /** null på det højeste niveau, som intet loft har. */
  max: number | null;
}

interface ToolBandTableProps {
  title: string;
  valueHeader: string;
  bands: ToolBand[];
  currentLabel: string;
  decimals?: number;
  footnote?: ReactNode;
}

function describeBand(band: ToolBand, decimals: number): string {
  const format = (value: number) => formatDecimal(value, decimals);
  if (band.min === null) return `Under ${format(band.max ?? 0)}`;
  if (band.max === null) return `${format(band.min)} og derover`;
  return `${format(band.min)} – ${format(band.max)}`;
}

/** Referenceniveauer med visitorens eget niveau fremhævet. */
export function ToolBandTable({
  title,
  valueHeader,
  bands,
  currentLabel,
  decimals = 1,
  footnote,
}: ToolBandTableProps) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                Niveau
              </th>
              <th className="bg-gray-50 p-3 text-sm font-medium text-gray-700">
                {valueHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {bands.map((band) => (
              <tr
                key={band.label}
                className={cn(
                  "border-b border-gray-100 last:border-0",
                  band.label === currentLabel &&
                    "bg-brand-primary/10 font-semibold text-brand-primary"
                )}
              >
                <td className="p-3 text-sm">{band.label}</td>
                <td className="p-3 text-sm tabular-nums">
                  {describeBand(band, decimals)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote && (
        <p className="mt-3 text-xs text-gray-500 text-pretty">{footnote}</p>
      )}
    </div>
  );
}
