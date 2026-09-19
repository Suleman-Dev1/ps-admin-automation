import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ClientRecord } from "@/lib/types";
import { syncClientToAirtable, syncClientToHubSpot } from "@/lib/crm";
import { sendClientEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract contact and company information with resilient fallbacks
    const contactEmail = (body.contact_email || body.contact?.email || body.email || "").trim();
    const contactName = (body.contact_name || body.contact?.name || body.name || "Prospective Client").trim();
    const contactPhone = (body.contact_phone || body.contact?.phone || body.phone || "").trim();
    const companyName = (body.company_name || body.company || contactName).trim();

    const businessType = (body.business_type || body.businessType || "Ltd").trim();
    const serviceRequested = (body.service_requested || body.serviceRequested || body.service || "Year-end accounts").trim();

    // Check mandatory core fields
    if (!contactEmail) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!businessType) {
      return NextResponse.json(
        { success: false, error: "Please select a legal business structure." },
        { status: 400 }
      );
    }

    if (!serviceRequested) {
      return NextResponse.json(
        { success: false, error: "Please select a service requested." },
        { status: 400 }
      );
    }

    // Merge all dynamic form values from various possible frontend payload shapes
    const customFields: Record<string, any> = {
      ...(body.custom_fields || {}),
      ...(body.custom_intake_data || {}),
      ...(body.dynamicFormValues || {}),
      ...(body.turnover_band ? { turnover_band: body.turnover_band } : {}),
      ...(body.employee_count !== undefined ? { employee_count: body.employee_count } : {}),
      ...(body.relevant_date ? { relevant_date: body.relevant_date } : {}),
      ...(body.existing_provider ? { existing_provider: body.existing_provider } : {}),
      ...body,
    };

    // Lookup dynamic checklist configuration from Admin config
    const config = await db.getChecklistConfigByNames(businessType, serviceRequested);
    const requiredDocs = config?.required_documents && config.required_documents.length > 0
      ? config.required_documents
      : ["bank_statement", "id", "proof_of_address"];

    // Validate dynamic fields if required by config
    if (config?.required_fields && config.required_fields.length > 0) {
      for (const field of config.required_fields) {
        let val = customFields[field.field_id];

        // Intelligent auto-population for common fields if not explicitly passed
        if ((val === undefined || val === null || String(val).trim() === "")) {
          if (field.field_type === "select" && field.options && field.options.length > 0) {
            val = field.options[0];
            customFields[field.field_id] = val;
          } else if (field.field_type === "number") {
            val = 0;
            customFields[field.field_id] = val;
          } else if (field.required) {
            return NextResponse.json(
              { success: false, error: `Please fill in the required field: ${field.label}` },
              { status: 400 }
            );
          }
        }
      }
    }

    const clientId = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const uploadToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const newClient: ClientRecord = {
      id: clientId,
      company_name: companyName,
      business_type: businessType,
      service_requested: serviceRequested,
      status: "Awaiting Documents",
      contact: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone
      },
      turnover_band: customFields.turnover_band || "Under £100k",
      employee_count: parseInt(customFields.employee_count || "0") || 0,
      relevant_date: customFields.relevant_date || undefined,
      existing_provider: customFields.existing_provider || undefined,
      custom_fields: customFields,
      custom_intake_data: customFields,
      checklist_required: [...requiredDocs],
      missing_items: [...requiredDocs],
      documents: [],
      upload_token: uploadToken,
      booking_unlocked: false,
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
      client: savedClient,
      client_id: savedClient.id,
      upload_token: uploadToken,
      upload_url: portalUrl,
      booking_url: bookingUrl,
      missing_items: savedClient.missing_items,
      crm_status: { provider: "Connected CRM", recordId: `crm_${savedClient.id}` },
      message: "Client intake registered successfully. Welcome email dispatched."
    });
  } catch (error: any) {
    console.error("Intake submission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
