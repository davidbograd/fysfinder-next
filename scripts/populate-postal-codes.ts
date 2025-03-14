import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PostalCode {
  nr: string;
  navn: string;
  visueltcenter: [number, number];
  betegnelser?: string[];
}

interface GroupedCity {
  navn: string;
  postal_codes: string[];
  latitude: number;
  longitude: number;
  betegnelser: string[];
}

async function populatePostalCodes() {
  try {
    const response = await fetch("https://api.dataforsyningen.dk/postnumre");
    if (!response.ok) {
      throw new Error("Failed to fetch postal codes");
    }
    const postalCodes: PostalCode[] = await response.json();

    // Group by city name
    const groupedCities = postalCodes.reduce<Record<string, GroupedCity>>(
      (acc, curr) => {
        if (!acc[curr.navn]) {
          acc[curr.navn] = {
            navn: curr.navn,
            postal_codes: [],
            latitude: curr.visueltcenter[1],
            longitude: curr.visueltcenter[0],
            betegnelser: curr.betegnelser || [],
          };
        }
        acc[curr.navn].postal_codes.push(curr.nr);
        return acc;
      },
      {}
    );

    const citiesData = Object.values(groupedCities).map((city) => ({
      ...city,
      postal_codes: city.postal_codes.sort(),
      updated_at: new Date().toISOString(),
    }));

    // Upsert data into Supabase
    const { error } = await supabase.from("cities").upsert(citiesData, {
      onConflict: "navn",
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }

    console.log(`Successfully updated ${citiesData.length} cities`);
  } catch (error) {
    console.error("Error populating cities:", error);
  }
}

populatePostalCodes();
