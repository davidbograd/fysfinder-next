// NearbyCitiesLinks - internal link cluster to nearby towns, shown under the nearby-clinics
// section heading. Every link is rendered server-side so crawlers see the whole cluster.

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NearbyCity } from "@/app/types";

interface NearbyCitiesLinksProps {
  cities: NearbyCity[];
}

export function NearbyCitiesLinks({ cities }: NearbyCitiesLinksProps) {
  if (cities.length === 0) return null;

  return (
    // No heading of its own: the nearby-clinics section heading above already frames these.
    <div className="mb-8 flex flex-wrap gap-2">
      {cities.map((city) => (
        <Link
          key={city.id}
          href={`/find/fysioterapeut/${city.bynavn_slug}`}
          className="transition-transform hover:scale-105"
        >
          <Badge
            variant="secondary"
            className="text-sm hover:bg-secondary/80 transition-colors cursor-pointer hover:shadow-sm"
          >
            Fysioterapeut {city.bynavn}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
