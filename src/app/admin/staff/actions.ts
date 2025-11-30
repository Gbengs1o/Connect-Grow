"use server";

import { createClient } from "@/lib/supabase/server";
import { StaffRole } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

// --- EXISTING ACTION (NO CHANGES) ---
export async function updateStaffRole(staffId: string, newRole: StaffRole) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("staff")
    .update({ role: newRole })
    .eq("id", staffId);

  if (error) {
    console.error("Supabase role update error:", error.message);
    return { success: false, error: "Failed to update role." };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}

// --- CORRECTED "SEND NOW" ACTION ---
export async function sendEmailToStaff(
  recipients: string[],
  subject: string,
  message: string
) {
  // This try...catch block is the main fix. It prevents the server from crashing.
  try {
    // 1. Explicitly check for the Resend API key first.
    if (!process.env.RESEND_API_KEY) {
      console.error("CRITICAL ERROR: RESEND_API_KEY is not defined in .env.local");
      return { success: false, error: "Email server is not configured correctly." };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // 2. Attempt to send the email.
    const { data, error } = await resend.emails.send({
      from: 'Innovast Solution <noreply@innovastsolution.com>',
      to: recipients,
      subject: subject,
      html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
    });

    // 3. If Resend itself reports an error, return it.
    if (error) {
      console.error("Resend API returned an error:", error);
      return { success: false, error: "Failed to send email due to a provider error." };
    }

    // 4. If successful, return the success message.
    return { success: true, data };

  } catch (exception) {
    // 5. If any other unexpected error happens, catch it and return a safe response.
    console.error("An unexpected exception occurred in sendEmailToStaff:", exception);
    return { success: false, error: "An unexpected server error occurred." };
  }
}

// --- EXISTING SCHEDULING ACTIONS (NO CHANGES) ---
export async function scheduleEmail(
  recipients: string[],
  subject: string,
  message: string,
  sendAt: Date,
  recurring: string
) {
  const supabase = await createClient();
  const htmlBody = `<p>${message.replace(/\n/g, "<br>")}</p>`;

  const { error } = await supabase.from("scheduled_emails").insert({
    recipients,
    subject,
    body: htmlBody,
    send_at: sendAt.toISOString(),
    recurring,
    status: "pending",
  });

  if (error) {
    console.error("Error scheduling email:", error);
    return { success: false, error: "Failed to schedule the email." };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function cancelScheduledEmail(emailId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("scheduled_emails")
    .delete()
    .eq("id", emailId);

  if (error) {
    console.error("Error canceling scheduled email:", error);
    return { success: false, error: "Failed to cancel the schedule." };
  }

  revalidatePath("/admin/staff");
  return { success: true };
}