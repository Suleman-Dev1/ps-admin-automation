import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ClientRecord, ExtractedDocument } from "@/lib/types";
import { extractDocumentWithOpenAI, generateStaffSummaryWithOpenAI } from "@/lib/openai";
import { sendClientEmail } from "@/lib/resend";
import { syncClientToAirtable, syncClientToHubSpot } from "@/lib/crm";
import { evaluateBookingEligibility } from "@/lib/cal";

export async function POST(req: NextRequest) {
  const logs: { step: number; title: string; detail: string; status: "success" | "warning" | "info" }[] = [];

  try {
    const body = await req.json().catch(() => ({}));
    const businessType = body.business_type || "Ltd";
    const service = body.service || "Year-end accounts";
    const companyName = body.company_name || "Nexus Engineering Ltd";
    const contactName = body.contact_name || "Eleanor Vance";
    const contactEmail = body.contact_email || "eleanor.vance@example.com";

    // STEP 1: Intake Registration & Checklist Initialization
    const config = await db.getChecklistConfigByNames(businessType, service);
    const requiredDocs = config?.required_documents || ["bank_statement", "prior_year_accounts", "payroll_summary", "id", "proof_of_address", "vat_certificate"];

    const clientId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const uploadToken = `tok_sim_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const client: ClientRecord = {
      id: clientId,
      company_name: companyName,
      business_type: businessType,
      service_requested: service,
      status: "pending_documents",
      contact: {
        name: contactName,
        email: contactEmail,
        phone: "+44 20 7946 0991"
      },
      custom_fields: {
        turnover_band: "£500k - £1.5M",
        payroll_employees: "12",
        accounting_software: "Xero",
        vat_registered: "Yes",
        companies_house_number: "08472910"
      },
      missing_items: [...requiredDocs],
      documents: [],
      upload_token: uploadToken,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { origin: "1_click_simulator" }
    };

    const savedClient = await db.createClient(client);
    logs.push({
      step: 1,
      title: "Client Intake & Dynamic Checklist Initialized",
      detail: `Created client ${companyName} (${businessType} - ${service}). Initial missing items required: ${requiredDocs.length} documents.`,
      status: "success"
    });

    // STEP 2: Welcome Email & Multi-CRM Sync
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const portalUrl = `${origin}/upload/${uploadToken}`;
    const bookingUrl = `${origin}/book/${uploadToken}`;

    await Promise.allSettled([
      syncClientToAirtable(savedClient),
      syncClientToHubSpot(savedClient)
    ]);

    const welcomeEmail = await sendClientEmail(savedClient, "initial_request", portalUrl, bookingUrl);
    logs.push({
      step: 2,
      title: "Welcome Email & CRM Sync Dispatched",
      detail: `Sent welcome email via Resend to ${contactEmail} with dynamic upload token. Synced to Airtable and HubSpot records.`,
      status: "success"
    });

    // STEP 3: Initial Documents Upload & OpenAI Multimodal Extraction
    const doc1Text = `BARCLAYS BANK PLC - STATEMENT SUMMARY\nAccount Name: Nexus Engineering Ltd\nSort Code: 20-04-15 Account No: 83920194\nStatement Period: 01/01/2024 to 31/12/2024\nOpening Balance: £84,210.00\nTotal Inflow: £745,120.00\nClosing Balance: £142,390.00`;
    const doc1Extract = await extractDocumentWithOpenAI("Barclays_Bank_Statement_2024.pdf", "application/pdf", "", doc1Text);

    const doc1Record: ExtractedDocument = {
      doc_id: `doc_sim_1`,
      client_id: clientId,
      filename: "Barclays_Bank_Statement_2024.pdf",
      file_name: "Barclays_Bank_Statement_2024.pdf",
      file_type: "application/pdf",
      classified_type: doc1Extract.classified_type,
      confidence_score: doc1Extract.confidence_score,
      extracted_fields: doc1Extract.extracted_fields,
      verification_status: "verified",
      verification_notes: doc1Extract.verification_notes,
      flagged_for_review: false,
      uploaded_at: new Date().toISOString()
    };
    await db.saveDocument(doc1Record);

    const doc2Text = `Nexus Engineering Ltd - Unaudited Financial Statements for Year Ended 31 December 2023\nCompany No. 08472910\nTurnover: £680,400\nOperating Profit: £94,200\nTangible Assets: £42,100\nDirectors: Eleanor Vance`;
    const doc2Extract = await extractDocumentWithOpenAI("Prior_Year_Financial_Accounts_2023.pdf", "application/pdf", "", doc2Text);

    const doc2Record: ExtractedDocument = {
      doc_id: `doc_sim_2`,
      client_id: clientId,
      filename: "Prior_Year_Financial_Accounts_2023.pdf",
      file_name: "Prior_Year_Financial_Accounts_2023.pdf",
      file_type: "application/pdf",
      classified_type: doc2Extract.classified_type,
      confidence_score: doc2Extract.confidence_score,
      extracted_fields: doc2Extract.extracted_fields,
      verification_status: "verified",
      verification_notes: doc2Extract.verification_notes,
      flagged_for_review: false,
      uploaded_at: new Date().toISOString()
    };
    await db.saveDocument(doc2Record);

    logs.push({
      step: 3,
      title: "OpenAI Multimodal Document Extraction",
      detail: `Processed 2 documents via OpenAI: Bank Statement (confidence: ${(doc1Extract.confidence_score * 100).toFixed(0)}%) and Prior Accounts (confidence: ${(doc2Extract.confidence_score * 100).toFixed(0)}%). Key data extracted automatically.`,
      status: "success"
    });

    // STEP 4: Dynamic Gap Calculation & Booking Lock Verification
    const remainingMissing = requiredDocs.filter(
      item => item !== "bank_statement" && item !== "prior_year_accounts"
    );
    await db.updateClient(clientId, {
      missing_items: remainingMissing,
      status: "in_progress",
      documents: [doc1Record, doc2Record]
    });

    const preGateCheck = evaluateBookingEligibility({
      ...savedClient,
      missing_items: remainingMissing
    });

    logs.push({
      step: 4,
      title: "Dynamic Gap Analysis & Scheduling Lock",
      detail: `Remaining missing documents (${remainingMissing.length}): ${remainingMissing.join(", ")}. Meeting booking evaluated: LOCKED (${preGateCheck.reason}).`,
      status: "warning"
    });

    // STEP 5: Follow-Up Escalation Reminder Dispatched
    const reminderRecord = await sendClientEmail(
      { ...savedClient, missing_items: remainingMissing },
      "escalation_1",
      portalUrl,
      bookingUrl
    );
    logs.push({
      step: 5,
      title: "Escalation Reminder Sent via Resend",
      detail: `Sent 1st Follow-up Reminder to ${contactEmail} listing remaining items: ${remainingMissing.join(", ")}.`,
      status: "info"
    });

    // STEP 6: Fulfillment of Remaining Documents
    const remainingUploadedDocs: ExtractedDocument[] = [];
    for (let i = 0; i < remainingMissing.length; i++) {
      const itemType = remainingMissing[i];
      const fulfilledDoc: ExtractedDocument = {
        doc_id: `doc_sim_f_${i}`,
        client_id: clientId,
        filename: `${itemType}_nexus_verified.pdf`,
        file_name: `${itemType}_nexus_verified.pdf`,
        file_type: "application/pdf",
        classified_type: itemType,
        confidence_score: 0.96,
        extracted_fields: { doc_type: itemType, status: "complete", verified_at: new Date().toISOString() },
        verification_status: "verified",
        verification_notes: `Standard administrative fulfillment for ${itemType}`,
        flagged_for_review: false,
        uploaded_at: new Date().toISOString()
      };
      await db.saveDocument(fulfilledDoc);
      remainingUploadedDocs.push(fulfilledDoc);
    }

    const completedClient = await db.updateClient(clientId, {
      missing_items: [],
      status: "ready_for_review",
      documents: [doc1Record, doc2Record, ...remainingUploadedDocs]
    });

    logs.push({
      step: 6,
      title: "All Mandatory Documents Fulfilled",
      detail: `Remaining ${remainingMissing.length} items uploaded and verified. Missing items count: 0. Client status transitioned to 'ready_for_review'.`,
      status: "success"
    });

    // STEP 7: Cal.com Booking Unlock & OpenAI Pre-Meeting Briefing
    const postGateCheck = evaluateBookingEligibility(completedClient!);
    const staffSummary = await generateStaffSummaryWithOpenAI(
      completedClient!,
      [doc1Record, doc2Record, ...remainingUploadedDocs]
    );
    await db.saveStaffSummary(staffSummary);

    logs.push({
      step: 7,
      title: "Cal.com Meeting Unlocked & OpenAI Summary Ready",
      detail: `Booking status: UNLOCKED (${postGateCheck.booking_url}). OpenAI generated 4-point administrative brief with strict non-removable compliance disclaimer.`,
      status: "success"
    });

    return NextResponse.json({
      success: true,
      client_id: clientId,
      upload_token: uploadToken,
      portal_url: portalUrl,
      booking_url: bookingUrl,
      logs: logs,
      summary: staffSummary
    });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
  }
}
