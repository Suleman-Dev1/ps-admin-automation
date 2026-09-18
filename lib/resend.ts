import { Resend } from "resend";
import { db } from "./db";
import { MANDATORY_ADVICE_DISCLAIMER } from "./openai";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes("placeholder") || key.trim() === "") {
    return null;
  }
  return new Resend(key);
}

export function replacePlaceholders(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value || "");
  }
  return result;
}

export async function sendOnboardingEmail(params: {
  to: string;
  templateType: "checklist_initial" | "reminder_chase_1" | "reminder_chase_2" | "reminder_chase_3" | "staff_summary";
  vars: {
    client_name: string;
    service: string;
    missing_items?: string;
    upload_link?: string;
    [key: string]: string | undefined;
  };
  clientId?: string;
  reminderNumber?: number;
}): Promise<{ success: boolean; id?: string; error?: string; status: "sent" | "logged" }> {
  const { to, templateType, vars, clientId, reminderNumber } = params;
  const theme = await db.getThemeSettings();
  const template = await db.getEmailTemplate(templateType);

  const mergedVars: Record<string, string> = {
    firm_name: theme.firm_name,
    client_name: vars.client_name || "Valued Client",
    service: vars.service || "Professional Services",
    missing_items: vars.missing_items || "None",
    upload_link: vars.upload_link || "#",
  };

  const subject = replacePlaceholders(template?.subject || `Update regarding your ${mergedVars.service}`, mergedVars);
  const headline = replacePlaceholders(template?.headline || `Onboarding Notice`, mergedVars);
  const bodyText = replacePlaceholders(template?.body_text || `Please review your onboarding requirements.`, mergedVars);
  const ctaText = template?.cta_button_text || "View Portal";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: ${theme.font_family}; background: ${theme.background_color}; color: ${theme.text_primary}; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: ${theme.surface_color}; border: 1px solid ${theme.border_color}; border-radius: ${theme.border_radius}; padding: 32px; }
    .header { border-bottom: 2px solid ${theme.border_color}; padding-bottom: 16px; margin-bottom: 24px; }
    .title { color: ${theme.primary_color}; font-size: 20px; font-weight: bold; margin: 0; }
    .tagline { color: ${theme.text_secondary}; font-size: 13px; margin-top: 4px; }
    .content { line-height: 1.6; font-size: 15px; margin-bottom: 28px; }
    .btn { display: inline-block; background-color: ${theme.primary_color}; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: ${theme.border_radius}; font-weight: 600; font-size: 14px; }
    .disclaimer { margin-top: 32px; padding-top: 16px; border-top: 1px solid ${theme.border_color}; font-size: 11px; color: ${theme.text_secondary}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">${theme.firm_name}</div>
      <div class="tagline">${theme.tagline}</div>
    </div>
    <h2>${headline}</h2>
    <div class="content">
      <p>${bodyText.replace(/\n/g, "<br>")}</p>
      ${vars.upload_link ? `<p style="margin-top: 24px;"><a href="${vars.upload_link}" class="btn">${ctaText}</a></p>` : ""}
    </div>
    <div class="disclaimer">
      <strong>Administrative Notice:</strong> ${MANDATORY_ADVICE_DISCLAIMER}
    </div>
  </div>
</body>
</html>
  `.trim();

  const resend = getResendClient();
  let status: "sent" | "logged" = "logged";
  let messageId: string = `msg_${Date.now()}`;

  if (resend) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      const result = await resend.emails.send({
        from: `${theme.firm_name} <${fromEmail}>`,
        to,
        subject,
        html,
        text: `${bodyText}\n\nLink: ${vars.upload_link || ""}\n\n${MANDATORY_ADVICE_DISCLAIMER}`
      });
      if (result.data?.id) {
        status = "sent";
        messageId = result.data.id;
      }
    } catch (err) {
      console.warn("Resend email send error, logged locally:", err);
      status = "logged";
    }
  } else {
    console.log(`[RESEND SIMULATION] Email sent to ${to} | Subject: "${subject}" | Status: LOGGED (Set RESEND_API_KEY to send real emails)`);
  }

  if (clientId) {
    await db.recordReminderSent({
      id: `rem_${Date.now()}`,
      client_id: clientId,
      reminder_number: reminderNumber || 1,
      missing_items: vars.missing_items ? vars.missing_items.split(", ") : [],
      recipient_email: to,
      subject,
      sent_at: new Date().toISOString(),
      channel: "email",
      status
    });
  }

  return { success: true, id: messageId, status };
}

export async function sendClientEmail(
  client: any,
  templateType: string,
  portalUrl: string,
  bookingUrl?: string
): Promise<{ success: boolean; id?: string; status: "sent" | "logged" }> {
  // Map friendly template names to standard database template types
  let mappedType: "checklist_initial" | "reminder_chase_1" | "reminder_chase_2" | "reminder_chase_3" | "staff_summary" = "checklist_initial";
  let reminderNumber = 1;

  if (templateType === "initial_request" || templateType === "checklist_initial") {
    mappedType = "checklist_initial";
    reminderNumber = 0;
  } else if (templateType === "escalation_1" || templateType === "reminder_chase_1") {
    mappedType = "reminder_chase_1";
    reminderNumber = 1;
  } else if (templateType === "escalation_2" || templateType === "reminder_chase_2") {
    mappedType = "reminder_chase_2";
    reminderNumber = 2;
  } else if (templateType === "escalation_3" || templateType === "reminder_chase_3") {
    mappedType = "reminder_chase_3";
    reminderNumber = 3;
  }

  const missingList = Array.isArray(client.missing_items) ? client.missing_items.join(", ") : "";

  return sendOnboardingEmail({
    to: client.contact?.email || client.email || "client@example.com",
    templateType: mappedType,
    vars: {
      client_name: client.company_name || client.contact?.name || "Client",
      service: client.service_requested || "Professional Services",
      missing_items: missingList || "None",
      upload_link: portalUrl,
      booking_link: bookingUrl || portalUrl
    },
    clientId: client.id,
    reminderNumber
  });
}

