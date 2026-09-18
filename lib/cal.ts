import { ClientRecord } from "./types";

export interface BookingEligibilityResult {
  is_eligible: boolean;
  reason: string;
  booking_url: string | null;
  missing_items: string[];
}

export function evaluateBookingEligibility(client: ClientRecord): BookingEligibilityResult {
  const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME || "apex-advisory";
  const calEventSlug = process.env.NEXT_PUBLIC_CAL_EVENT_SLUG || "30min-onboarding";

  if (client.missing_items && client.missing_items.length > 0) {
    return {
      is_eligible: false,
      reason: `Meeting booking is strictly locked. The following mandatory onboarding documents are missing: ${client.missing_items.join(", ")}.`,
      booking_url: null,
      missing_items: client.missing_items
    };
  }

  // All documents fulfilled — unlock Cal.com meeting booking
  const calUrl = `https://cal.com/${calUsername}/${calEventSlug}?name=${encodeURIComponent(client.contact?.name || "")}&email=${encodeURIComponent(client.contact?.email || "")}&notes=${encodeURIComponent(`Client ID: ${client.id} - ${client.service_requested}`)}`;

  return {
    is_eligible: true,
    reason: "Checklist is complete. Meeting booking is unlocked.",
    booking_url: calUrl,
    missing_items: []
  };
}
