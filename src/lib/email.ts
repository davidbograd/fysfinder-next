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

interface NewUserSignupData {
  full_name: string;
  email: string;
}

interface ClinicCreationNotificationData {
  clinic_name: string;
  city_name: string;
  address: string;
  postal_code: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requester_role: string;
}

interface ClinicApprovalEmailData {
  clinic_name: string;
  recipient_email: string;
  recipient_name?: string;
}

interface ClinicRejectionEmailData {
  clinic_name: string;
  recipient_email: string;
  rejection_reason: string;
  recipient_name?: string;
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
      from: "Fysfinder <noreply@fysfinder.dk>",
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
          Denne email er sendt automatisk fra Fysfinder.
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

/**
 * Send email notification to admins when a new clinic creation request is submitted
 */
export async function sendClinicCreationNotificationToAdmins(
  data: ClinicCreationNotificationData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn("No admin emails configured - skipping clinic creation notification");
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Fysfinder <noreply@fysfinder.dk>",
      to: adminEmails,
      subject: `Ny klinik oprettelses-anmodning: ${data.clinic_name}`,
      html: `
        <h2>Ny klinik oprettelses-anmodning</h2>
        <p>En bruger har indsendt en ny klinik til godkendelse.</p>

        <h3>Klinik</h3>
        <ul>
          <li><strong>Navn:</strong> ${data.clinic_name}</li>
          <li><strong>Adresse:</strong> ${data.address}</li>
          <li><strong>Postnummer:</strong> ${data.postal_code}</li>
          <li><strong>By:</strong> ${data.city_name}</li>
        </ul>

        <h3>Ansøger</h3>
        <ul>
          <li><strong>Navn:</strong> ${data.requester_name}</li>
          <li><strong>Email:</strong> ${data.requester_email}</li>
          <li><strong>Telefon:</strong> ${data.requester_phone || "Ikke angivet"}</li>
          <li><strong>Rolle:</strong> ${data.requester_role}</li>
        </ul>

        <p>
          <a href="https://fysfinder.dk/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Se anmodning i Dashboard
          </a>
        </p>

        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Denne email er sendt automatisk fra Fysfinder.
        </p>
      `,
    });

    if (error) {
      console.error("Failed to send clinic creation notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending clinic creation notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email notification to clinic owner when approval is completed
 */
export async function sendClinicApprovalEmailToUser(
  data: ClinicApprovalEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: "Fysfinder <noreply@fysfinder.dk>",
      to: data.recipient_email,
      subject: `Din klinik er godkendt: ${data.clinic_name}`,
      html: `
        <h2>Din klinik er nu godkendt</h2>
        <p>Hej ${data.recipient_name || "der"},</p>
        <p>
          Gode nyheder: din klinik <strong>${data.clinic_name}</strong> er nu godkendt på Fysfinder ✅
        </p>
        <p>
          Du kan nu administrere din klinikprofil fra dit dashboard.
        </p>

        <p style="margin-top: 24px;">
          <a href="https://fysfinder.dk/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Gå til Dashboard
          </a>
        </p>

        <p>Tak fordi du er med på Fysfinder, vi er glade for at du er her.</p>

        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Denne email er sendt automatisk fra Fysfinder.
        </p>
      `,
    });

    if (error) {
      console.error("Failed to send clinic approval email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending clinic approval email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email notification to clinic owner when request is rejected
 */
export async function sendClinicRejectionEmailToUser(
  data: ClinicRejectionEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: "Fysfinder <noreply@fysfinder.dk>",
      to: data.recipient_email,
      subject: `Opdatering på din klinikanmodning: ${data.clinic_name}`,
      html: `
        <h2>Opdatering på din klinikanmodning</h2>
        <p>Hej ${data.recipient_name || "der"},</p>
        <p>Tak for din anmodning om <strong>${data.clinic_name}</strong>.</p>
        <p>Din anmodning er desværre blevet afvist i denne omgang.</p>

        <p><strong>Begrundelse fra administrator:</strong></p>
        <p>${data.rejection_reason}</p>

        <p>
          Du er meget velkommen til at indsende en ny anmodning, når ovenstående er rettet.
        </p>

        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Denne email er sendt automatisk fra Fysfinder.
        </p>
      `,
    });

    if (error) {
      console.error("Failed to send clinic rejection email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending clinic rejection email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send email notification to admins when a new user signs up
 */
export async function sendNewUserSignupNotificationToAdmins(
  data: NewUserSignupData
): Promise<{ success: boolean; error?: string }> {
  const adminEmails = getAdminEmails();

  if (adminEmails.length === 0) {
    console.warn("No admin emails configured - skipping signup notification");
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "Fysfinder <noreply@fysfinder.dk>",
      to: adminEmails,
      subject: `🎉 Ny bruger tilmelding: ${data.email}`,
      html: `
        <h2>🎉 Ny bruger har tilmeldt sig!</h2>
        <p>En ny bruger har oprettet en konto på Fysfinder.</p>
        
        <h3>Bruger detaljer</h3>
        <ul>
          <li><strong>Navn:</strong> ${data.full_name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
        </ul>
        
        <p style="margin-top: 24px;">
          <a href="https://fysfinder.dk/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Se Dashboard
          </a>
        </p>
        
        <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">
          Denne email er sendt automatisk fra Fysfinder.
        </p>
      `,
    });

    if (error) {
      console.error("Failed to send signup notification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending signup notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

