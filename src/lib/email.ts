/**
 * Email utility functions using Resend
 */

import { Resend } from "resend";
import { getAdminEmails } from "./admin";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ClaimNotificationData {
  klinik_navn: string;
  fulde_navn: string;
  email: string;
  telefon: string;
  job_titel: string;
}

/**
 * Send email notification to admins when a new clinic claim is submitted
 */
export async function sendClaimNotificationToAdmins(
  data: ClaimNotificationData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn("No admin emails configured - skipping claim notification");
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "FysFinder <noreply@fysfinder.dk>",
      to: adminEmails,
      subject: `Ny klinik anmodning: ${data.klinik_navn}`,
      html: `
        <h2>Ny klinik ejerskab anmodning</h2>
        <p>En ny anmodning om klinik ejerskab er blevet indsendt.</p>
        
        <h3>Klinik</h3>
        <p><strong>${data.klinik_navn}</strong></p>
        
        <h3>Ansøger</h3>
        <ul>
          <li><strong>Navn:</strong> ${data.fulde_navn}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Telefon:</strong> ${data.telefon || "Ikke angivet"}</li>
          <li><strong>Rolle:</strong> ${data.job_titel}</li>
        </ul>
        
        <p>
          <a href="https://fysfinder.dk/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Se anmodning i Dashboard
          </a>
        </p>
        
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Denne email er sendt automatisk fra FysFinder.
        </p>
      `,
    });

    if (error) {
      console.error("Failed to send claim notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending claim notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

