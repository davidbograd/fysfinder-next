// Delbare story-billeder fra FTP- og watt pr. kg-beregneren.

import { formatDecimal } from "@/lib/calculators/format";
import { formatZoneRange } from "@/lib/calculators/ftp";
import type {
  FtpShareContent,
  WattPerKgShareContent,
} from "@/lib/og/cycling-share";
import {
  lucideIconDataUri,
  PanelRow,
  PanelTitle,
  renderStoryCard,
} from "@/lib/og/story-card";

const BIKE_ICON = lucideIconDataUri(
  '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
);

const ZONE_COLORS: Record<string, string> = {
  Z1: "#cbd5e1",
  Z2: "#38bdf8",
  Z3: "#34d399",
  Z4: "#fbbf24",
  Z5: "#f97316",
  Z6: "#f43f5e",
};

const TEST_CAPTION: Record<FtpShareContent["source"], string | undefined> = {
  ftp: undefined,
  test20: "Fra en 20-minutterstest",
  ramp: "Fra en ramptest",
};

export function renderFtpShareImage(
  content: FtpShareContent,
  headers?: HeadersInit,
) {
  const wattZones = content.zones.filter((zone) => zone.min !== null);
  return renderStoryCard(
    {
      icon: BIKE_ICON,
      label: "Min FTP",
      value: `${content.ftp} W`,
      caption: TEST_CAPTION[content.source],
      panel: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <PanelTitle>Mine wattzoner</PanelTitle>
          {wattZones.map((zone) => (
            <PanelRow
              key={zone.id}
              accent={ZONE_COLORS[zone.id]}
              name={`${zone.id} ${zone.name}`}
              range={formatZoneRange(zone)}
            />
          ))}
        </div>
      ),
    },
    headers,
  );
}

function formatBand(min: number | null, max: number | null): string {
  if (min === null) return `Under ${formatDecimal(max ?? 0, 1)}`;
  if (max === null) return `${formatDecimal(min, 1)}+`;
  return `${formatDecimal(min, 1)}–${formatDecimal(max, 1)}`;
}

export function renderWattPerKgShareImage(
  content: WattPerKgShareContent,
  headers?: HeadersInit,
) {
  return renderStoryCard(
    {
      icon: BIKE_ICON,
      label: "Min watt pr. kg",
      value: `${formatDecimal(content.wattsPerKg, 2)} W/kg`,
      badge: content.level,
      panel: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <PanelTitle>
            {`Niveauer for ${content.gender === "male" ? "mænd" : "kvinder"}`}
          </PanelTitle>
          {[...content.bands].reverse().map((band) => (
            <PanelRow
              key={band.label}
              name={band.label}
              range={formatBand(band.min, band.max)}
              highlighted={band.label === content.level}
            />
          ))}
        </div>
      ),
    },
    headers,
  );
}
