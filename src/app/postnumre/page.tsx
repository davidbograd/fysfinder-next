import { Metadata } from "next";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PostalCode } from "../types";

export const metadata: Metadata = {
  title: "Postnumre i Danmark | FysFinder",
  description: "Se alle postnumre og byer i Danmark",
};

async function getPostalCodes(): Promise<PostalCode[]> {
  try {
    const response = await fetch("https://api.dataforsyningen.dk/postnumre", {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch postal codes: ${response.status} ${response.statusText}`
      );
      throw new Error("Failed to fetch postal codes");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching postal codes:", error);
    throw new Error("Failed to fetch postal codes");
  }
}

interface GroupedPostalCodes {
  [key: string]: {
    postalCodes: string[];
    coordinates: [number, number];
    betegnelser: string[];
  };
}

export default async function PostalCodesPage() {
  const postalCodes = await getPostalCodes();

  // Group postal codes by city name with coordinates
  const groupedPostalCodes = postalCodes.reduce<GroupedPostalCodes>(
    (acc, curr) => {
      if (!acc[curr.navn]) {
        acc[curr.navn] = {
          postalCodes: [],
          coordinates: curr.visueltcenter,
          betegnelser: [],
        };
      }
      acc[curr.navn].postalCodes.push(curr.nr);
      acc[curr.navn].betegnelser = curr.betegnelser || [];
      return acc;
    },
    {}
  );

  // Sort cities by their lowest postal code
  const sortedCities = Object.entries(groupedPostalCodes).sort(
    ([, a], [, b]) => {
      const lowestA = Math.min(...a.postalCodes.map(Number));
      const lowestB = Math.min(...b.postalCodes.map(Number));
      return lowestA - lowestB;
    }
  );

  const breadcrumbItems = [
    { text: "Forside", link: "/" },
    { text: "Postnumre" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="text-3xl font-bold mb-6">Postnumre i Danmark</h1>

      <div className="text-gray-600 mb-8">
        Der er i alt {postalCodes.length.toLocaleString("da-DK")} postnumre
        fordelt på {sortedCities.length.toLocaleString("da-DK")} byer i Danmark
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCities.map(([cityName, data]) => (
          <div
            key={cityName}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="font-semibold mb-2">{cityName}</div>
            {data.betegnelser?.length > 0 && (
              <div className="text-sm text-gray-500 mb-2">
                Også kendt som: {data.betegnelser.join(", ")}
              </div>
            )}
            <div className="text-xs text-gray-500 mb-2">
              {data.coordinates[1].toFixed(4)}°N,{" "}
              {data.coordinates[0].toFixed(4)}°E
            </div>
            <div className="text-gray-600 flex flex-wrap gap-2">
              {data.postalCodes.sort().map((code) => (
                <span
                  key={code}
                  className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Data fra Danmarks Adressers Web API (DAWA)
      </div>
    </div>
  );
}
