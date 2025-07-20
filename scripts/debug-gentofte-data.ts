#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugGentofteData() {
  console.log("🔍 Investigating Gentofte data integrity...\n");

  // 1. Check if Gentofte city exists
  console.log("1. Checking if Gentofte city exists:");
  const { data: gentofteCity, error: cityError } = await supabase
    .from("cities")
    .select("id, bynavn, bynavn_slug, postal_codes")
    .eq("bynavn_slug", "gentofte")
    .single();

  if (cityError || !gentofteCity) {
    console.log("❌ Gentofte city not found in cities table!");
    console.log("Error:", cityError?.message);

    // Check if there are any cities with similar names
    const { data: similarCities } = await supabase
      .from("cities")
      .select("id, bynavn, bynavn_slug")
      .ilike("bynavn", "%gentofte%");

    if (similarCities && similarCities.length > 0) {
      console.log("🔍 Found similar cities:");
      similarCities.forEach((city) => {
        console.log(`   - ${city.bynavn} (slug: ${city.bynavn_slug})`);
      });
    }
    return;
  }

  console.log("✅ Gentofte city found:");
  console.log(`   - ID: ${gentofteCity.id}`);
  console.log(`   - Name: ${gentofteCity.bynavn}`);
  console.log(`   - Slug: ${gentofteCity.bynavn_slug}`);
  console.log(`   - Postal codes: ${gentofteCity.postal_codes?.join(", ")}`);

  // 2. Check clinics with Gentofte postal codes
  console.log("\n2. Checking clinics with Gentofte postal codes:");
  const { data: clinicsWithPostalCodes, error: postalError } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, postnummer, city_id, lokation")
    .in("postnummer", gentofteCity.postal_codes || []);

  if (postalError) {
    console.log(
      "❌ Error fetching clinics by postal code:",
      postalError.message
    );
    return;
  }

  console.log(
    `✅ Found ${
      clinicsWithPostalCodes?.length || 0
    } clinics with Gentofte postal codes`
  );

  if (clinicsWithPostalCodes && clinicsWithPostalCodes.length > 0) {
    console.log("📋 Sample clinics with Gentofte postal codes:");
    clinicsWithPostalCodes.slice(0, 5).forEach((clinic) => {
      console.log(`   - ${clinic.klinikNavn} (${clinic.postnummer})`);
      console.log(`     city_id: ${clinic.city_id || "NULL"}`);
      console.log(`     lokation: ${clinic.lokation || "NULL"}`);
    });
  }

  // 3. Check clinics linked to Gentofte city
  console.log("\n3. Checking clinics linked to Gentofte city:");
  const { data: linkedClinics, error: linkedError } = await supabase
    .from("clinics")
    .select("clinics_id, klinikNavn, postnummer, lokation")
    .eq("city_id", gentofteCity.id);

  if (linkedError) {
    console.log("❌ Error fetching linked clinics:", linkedError.message);
    return;
  }

  console.log(
    `✅ Found ${linkedClinics?.length || 0} clinics linked to Gentofte city`
  );

  if (linkedClinics && linkedClinics.length > 0) {
    console.log("📋 Clinics properly linked to Gentofte:");
    linkedClinics.forEach((clinic) => {
      console.log(`   - ${clinic.klinikNavn} (${clinic.postnummer})`);
    });
  }

  // 4. Check for data mismatch
  console.log("\n4. Data integrity analysis:");
  const clinicsWithPostalCount = clinicsWithPostalCodes?.length || 0;
  const linkedClinicsCount = linkedClinics?.length || 0;

  console.log(
    `   - Clinics with Gentofte postal codes: ${clinicsWithPostalCount}`
  );
  console.log(`   - Clinics linked to Gentofte city: ${linkedClinicsCount}`);

  if (clinicsWithPostalCount > linkedClinicsCount) {
    console.log("⚠️  Data integrity issue detected!");
    console.log(
      "   Some clinics have Gentofte postal codes but aren't linked to Gentofte city."
    );

    // Find the mismatched clinics
    const linkedClinicIds = new Set(
      linkedClinics?.map((c) => c.clinics_id) || []
    );
    const mismatchedClinics = clinicsWithPostalCodes?.filter(
      (c) => !linkedClinicIds.has(c.clinics_id)
    );

    if (mismatchedClinics && mismatchedClinics.length > 0) {
      console.log("\n🔧 Clinics that need to be fixed:");
      mismatchedClinics.forEach((clinic) => {
        console.log(`   - ${clinic.klinikNavn} (${clinic.postnummer})`);
        console.log(`     Current city_id: ${clinic.city_id || "NULL"}`);
        console.log(`     Should be: ${gentofteCity.id}`);
      });

      console.log(`\n💡 To fix this, you could run:`);
      console.log(
        `UPDATE clinics SET city_id = '${
          gentofteCity.id
        }' WHERE postnummer IN (${gentofteCity.postal_codes
          ?.map((pc: string) => `'${pc}'`)
          .join(", ")});`
      );
    }
  } else if (
    clinicsWithPostalCount === linkedClinicsCount &&
    linkedClinicsCount > 0
  ) {
    console.log("✅ Data integrity looks good!");
  } else {
    console.log("❓ No clinics found for Gentofte (either method).");
  }

  // 5. Test the current search query
  console.log("\n5. Testing current search query:");
  const { data: searchResults, error: searchError } = await supabase
    .from("clinics")
    .select(
      `
      clinics_id,
      klinikNavn,
      postnummer,
      cities:city_id (
        bynavn,
        bynavn_slug
      )
    `
    )
    .eq("cities.bynavn_slug", "gentofte")
    .not("city_id", "is", null);

  if (searchError) {
    console.log("❌ Search query error:", searchError.message);
  } else {
    console.log(
      `✅ Search query returned ${searchResults?.length || 0} results`
    );
    if (searchResults && searchResults.length > 0) {
      console.log("📋 Search results:");
      searchResults.forEach((clinic) => {
        console.log(`   - ${clinic.klinikNavn} (${clinic.postnummer})`);
      });
    }
  }
}

// Run the diagnostic
debugGentofteData().catch(console.error);
