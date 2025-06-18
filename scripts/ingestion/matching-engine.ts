// Clinic Matching Engine
// Handles deduplication and confidence scoring

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env.local") });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MatchResult {
  clinicId: string | null;
  confidence: number;
  matchType: "exact" | "fuzzy" | "none";
  reasons: string[];
}

export interface ClinicRecord {
  klinikNavn: string;
  adresse?: string;
  postnummer?: string;
  by?: string;
  tlf?: string;
  email?: string;
  website?: string;
}

export class MatchingEngine {
  /**
   * Find the best match for a clinic record
   */
  async findBestMatch(record: ClinicRecord): Promise<MatchResult> {
    const results: MatchResult[] = [];

    // 1. Exact match (name + postal code)
    const exactMatch = await this.findExactMatch(record);
    if (exactMatch) {
      results.push(exactMatch);
    }

    // 2. Fuzzy name matching with same postal code
    const fuzzyMatch = await this.findFuzzyMatch(record);
    if (fuzzyMatch) {
      results.push(fuzzyMatch);
    }

    // 3. Address-based matching
    const addressMatch = await this.findAddressMatch(record);
    if (addressMatch) {
      results.push(addressMatch);
    }

    // Return the best match (highest confidence)
    if (results.length === 0) {
      // Fallback: try fuzzy name and address match across all clinics if postnummer is missing
      if (!record.postnummer) {
        const fallbackFuzzy = await this.findFuzzyMatchNoPostnummer(record);
        if (fallbackFuzzy) results.push(fallbackFuzzy);
        const fallbackAddress = await this.findAddressMatchNoPostnummer(record);
        if (fallbackAddress) results.push(fallbackAddress);
      }
    }
    if (results.length === 0) {
      return {
        clinicId: null,
        confidence: 0.0,
        matchType: "none",
        reasons: ["No potential matches found"],
      };
    }
    return results.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * Find exact matches (name + postal code)
   */
  private async findExactMatch(
    record: ClinicRecord
  ): Promise<MatchResult | null> {
    if (!record.postnummer) {
      return null;
    }

    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, adresse, postnummer")
      .eq("klinikNavn", record.klinikNavn)
      .eq("postnummer", record.postnummer);

    if (error || !clinics || clinics.length === 0) {
      return null;
    }

    // If multiple exact matches, take the first one
    const clinic = clinics[0];

    return {
      clinicId: clinic.clinics_id,
      confidence: 1.0,
      matchType: "exact",
      reasons: ["Exact match: same name and postal code"],
    };
  }

  /**
   * Find fuzzy name matches in same postal code
   */
  private async findFuzzyMatch(
    record: ClinicRecord
  ): Promise<MatchResult | null> {
    if (!record.postnummer) {
      return null;
    }

    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, adresse, postnummer")
      .eq("postnummer", record.postnummer);

    if (error || !clinics || clinics.length === 0) {
      return null;
    }

    let bestMatch: any = null;
    let bestSimilarity = 0;

    for (const clinic of clinics) {
      const similarity = this.calculateNameSimilarity(
        record.klinikNavn,
        clinic.klinikNavn
      );
      if (similarity > bestSimilarity && similarity >= 0.7) {
        bestMatch = clinic;
        bestSimilarity = similarity;
      }
    }

    if (!bestMatch) {
      return null;
    }

    return {
      clinicId: bestMatch.clinics_id,
      confidence: bestSimilarity * 0.9, // Slightly lower than exact match
      matchType: "fuzzy",
      reasons: [
        `Fuzzy name match: ${(bestSimilarity * 100).toFixed(
          1
        )}% similarity in same postal code`,
      ],
    };
  }

  /**
   * Find matches based on address similarity
   */
  private async findAddressMatch(
    record: ClinicRecord
  ): Promise<MatchResult | null> {
    if (!record.adresse || !record.postnummer) {
      return null;
    }

    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, adresse, postnummer")
      .eq("postnummer", record.postnummer);

    if (error || !clinics || clinics.length === 0) {
      return null;
    }

    let bestMatch: any = null;
    let bestScore = 0;

    for (const clinic of clinics) {
      if (!clinic.adresse) continue;

      const addressSimilarity = this.calculateAddressSimilarity(
        record.adresse,
        clinic.adresse
      );
      const nameSimilarity = this.calculateNameSimilarity(
        record.klinikNavn,
        clinic.klinikNavn
      );

      // Combined score: 60% address, 40% name
      const combinedScore = addressSimilarity * 0.6 + nameSimilarity * 0.4;

      if (combinedScore > bestScore && combinedScore >= 0.6) {
        bestMatch = clinic;
        bestScore = combinedScore;
      }
    }

    if (!bestMatch) {
      return null;
    }

    return {
      clinicId: bestMatch.clinics_id,
      confidence: bestScore * 0.8, // Lower confidence for address-based matches
      matchType: "fuzzy",
      reasons: [
        `Address-based match: ${(bestScore * 100).toFixed(
          1
        )}% combined similarity`,
      ],
    };
  }

  /**
   * Calculate name similarity using normalized comparison
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // Remove punctuation
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();

    const n1 = normalize(name1);
    const n2 = normalize(name2);

    // Exact match after normalization
    if (n1 === n2) {
      return 1.0;
    }

    // Check if one contains the other
    if (n1.includes(n2) || n2.includes(n1)) {
      return 0.85;
    }

    // Levenshtein distance similarity
    return this.levenshteinSimilarity(n1, n2);
  }

  /**
   * Calculate address similarity
   */
  private calculateAddressSimilarity(addr1: string, addr2: string): number {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const a1 = normalize(addr1);
    const a2 = normalize(addr2);

    if (a1 === a2) {
      return 1.0;
    }

    // Extract street numbers and names for comparison
    const extractStreetInfo = (addr: string) => {
      const match = addr.match(/^(\d+)\s+(.+)/) || addr.match(/^(.+)\s+(\d+)$/);
      return match
        ? { number: match[1], street: match[2] }
        : { number: "", street: addr };
    };

    const info1 = extractStreetInfo(a1);
    const info2 = extractStreetInfo(a2);

    // If street numbers match and street names are similar
    if (info1.number === info2.number && info1.number !== "") {
      const streetSimilarity = this.levenshteinSimilarity(
        info1.street,
        info2.street
      );
      return Math.min(0.95, streetSimilarity + 0.2); // Boost for matching street number
    }

    return this.levenshteinSimilarity(a1, a2);
  }

  /**
   * Calculate Levenshtein distance similarity (0-1)
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 1.0;

    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Fuzzy name match across all clinics if no postnummer
   */
  private async findFuzzyMatchNoPostnummer(
    record: ClinicRecord
  ): Promise<MatchResult | null> {
    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, adresse, postnummer");
    if (error || !clinics || clinics.length === 0) {
      return null;
    }
    let bestMatch: any = null;
    let bestSimilarity = 0;
    for (const clinic of clinics) {
      const similarity = this.calculateNameSimilarity(
        record.klinikNavn,
        clinic.klinikNavn
      );
      if (similarity > bestSimilarity && similarity >= 0.7) {
        bestMatch = clinic;
        bestSimilarity = similarity;
      }
    }
    if (!bestMatch) {
      return null;
    }
    return {
      clinicId: bestMatch.clinics_id,
      confidence: bestSimilarity * 0.6, // Lower cap for no postnummer
      matchType: "fuzzy",
      reasons: [
        `Fuzzy name match (no postnummer): ${(bestSimilarity * 100).toFixed(
          1
        )}% similarity`,
      ],
    };
  }

  /**
   * Address-based match across all clinics if no postnummer
   */
  private async findAddressMatchNoPostnummer(
    record: ClinicRecord
  ): Promise<MatchResult | null> {
    if (!record.adresse) {
      return null;
    }
    const { data: clinics, error } = await supabase
      .from("clinics")
      .select("clinics_id, klinikNavn, adresse, postnummer");
    if (error || !clinics || clinics.length === 0) {
      return null;
    }
    let bestMatch: any = null;
    let bestScore = 0;
    for (const clinic of clinics) {
      if (!clinic.adresse) continue;
      const addressSimilarity = this.calculateAddressSimilarity(
        record.adresse,
        clinic.adresse
      );
      const nameSimilarity = this.calculateNameSimilarity(
        record.klinikNavn,
        clinic.klinikNavn
      );
      // Combined score: 60% address, 40% name
      const combinedScore = addressSimilarity * 0.6 + nameSimilarity * 0.4;
      if (combinedScore > bestScore && combinedScore >= 0.6) {
        bestMatch = clinic;
        bestScore = combinedScore;
      }
    }
    if (!bestMatch) {
      return null;
    }
    return {
      clinicId: bestMatch.clinics_id,
      confidence: bestScore * 0.5, // Lower cap for no postnummer
      matchType: "fuzzy",
      reasons: [
        `Address-based match (no postnummer): ${(bestScore * 100).toFixed(
          1
        )}% combined similarity`,
      ],
    };
  }
}
