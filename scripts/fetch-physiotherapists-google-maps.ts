const {
  config: dotenvConfig,
  resolve: pathResolve,
  join: pathJoin,
  existsSync,
  mkdirSync,
  writeFileSync,
} = require("./utils");
const { Client } = require("@googlemaps/google-maps-services-js");

// Load environment variables from .env.local
dotenvConfig({ path: pathResolve(process.cwd(), ".env.local") });

interface ClinicData {
  klinikNavn: string;
  adresse: string;
  postnummer: number;
  lokation: string;
  tlf: string;
  email: string;
  website: string;
  mapsUrl: string;
  avgRating: number;
  ratingCount: number;
  mandag: string;
  tirsdag: string;
  onsdag: string;
  torsdag: string;
  fredag: string;
  lørdag: string;
  søndag: string;
  antalBehandlere: number | null;
  parkering: string | null;
  handicapadgang: string;
  holdtræning: string | null;
  hjemmetræning: string | null;
  førsteKons: number | null;
  opfølgning: number | null;
  om_os: string | null;
}

interface SearchPoint {
  lat: number;
  lng: number;
}

// Define regions by postal codes and boundaries
const DENMARK_REGIONS = {
  // Copenhagen and surroundings (good starter region)
  copenhagen: {
    name: "Copenhagen",
    postalCodes: [1000, 2999],
    bounds: {
      north: 55.95, // Above Copenhagen
      south: 55.59, // Below Copenhagen
      east: 12.65, // East coast
      west: 12.25, // West of Copenhagen
    },
  },
  // All of Zealand except Copenhagen
  zealand: {
    name: "Zealand",
    postalCodes: [3000, 4999],
    bounds: {
      north: 56.15, // Helsingør
      south: 54.96, // South coast
      east: 12.7, // East coast
      west: 10.87, // West coast
    },
  },
  // Bornholm
  bornholm: {
    name: "Bornholm",
    postalCodes: [3700, 3790],
    bounds: {
      north: 55.31, // Northern tip of Bornholm
      south: 54.99, // Southern tip of Bornholm
      east: 15.19, // Eastern tip of Bornholm
      west: 14.68, // Western tip of Bornholm
    },
  },
  // Funen
  funen: {
    name: "Funen",
    postalCodes: [5000, 5999],
    bounds: {
      north: 55.61, // North coast
      south: 54.84, // South coast
      east: 10.87, // East coast
      west: 9.71, // West coast
    },
  },
  // South Jutland (including central)
  southJutland: {
    name: "South Jutland",
    postalCodes: [6000, 7999],
    bounds: {
      north: 56.1, // Above Aarhus
      south: 54.9, // German border
      east: 10.95, // East coast
      west: 8.07, // West coast
    },
  },
  // North Jutland
  northJutland: {
    name: "North Jutland",
    postalCodes: [8000, 9999],
    bounds: {
      north: 57.75, // Skagen
      south: 56.1, // South of Aarhus
      east: 10.95, // East coast
      west: 8.07, // West coast
    },
  },
} as const;

type RegionKey = keyof typeof DENMARK_REGIONS;

// Get region from command line argument
function getSelectedRegion(): RegionKey {
  const args = process.argv.slice(2);
  const region = args[0] as RegionKey;

  if (!region) {
    console.log("Available regions:");
    Object.entries(DENMARK_REGIONS).forEach(([key, value]) => {
      console.log(
        `  ${key}: ${value.name} (Postal codes: ${value.postalCodes[0]}-${value.postalCodes[1]})`
      );
    });
    throw new Error(
      "Please specify a region. Example: npx ts-node scripts/fetch-physiotherapists-google-maps.ts copenhagen"
    );
  }

  if (!DENMARK_REGIONS[region]) {
    throw new Error(
      `Invalid region: ${region}. Run without arguments to see available regions.`
    );
  }

  return region;
}

// Create a grid of points with 7km spacing (5km radius with overlap)
function generateSearchGrid(
  bounds: (typeof DENMARK_REGIONS)[RegionKey]["bounds"]
): SearchPoint[] {
  const points: SearchPoint[] = [];
  const GRID_SPACING = 0.063; // Approximately 7km in latitude/longitude

  for (let lat = bounds.south; lat <= bounds.north; lat += GRID_SPACING) {
    // Adjust longitude spacing based on latitude to maintain roughly equal distances
    const lngSpacing = GRID_SPACING / Math.cos((lat * Math.PI) / 180);

    for (let lng = bounds.west; lng <= bounds.east; lng += lngSpacing) {
      points.push({ lat, lng });
    }
  }

  return points;
}

// Configuration
const MAX_PLACES = 4000;
const BATCH_DELAY = 200;
const DAILY_QUOTA_LIMIT = 100000;
const COST_PER_SEARCH = 10;
const COST_PER_DETAILS = 5;
const SEARCH_RADIUS = 5000; // 5km radius

interface ApiUsage {
  searchCalls: number;
  detailsCalls: number;
  totalCost: number;
}

const usage: ApiUsage = {
  searchCalls: 0,
  detailsCalls: 0,
  totalCost: 0,
};

function updateUsage(type: "search" | "details") {
  if (type === "search") {
    usage.searchCalls++;
    usage.totalCost += COST_PER_SEARCH;
  } else {
    usage.detailsCalls++;
    usage.totalCost += COST_PER_DETAILS;
  }
}

function logUsage() {
  console.log("\nAPI Usage Summary:");
  console.log("----------------");
  console.log(`Search API calls: ${usage.searchCalls}`);
  console.log(`Details API calls: ${usage.detailsCalls}`);
  console.log(`Total API cost: ${usage.totalCost} units`);
  console.log(
    `Estimated cost in USD: $${((usage.totalCost / 1000) * 0.017).toFixed(2)}`
  );
}

// Helper function for delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initialize Google Maps client
const googleMapsClient = new Client({});

function formatOpeningHours(weekdayText: string[] | undefined): {
  mandag: string;
  tirsdag: string;
  onsdag: string;
  torsdag: string;
  fredag: string;
  lørdag: string;
  søndag: string;
} {
  const defaultHours = "Lukket";
  const days = {
    mandag: defaultHours,
    tirsdag: defaultHours,
    onsdag: defaultHours,
    torsdag: defaultHours,
    fredag: defaultHours,
    lørdag: defaultHours,
    søndag: defaultHours,
  };

  if (!weekdayText) return days;

  // The API gives us exactly what we need in Danish
  weekdayText.forEach((dayText) => {
    // Example: "mandag: 07.00–19.00"
    const [day, hours] = dayText.split(": ");
    days[day as keyof typeof days] = hours || defaultHours;
  });

  return days;
}

function extractPostalCode(address: string): number {
  const match = address.match(/\b\d{4}\b/);
  return match ? parseInt(match[0]) : 0;
}

function extractCity(address: string): string {
  const parts = address.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    // Common Zealand cities
    const majorCities = [
      "København",
      "Roskilde",
      "Køge",
      "Næstved",
      "Slagelse",
      "Holbæk",
      "Hillerød",
      "Helsingør",
    ];

    if (majorCities.some((city) => trimmed.includes(city))) {
      return trimmed.split(" ")[0]; // Take first word to avoid "København V" etc.
    }
  }
  return "Unknown"; // Changed from København to Unknown since we'll cover all of Denmark
}

function createCsvContent(clinics: ClinicData[]): string {
  // Define CSV headers
  const headers = [
    "klinikNavn",
    "adresse",
    "postnummer",
    "lokation",
    "tlf",
    "email",
    "website",
    "mapsUrl",
    "avgRating",
    "ratingCount",
    "mandag",
    "tirsdag",
    "onsdag",
    "torsdag",
    "fredag",
    "lørdag",
    "søndag",
    "antalBehandlere",
    "parkering",
    "handicapadgang",
    "holdtræning",
    "hjemmetræning",
    "førsteKons",
    "opfølgning",
    "om_os",
  ];

  // Create CSV rows
  const rows = clinics.map((clinic) => {
    return headers
      .map((header) => {
        const value = clinic[header as keyof ClinicData];
        // Handle special characters and commas in values
        if (value === null) return "";
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  // Combine headers and rows
  return [headers.join(","), ...rows].join("\n");
}

async function fetchClinics() {
  try {
    const selectedRegion = getSelectedRegion();
    const region = DENMARK_REGIONS[selectedRegion];

    console.log(`\nFetching clinics for ${region.name}`);
    console.log(
      `Postal code range: ${region.postalCodes[0]}-${region.postalCodes[1]}`
    );
    console.log("Boundaries:", region.bounds);

    // Generate search grid for selected region
    const searchPoints = generateSearchGrid(region.bounds);
    console.log(
      `\nGenerated ${searchPoints.length} search points for complete coverage`
    );

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key not found in environment variables");
    }

    const clinics = new Map<string, ClinicData>();
    let processedCount = 0;
    let estimatedTotalCost = 0;

    // First, do a preliminary search to estimate total results
    console.log("\nEstimating total results...");
    // Sample 10% of points for estimation
    const samplePoints = searchPoints.filter((_, index) => index % 10 === 0);

    for (const point of samplePoints) {
      const searchResponse = await googleMapsClient.textSearch({
        params: {
          query: "fysioterapeut",
          key: apiKey,
          location: point,
          radius: SEARCH_RADIUS,
          type: "physiotherapist",
          language: "da",
        },
      });
      updateUsage("search");

      const totalResults = searchResponse.data.results.length;
      estimatedTotalCost += COST_PER_SEARCH;
      estimatedTotalCost += totalResults * COST_PER_DETAILS;
    }

    // Extrapolate total cost
    estimatedTotalCost = Math.ceil(
      estimatedTotalCost * (searchPoints.length / samplePoints.length)
    );

    console.log(`\nEstimated total API cost: ${estimatedTotalCost} units`);
    console.log(
      `Estimated cost in USD: $${((estimatedTotalCost / 1000) * 0.017).toFixed(
        2
      )}`
    );

    if (estimatedTotalCost > DAILY_QUOTA_LIMIT) {
      throw new Error(
        `Estimated cost (${estimatedTotalCost}) exceeds daily quota limit (${DAILY_QUOTA_LIMIT})`
      );
    }

    const proceed = await new Promise((resolve) => {
      console.log("\nDo you want to proceed with the data collection? (y/n)");
      process.stdin.once("data", (data) => {
        resolve(data.toString().trim().toLowerCase() === "y");
      });
    });

    if (!proceed) {
      console.log("Operation cancelled by user");
      process.exit(0);
    }

    // Main data collection
    console.log("\nStarting data collection...");
    for (const point of searchPoints) {
      if (processedCount >= MAX_PLACES) break;
      if (usage.totalCost >= DAILY_QUOTA_LIMIT) {
        console.log("Daily quota limit reached, stopping...");
        break;
      }

      console.log(
        `\nSearching at coordinates: ${point.lat.toFixed(
          4
        )}, ${point.lng.toFixed(4)}...`
      );
      const searchResponse = await googleMapsClient.textSearch({
        params: {
          query: "fysioterapeut",
          key: apiKey,
          location: point,
          radius: SEARCH_RADIUS,
          type: "physiotherapist",
          language: "da",
        },
      });
      updateUsage("search");

      for (const place of searchResponse.data.results) {
        if (processedCount >= MAX_PLACES) break;
        if (usage.totalCost >= DAILY_QUOTA_LIMIT) {
          console.log("Daily quota limit reached, stopping...");
          break;
        }
        if (!place.place_id || clinics.has(place.place_id)) continue;

        try {
          const detailsResponse = await googleMapsClient.placeDetails({
            params: {
              place_id: place.place_id,
              key: apiKey,
              language: "da",
              fields: [
                "name",
                "formatted_address",
                "formatted_phone_number",
                "website",
                "rating",
                "user_ratings_total",
                "opening_hours",
                "wheelchair_accessible_entrance",
                "url",
              ],
            },
          });
          updateUsage("details");

          const details = detailsResponse.data.result;
          if (!details.name || !details.formatted_address) continue;

          const clinic: ClinicData = {
            klinikNavn: details.name,
            adresse: details.formatted_address,
            postnummer: extractPostalCode(details.formatted_address),
            lokation: extractCity(details.formatted_address),
            tlf: details.formatted_phone_number || "",
            email: "",
            website: details.website || "",
            mapsUrl: details.url || "",
            avgRating: details.rating || 0,
            ratingCount: details.user_ratings_total || 0,
            ...formatOpeningHours(details.opening_hours?.weekday_text),
            antalBehandlere: null,
            parkering: null,
            handicapadgang: (details as any).wheelchair_accessible_entrance
              ? "Ja"
              : "Nej",
            holdtræning: null,
            hjemmetræning: null,
            førsteKons: null,
            opfølgning: null,
            om_os: null,
          };

          clinics.set(place.place_id, clinic);
          processedCount++;

          if (processedCount % 10 === 0) {
            console.log(
              `Progress: ${processedCount} clinics processed (Current cost: ${usage.totalCost} units)`
            );
          } else {
            process.stdout.write(".");
          }

          await delay(1000); // 1 second delay between requests
        } catch (error) {
          console.error(`\nError fetching details for ${place.name}:`, error);
        }
      }
    }

    // Save to CSV
    const csvContent = createCsvContent(Array.from(clinics.values()));
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = pathJoin(
      process.cwd(),
      "data",
      `clinics-${timestamp}.csv`
    );

    // Ensure data directory exists
    const dataDir = pathJoin(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir);
    }

    // Write CSV file
    writeFileSync(outputPath, csvContent, "utf-8");
    console.log(`\n\nData saved to: ${outputPath}`);
    console.log(`Total clinics processed: ${clinics.size}`);
    logUsage();
  } catch (error) {
    console.error("\nError:", error);
    logUsage();
  }
}

// Run if called directly
if (require.main === module) {
  fetchClinics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
