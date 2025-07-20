import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for search results
export interface SearchFilters {
  ydernummer?: boolean;
  handicap?: boolean;
}

export interface ClinicSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  ydernummer: boolean;
  handicapAccess: boolean;
  rating?: number;
  specialties: string[];
  distance?: number;
  isPremium: boolean;
  bookingLink?: string;
}

export interface SearchResults {
  clinics: ClinicSearchResult[];
  totalCount: number;
  hasMore: boolean;
}

export interface SearchParams {
  location: string; // City slug
  specialty?: string; // Specialty slug
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

export class SearchService {
  private static instance: SearchService;

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Main search function that finds clinics based on location, specialty, and filters
   */
  async searchClinics(params: SearchParams): Promise<SearchResults> {
    const { location, specialty, filters, page = 1, limit } = params;
    const offset = (page - 1) * (limit || 0);

    try {
      console.log(
        `Searching for clinics in location: ${location}, specialty: ${
          specialty || "all"
        }`
      );

      // STEP 1: Get city data first (same as working page.tsx)
      const { data: cityData, error: cityError } = await supabase
        .from("cities")
        .select("id, bynavn, bynavn_slug")
        .eq("bynavn_slug", location)
        .single();

      if (cityError || !cityData) {
        console.error("City not found:", location, cityError);
        throw new Error(`City not found: ${location}`);
      }

      console.log(`Found city: ${cityData.bynavn} (ID: ${cityData.id})`);

      // STEP 2: Build clinics query using city_id (same as working page.tsx)
      let selectQuery = `
        clinics_id,
        klinikNavn,
        lokation,
        adresse,
        tlf,
        email,
        website,
        ydernummer,
        handicapadgang,
        avgRating,
        postnummer,
        clinic_specialties (
          specialty:specialties (
            specialty_id,
            specialty_name,
            specialty_name_slug
          )
        )
      `;

      // Apply specialty filter if specified - build different query
      if (specialty) {
        selectQuery = `
          clinics_id,
          klinikNavn,
          lokation,
          adresse,
          tlf,
          email,
          website,
          ydernummer,
          handicapadgang,
          avgRating,
          postnummer,
          clinic_specialties (
            specialty:specialties (
              specialty_id,
              specialty_name,
              specialty_name_slug
            )
          ),
          filtered_specialties:clinic_specialties!inner (
            specialty:specialties!inner (
              specialty_name_slug
            )
          )
        `;
      }

      let query = supabase
        .from("clinics")
        .select(selectQuery)
        .eq("city_id", cityData.id); // Filter by city_id directly

      // Apply specialty filter if specified
      if (specialty) {
        query = query.eq(
          "filtered_specialties.specialty.specialty_name_slug",
          specialty
        );
      }

      // Apply filters
      if (filters?.ydernummer !== undefined) {
        query = query.eq("ydernummer", filters.ydernummer);
      }

      if (filters?.handicap !== undefined) {
        query = query.eq("handicapadgang", filters.handicap);
      }

      // Apply pagination only if limit is specified
      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      console.log("Executing search query...");

      // Execute the query
      const { data, error, count } = await query;

      if (error) {
        console.error("Search query error:", error);
        throw new Error(`Search failed: ${error.message}`);
      }

      console.log(
        `Query executed successfully. Found ${data?.length || 0} clinics`
      );
      console.log("Raw query result:", data);

      // Process and return results
      const clinics = await this.processSearchResults(data || []);

      return {
        clinics,
        totalCount: count || data?.length || 0,
        hasMore: limit ? (count || data?.length || 0) > offset + limit : false,
      };
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  }

  /**
   * Process raw database results into clean ClinicSearchResult objects
   */
  private async processSearchResults(
    rawResults: any[]
  ): Promise<ClinicSearchResult[]> {
    const processedResults: ClinicSearchResult[] = [];

    console.log(`Processing ${rawResults.length} raw results...`);

    for (const result of rawResults) {
      console.log(
        `Processing clinic ${result.clinics_id} (${result.klinikNavn})`
      );

      // Skip results without valid clinic ID
      if (!result.clinics_id) {
        console.warn(`Skipping result: No clinics_id`);
        continue;
      }

      // Extract specialties from the clinic_specialties relationship
      const specialties =
        result.clinic_specialties
          ?.map((cs: any) => cs.specialty?.specialty_name)
          .filter(Boolean) || [];

      console.log(`Clinic specialties:`, specialties);

      const clinic: ClinicSearchResult = {
        id: result.clinics_id,
        name: result.klinikNavn || `Klinik ${result.clinics_id}`,
        address: result.adresse || "Adresse ikke angivet",
        city: result.lokation || "Lokation ikke angivet",
        postalCode: result.postnummer?.toString() || "",
        phone: result.tlf || undefined,
        email: result.email || undefined,
        website: result.website || undefined,
        ydernummer: result.ydernummer || false,
        handicapAccess: result.handicapadgang || false,
        rating: result.avgRating ? parseFloat(result.avgRating) : undefined,
        specialties: specialties,
        distance: undefined, // Calculate if needed
        isPremium: false, // Skip premium logic for now
        bookingLink: undefined, // Skip booking link logic for now
      };

      console.log(`Processed clinic:`, {
        id: clinic.id,
        name: clinic.name,
        city: clinic.city,
        specialties: clinic.specialties.length,
      });

      processedResults.push(clinic);
    }

    console.log(
      `Successfully processed ${processedResults.length} clinics out of ${rawResults.length} raw results`
    );
    return processedResults;
  }

  /**
   * Get all specialties for a specific clinic
   */
  private async getClinicSpecialties(clinicId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("clinic_specialties")
      .select("specialty_name")
      .eq("clinics_id", clinicId);

    if (error) {
      console.error("Error fetching clinic specialties:", error);
      return [];
    }

    return data?.map((item) => item.specialty_name) || [];
  }

  /**
   * Get all available cities for location autocomplete
   */
  async getCities(
    searchTerm?: string
  ): Promise<Array<{ name: string; slug: string; postalCodes: string[] }>> {
    let query = supabase
      .from("cities")
      .select("bynavn, bynavn_slug, postal_codes")
      .order("bynavn");

    if (searchTerm) {
      query = query.ilike("bynavn", `%${searchTerm}%`);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error("Error fetching cities:", error);
      return [];
    }

    return (
      data?.map((city) => ({
        name: city.bynavn,
        slug: city.bynavn_slug,
        postalCodes: city.postal_codes || [],
      })) || []
    );
  }

  /**
   * Get all available specialties for dropdown
   */
  async getSpecialties(): Promise<
    Array<{ name: string; slug: string; id: string }>
  > {
    const { data, error } = await supabase
      .from("specialties")
      .select("specialty_id, specialty_name, specialty_name_slug")
      .order("specialty_name");

    if (error) {
      console.error("Error fetching specialties:", error);
      return [];
    }

    return (
      data?.map((specialty) => ({
        id: specialty.specialty_id,
        name: specialty.specialty_name,
        slug: specialty.specialty_name_slug,
      })) || []
    );
  }

  /**
   * Find city by postal code
   */
  async findCityByPostalCode(
    postalCode: string
  ): Promise<{ name: string; slug: string } | null> {
    const { data, error } = await supabase
      .from("cities")
      .select("bynavn, bynavn_slug")
      .contains("postal_codes", [postalCode])
      .single();

    if (error) {
      console.error("Error finding city by postal code:", error);
      return null;
    }

    return {
      name: data.bynavn,
      slug: data.bynavn_slug,
    };
  }

  /**
   * Get search statistics for a location
   */
  async getLocationStats(
    locationSlug: string
  ): Promise<{ totalClinics: number; specialtyCount: number }> {
    // Get total clinics in location
    const { count: totalClinics, error: clinicsError } = await supabase
      .from("clinics")
      .select("clinics_id", { count: "exact" })
      .eq("cities.bynavn_slug", locationSlug);

    if (clinicsError) {
      console.error("Error fetching location stats:", clinicsError);
    }

    // Get specialty count
    const { count: specialtyCount, error: specialtyError } = await supabase
      .from("clinic_specialties")
      .select("specialty_id", { count: "exact" })
      .eq("clinics.cities.bynavn_slug", locationSlug);

    if (specialtyError) {
      console.error("Error fetching specialty count:", specialtyError);
    }

    return {
      totalClinics: totalClinics || 0,
      specialtyCount: specialtyCount || 0,
    };
  }
}

export const searchService = SearchService.getInstance();
