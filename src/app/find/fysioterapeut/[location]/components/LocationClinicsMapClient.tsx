// LocationClinicsMapClient
// Updated: add auto-fit behavior and upgraded map popup presentation

"use client";

import { City, Clinic } from "@/app/types";
import L from "leaflet";
import { Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

interface LocationClinicsMapClientProps {
  clinics: Clinic[];
  city: City;
}

interface MappableClinic {
  clinic: Clinic;
  latitude: number;
  longitude: number;
}

const defaultMarkerIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const highlightedMarkerIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [45, 45],
});

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function getClinicCoordinates(clinic: Clinic): { latitude: number; longitude: number } | null {
  const coordinatePairs: Array<[unknown, unknown]> = [
    [clinic.latitude, clinic.longitude],
    [clinic.clinic_latitude, clinic.clinic_longitude],
  ];

  for (const [latCandidate, lngCandidate] of coordinatePairs) {
    const latitude = toFiniteNumber(latCandidate);
    const longitude = toFiniteNumber(lngCandidate);

    if (latitude === null || longitude === null) continue;
    if (latitude < -90 || latitude > 90) continue;
    if (longitude < -180 || longitude > 180) continue;

    return { latitude, longitude };
  }

  return null;
}

function getTileConfiguration() {
  const defaultTemplate =
    process.env.NEXT_PUBLIC_MAP_TILE_URL_TEMPLATE?.trim() ||
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key={apiKey}";

  const tileApiKey = process.env.NEXT_PUBLIC_MAP_TILE_API_KEY?.trim();
  const needsApiKey = defaultTemplate.includes("{apiKey}");
  const canUseConfiguredTemplate = !needsApiKey || Boolean(tileApiKey);
  const resolvedTileUrl = canUseConfiguredTemplate
    ? defaultTemplate
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution =
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION?.trim() ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>';

  return { resolvedTileUrl, tileApiKey, attribution };
}

interface AutoFitBoundsProps {
  markerPositions: [number, number][];
  dataKey: string;
}

function AutoFitBounds({ markerPositions, dataKey }: AutoFitBoundsProps) {
  const map = useMap();
  const lastAppliedDataKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (markerPositions.length === 0) return;
    if (lastAppliedDataKeyRef.current === dataKey) return;

    lastAppliedDataKeyRef.current = dataKey;

    if (markerPositions.length === 1) {
      map.setView(markerPositions[0], 14, { animate: false });
      return;
    }

    const bounds = L.latLngBounds(markerPositions);
    map.fitBounds(bounds, {
      padding: [28, 28],
      maxZoom: 14,
      animate: false,
    });
  }, [map, markerPositions, dataKey]);

  return null;
}

function CleanLeafletPrefix() {
  const map = useMap();

  useEffect(() => {
    map.attributionControl.setPrefix(false);
  }, [map]);

  return null;
}

let activeScrollAnimationId = 0;

function smoothScrollToElement(target: HTMLElement, durationMs = 380) {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    target.scrollIntoView({ behavior: "auto", block: "center" });
    return;
  }

  const startY = window.scrollY;
  const targetRect = target.getBoundingClientRect();
  const rawTargetY =
    targetRect.top +
    window.scrollY -
    window.innerHeight / 2 +
    targetRect.height / 2;
  const maxScrollY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const targetY = Math.min(Math.max(rawTargetY, 0), maxScrollY);
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) return;

  const startTime = performance.now();
  const currentAnimationId = ++activeScrollAnimationId;

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const step = (now: number) => {
    if (currentAnimationId !== activeScrollAnimationId) return;

    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const eased = easeOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

export function LocationClinicsMapClient({
  clinics,
  city,
}: LocationClinicsMapClientProps) {
  const [hoveredCardClinicId, setHoveredCardClinicId] = useState<string | null>(null);
  const [hoveredMarkerClinicId, setHoveredMarkerClinicId] = useState<string | null>(null);
  const [selectedMarkerClinicId, setSelectedMarkerClinicId] = useState<string | null>(null);

  const mappableClinics: MappableClinic[] = useMemo(
    () =>
      clinics
        .map((clinic) => {
          const coordinates = getClinicCoordinates(clinic);
          if (!coordinates) return null;

          return { clinic, ...coordinates };
        })
        .filter((item): item is MappableClinic => Boolean(item)),
    [clinics]
  );

  const hasMappableClinics = mappableClinics.length > 0;
  const { resolvedTileUrl, tileApiKey, attribution } = getTileConfiguration();
  const centerLat = city.latitude || 55.6761;
  const centerLng = city.longitude || 12.5683;
  const markerPositions = useMemo<[number, number][]>(
    () => mappableClinics.map(({ latitude, longitude }) => [latitude, longitude]),
    [mappableClinics]
  );
  const autoFitDataKey = useMemo(
    () =>
      `${city.id}:${mappableClinics
        .map(({ clinic }) => clinic.clinics_id)
        .join(",")}`,
    [city.id, mappableClinics]
  );

  useEffect(() => {
    const handleCardHover = (
      event: Event
    ) => {
      const customEvent = event as CustomEvent<{ clinicId: string | null }>;
      setHoveredCardClinicId(customEvent.detail?.clinicId ?? null);
    };

    window.addEventListener(
      "fysfinder:clinic-card-hover",
      handleCardHover as EventListener
    );

    return () => {
      window.removeEventListener(
        "fysfinder:clinic-card-hover",
        handleCardHover as EventListener
      );
    };
  }, []);

  const dispatchMarkerHighlight = (clinicId: string | null) => {
    window.dispatchEvent(
      new CustomEvent("fysfinder:map-marker-hover", {
        detail: { clinicId },
      })
    );
  };

  useEffect(() => {
    const mapDrivenClinicId = hoveredMarkerClinicId ?? selectedMarkerClinicId ?? null;
    dispatchMarkerHighlight(mapDrivenClinicId);
  }, [hoveredMarkerClinicId, selectedMarkerClinicId]);

  const handleMarkerClick = (clinicId: string) => {
    setSelectedMarkerClinicId(clinicId);
    setHoveredMarkerClinicId(clinicId);

    const isDesktopViewport = window.matchMedia("(min-width: 1280px)").matches;
    if (!isDesktopViewport) return;

    const cardElement = document.getElementById(`clinic-card-${clinicId}`);
    if (cardElement) {
      smoothScrollToElement(cardElement, 380);
    }
  };

  const highlightedClinicId =
    hoveredMarkerClinicId ?? selectedMarkerClinicId ?? hoveredCardClinicId ?? null;

  if (!hasMappableClinics) {
    return (
      <section
        className="rounded-xl border border-gray-200 bg-gray-50 p-4"
        aria-label={`Kortvisning for ${city.bynavn}`}
      >
        <p className="text-sm text-gray-600">
          Kortet kunne ikke indlæses.{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-medium text-logo-blue hover:underline"
          >
            Prøv igen
          </button>
        </p>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
      aria-label={`Kortvisning for ${city.bynavn}`}
    >
      <div className="h-[380px] md:h-[520px]">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <CleanLeafletPrefix />
          <AutoFitBounds markerPositions={markerPositions} dataKey={autoFitDataKey} />

          <TileLayer
            attribution={attribution}
            url={resolvedTileUrl}
            {...(tileApiKey ? { apiKey: tileApiKey } : {})}
          />

          {mappableClinics.map(({ clinic, latitude, longitude }) => (
            <Marker
              key={clinic.clinics_id}
              position={[latitude, longitude]}
              icon={
                highlightedClinicId === clinic.clinics_id
                  ? highlightedMarkerIcon
                  : defaultMarkerIcon
              }
              eventHandlers={{
                mouseover: () => {
                  setHoveredMarkerClinicId(clinic.clinics_id);
                },
                mouseout: () => {
                  setHoveredMarkerClinicId(null);
                },
                click: () => handleMarkerClick(clinic.clinics_id),
                popupopen: () => {
                  setSelectedMarkerClinicId(clinic.clinics_id);
                },
                popupclose: () => {
                  setHoveredMarkerClinicId((currentHovered) =>
                    currentHovered === clinic.clinics_id ? null : currentHovered
                  );
                  setSelectedMarkerClinicId((currentSelected) =>
                    currentSelected === clinic.clinics_id ? null : currentSelected
                  );
                },
              }}
            >
              <Popup className="fysfinder-map-popup">
                <div className="w-[220px] space-y-2">
                  <Link
                    href={`/klinik/${clinic.klinikNavnSlug}`}
                    className="block text-sm font-semibold leading-tight text-logo-blue hover:underline"
                  >
                    {clinic.klinikNavn}
                  </Link>

                  {clinic.avgRating > 0 && (
                    <p className="text-xs text-gray-700">
                      <span className="mr-1 text-amber-500">★</span>
                      {clinic.avgRating.toFixed(1)} ({clinic.ratingCount ?? 0} anmeldelser)
                    </p>
                  )}

                  <p className="text-xs leading-relaxed text-gray-600">
                    {clinic.adresse}, {clinic.postnummer} {clinic.lokation}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="border-t border-gray-200 px-3 py-2">
        <p className="flex items-start gap-1.5 text-xs text-gray-600">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>
            Viser kun {city.bynavn}-klinikker.{" "}
            <strong>Opdateres ikke</strong> ved flytning.
          </span>
        </p>
      </div>
    </section>
  );
}

