// NearbyCitiesLinks - internal link cluster to nearby towns beside the nearby-clinics list.
// Every link is rendered server-side so crawlers see the whole cluster.

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NearbyCity } from "@/app/types";

interface NearbyCitiesLinksProps {
  cities: NearbyCity[];
}

export function NearbyCitiesLinks({ cities }: NearbyCitiesLinksProps) {
  if (cities.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">
        Udforsk fysioterapeuter i andre byer
      </h2>
      <div className="flex flex-wrap gap-2">
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
              fysioterapeut {city.bynavn}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
