import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Using service role key for admin operations
);

// Type for the response
type ResponseData = {
  success?: boolean;
  error?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Optional: Add webhook security verification
    // const tallySignature = req.headers['x-tally-signature'];
    // if (!verifyTallySignature(tallySignature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const tallyData = req.body;

    // Basic validation
    if (!tallyData || !tallyData.eventId) {
      return res.status(400).json({
        error: "Invalid request body",
        message: "Request body must contain Tally form data",
      });
    }

    // Insert into staging table
    const { data, error } = await supabase
      .from("clinic_submissions_staging")
      .insert([
        {
          tally_submission_id: tallyData.eventId,
          submitted_at: new Date().toISOString(),
          raw_data: tallyData,
        },
      ]);

    if (error) {
      console.error("Supabase insertion error:", error);
      return res.status(500).json({
        error: "Database error",
        message: "Failed to store submission",
      });
    }

    // Log success (optional - remove in production if not needed)
    console.log(`Successfully processed submission: ${tallyData.eventId}`);

    // Return success
    return res.status(200).json({
      success: true,
      message: "Submission processed successfully",
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Webhook processing error:", error);

    // Return error response
    return res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while processing the submission",
    });
  }
}
