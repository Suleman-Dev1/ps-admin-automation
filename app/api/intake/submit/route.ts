import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ClientRecord } from "@/lib/types";
import { syncClientToAirtable, syncClientToHubSpot } from "@/lib/crm";
import { sendClientEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_name,
      business_type,
      service_requested,
      contact_name,
      contact_email,
      contact_phone,
      custom_fields = {}
    } = body;

    if (!contact_email || !service_requested || !business_type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: email, business type, and service are mandatory." },
        { status: 400 }
      );
    }

    // Lookup dynamic checklist configuration from Admin config
    const config = await db.getChecklistConfigByNames(business_type, service_requested);
    const requiredDocs = config?.required_documents || ["bank_statement", "id", "proof_of_address"];

    // Validate dynamic fields if required
    if (config?.required_fields) {
      for (const field of config.required_fields) {
        if (field.required && !custom_fields[field.field_id]) {
          return NextResponse.json(
            { success: false, error: `Missing required field: ${field.label}` },
            { status: 400 }
          );
        }
      }
    }

    const clientId = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const uploadToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const newClient: ClientRecord = {
      id: clientId,
      company_name: company_name || contact_name,
      business_type: business_type,
      service_requested: service_requested,
      status: "pending_documents",
      contact: {
        name: contact_name || "Prospective Client",
        email: contact_email,
        phone: contact_phone || ""
      },
      custom_fields: custom_fields,
      missing_items: [...requiredDocs],
      documents: [],
      upload_token: uploadToken,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        origin: "web_intake",
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1"
      }
    };

    // 1. Save to Database (Supabase or Local resilient fallback)
    const savedClient = await db.createClient(newClient);

    // Determine base URL for portal links
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const portalUrl = `${origin}/upload/${uploadToken}`;
    const bookingUrl = `${origin}/book/${uploadToken}`;

    // 2. Multi-CRM Sync in background
    Promise.allSettled([
      syncClientToAirtable(savedClient),
      syncClientToHubSpot(savedClient)
    ]).catch(err => console.error("CRM Sync non-blocking error:", err));

    // 3. Dispatch Dynamic Welcome Email via Resend with dynamic placeholders
    try {
      await sendClientEmail(
        savedClient,
        "initial_request",
        portalUrl,
        bookingUrl
      );
    } catch (mailErr) {
      console.warn("Welcome email non-blocking warning:", mailErr);
    }

    return NextResponse.json({
      success: true,
      client_id: savedClient.id,
      upload_token: uploadToken,
      upload_url: portalUrl,
      booking_url: bookingUrl,
      missing_items: savedClient.missing_items,
      message: "Client intake registered successfully. Welcome email dispatched."
    });
  } catch (error: any) {
    console.error("Intake submission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
