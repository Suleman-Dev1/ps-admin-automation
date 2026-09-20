import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractDocumentWithOpenAI, generateStaffSummaryWithOpenAI } from "@/lib/openai";
import { sendClientEmail } from "@/lib/resend";
import { ExtractedDocument } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 400 });
    }

    const client = await db.getClientByUploadToken(token);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found for token" }, { status: 404 });
    }

    const documents = await db.getDocumentsByClientId(client.id);
    const reminders = await db.getRemindersSent(client.id);
    const staffSummary = await db.getStaffSummary(client.id);

    // Ensure checklist_required is populated
    const enrichedClient = {
      ...client,
      checklist_required: client.checklist_required && client.checklist_required.length > 0
        ? client.checklist_required
        : (client.missing_items || ["bank_statement", "id", "proof_of_address"])
    };

    return NextResponse.json({
      success: true,
      client: enrichedClient,
      documents,
      reminders,
      staff_summary: staffSummary
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    const client = await db.getClientByUploadToken(token);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found for token" }, { status: 404 });
    }

    const origin = req.nextUrl.origin || "http://localhost:3000";
    const portalUrl = `${origin}/upload/${client.upload_token}`;
    const bookingUrl = `${origin}/book/${client.upload_token}`;

    const contentType = req.headers.get("content-type") || "";

    // Check for JSON action commands (e.g. synthetic test flows or document removal)
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => ({}));

      // =======================================================================
      // ACTION: DELETE / CANCEL UPLOADED DOCUMENT
      // =======================================================================
      if (json.action === "delete_document" || json.action === "remove_document") {
        const docType = json.doc_type || json.docType;
        if (!docType) {
          return NextResponse.json({ success: false, error: "doc_type is required" }, { status: 400 });
        }

        await db.deleteDocument(client.id, docType);

        const currentMissing = client.missing_items || [];
        const updatedMissing = currentMissing.includes(docType)
          ? currentMissing
          : [...currentMissing, docType];

        await db.deleteStaffSummary(client.id);

        const updatedClient = await db.updateClient(client.id, {
          missing_items: updatedMissing,
          status: "Awaiting Documents",
          booking_unlocked: false
        });

        const allDocs = await db.getDocumentsByClientId(client.id);

        return NextResponse.json({
          success: true,
          action: "delete_document",
          message: `Document '${docType.replace(/_/g, " ")}' removed. Status changed back to missing.`,
          removed_doc_type: docType,
          missing_items: updatedMissing,
          all_complete: false,
          booking_unlocked: false,
          client: updatedClient,
          documents: allDocs
        });
      }

      // =======================================================================
      // ACTION: SYNTHETIC PARTIAL UPLOAD (Leave 1 Deliberately Missing)
      // =======================================================================
      if (json.action === "synthetic_partial") {
        const required = client.checklist_required && client.checklist_required.length > 0
          ? client.checklist_required
          : ["bank_statement", "prior_year_accounts", "id", "proof_of_address"];

        // Deliberately leave the LAST item missing
        const missingTarget = required[required.length - 1];
        const toUpload = required.slice(0, required.length - 1);

        const syntheticSamples: Record<string, { filename: string; text: string }> = {
          bank_statement: {
            filename: "Barclays_Bank_Statement.txt",
            text: "Barclays Bank UK PLC Statement. Account: 20491823. Period: 2024-01-01 to 2024-12-31. Closing Balance: £42,580.20. Turnover: £620,000.00."
          },
          prior_year_accounts: {
            filename: "Statutory_Accounts_2024.txt",
            text: "Apex Trading Ltd Statutory Accounts 2024-12-31. Turnover: £580,000. Net Profit: £74,200. Balance Sheet Total Net Assets: £116,780.20."
          },
          payroll_summary: {
            filename: "P32_PAYE_Summary.txt",
            text: "P32 Monthly PAYE Summary Month 12. PAYE Reference: 120/AT89123. 5 Employees. Gross Pay: £18,400. Total PAYE & NIC due: £4,250."
          },
          id: {
            filename: "Director_Passport.txt",
            text: "United Kingdom Passport. Surname: Smith. Given Names: John David. Number: 554981203. Expiry: 2031-05-14."
          },
          vat_certificate: {
            filename: "HMRC_VAT_Registration.txt",
            text: "HM Revenue & Customs Certificate of VAT Registration. VAT Reg GB 987 6543 21. Effective Date: 2019-04-01. Return Cycle: Quarterly."
          },
          proof_of_address: {
            filename: "British_Gas_Utility_Bill.txt",
            text: "British Gas Business Commercial Utility Bill. Service Address: Suite 4, High Street Business Park, London EC2A 4NE. Bill Date: 2026-08-10. Account: 8820 1934 001."
          }
        };

        const uploadedDocs: ExtractedDocument[] = [];
        for (const itemType of toUpload) {
          const sample = syntheticSamples[itemType] || {
            filename: `${itemType}.txt`,
            text: `Official verified ${itemType.replace(/_/g, " ")} document for ${client.company_name || client.contact?.name}.`
          };

          const extraction = await extractDocumentWithOpenAI(
            sample.filename,
            "text/plain",
            undefined,
            sample.text,
            required
          );

          const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const doc: ExtractedDocument = {
            doc_id: docId,
            client_id: client.id,
            filename: sample.filename,
            file_name: sample.filename,
            file_type: "text/plain",
            doc_type: itemType,
            classified_type: itemType,
            confidence: extraction.confidence_score,
            confidence_score: extraction.confidence_score,
            key_fields: extraction.extracted_fields,
            extracted_fields: extraction.extracted_fields,
            verification_status: "verified",
            verification_notes: `Classified as ${itemType} with high confidence.`,
            flagged_for_review: false,
            uploaded_at: new Date().toISOString()
          };

          await db.saveDocument(doc);
          uploadedDocs.push(doc);
        }

        const updatedMissing = [missingTarget];
        const updatedClient = await db.updateClient(client.id, {
          missing_items: updatedMissing,
          status: "Awaiting Documents",
          booking_unlocked: false,
          documents: [...(client.documents || []), ...uploadedDocs]
        });

        // Dispatch a real reminder for the deliberately missing item
        const reminderResult = await sendClientEmail(
          updatedClient,
          "escalation_1",
          portalUrl,
          bookingUrl
        );

        return NextResponse.json({
          success: true,
          action: "synthetic_partial",
          message: `Uploaded ${uploadedDocs.length} synthetic documents. Identified 1 deliberately missing item: ${missingTarget.replace(/_/g, " ")}. Generated real reminder.`,
          uploaded_documents: uploadedDocs,
          missing_items: updatedMissing,
          deliberately_missing: missingTarget,
          reminder: reminderResult,
          all_complete: false,
          booking_unlocked: false,
          client: updatedClient
        });
      }

      // =======================================================================
      // ACTION: COMPLETE MISSING ITEM (Upload remaining item)
      // =======================================================================
      if (json.action === "synthetic_complete") {
        const missing = client.missing_items || [];
        const targetItem = missing[0] || "proof_of_address";

        const sample = {
          filename: `${targetItem}_verified.txt`,
          text: `Official verified ${targetItem.replace(/_/g, " ")} document for ${client.company_name || client.contact?.name}. Address: Suite 4, High Street Business Park, London EC2A 4NE.`
        };

        const extraction = await extractDocumentWithOpenAI(
          sample.filename,
          "text/plain",
          undefined,
          sample.text,
          client.checklist_required || []
        );

        const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const doc: ExtractedDocument = {
          doc_id: docId,
          client_id: client.id,
          filename: sample.filename,
          file_name: sample.filename,
          file_type: "text/plain",
          doc_type: targetItem,
          classified_type: targetItem,
          confidence: extraction.confidence_score,
          confidence_score: extraction.confidence_score,
          key_fields: extraction.extracted_fields,
          extracted_fields: extraction.extracted_fields,
          verification_status: "verified",
          verification_notes: `Classified as ${targetItem}.`,
          flagged_for_review: false,
          uploaded_at: new Date().toISOString()
        };

        await db.saveDocument(doc);

        const remainingMissing = missing.filter(m => m !== targetItem);
        const isComplete = remainingMissing.length === 0;

        const updatedClient = await db.updateClient(client.id, {
          missing_items: remainingMissing,
          status: isComplete ? "Ready" : "Awaiting Documents",
          booking_unlocked: isComplete,
          documents: [...(client.documents || []), doc]
        });

        let staffSummary = null;
        if (isComplete) {
          const allDocs = await db.getDocumentsByClientId(client.id);
          try {
            staffSummary = await generateStaffSummaryWithOpenAI(updatedClient, allDocs);
            await db.saveStaffSummary(staffSummary);
          } catch (e) {
            console.error("Staff summary auto-generation error:", e);
          }
        }

        return NextResponse.json({
          success: true,
          action: "synthetic_complete",
          message: isComplete
            ? "All documents uploaded and verified! Meeting booking unlocked and staff summary prepared."
            : `Uploaded ${targetItem}. Remaining missing: ${remainingMissing.length}.`,
          document: doc,
          missing_items: remainingMissing,
          all_complete: isComplete,
          booking_unlocked: isComplete,
          staff_summary: staffSummary,
          client: updatedClient
        });
      }
    }

    // =========================================================================
    // STANDARD SINGLE FILE / OCR UPLOAD
    // =========================================================================
    let fileName = "uploaded_document.pdf";
    let fileType = "application/pdf";
    let base64Content = "";
    let textContent = "";
    let docTypeHint = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const text = (formData.get("text_content") || formData.get("text") || formData.get("content")) as string | null;
      const name = (formData.get("filename") || formData.get("file_name")) as string | null;
      docTypeHint = ((formData.get("doc_type_hint") || formData.get("doc_type")) as string | null || "").trim();

      if (file && typeof file !== "string") {
        const fileObj = file as File;
        fileName = fileObj.name || name || "uploaded_document.pdf";
        fileType = fileObj.type || "application/octet-stream";
        const buffer = Buffer.from(await fileObj.arrayBuffer());
        base64Content = buffer.toString("base64");
      } else if (text && text.trim()) {
        fileName = name || (docTypeHint ? `${docTypeHint}.txt` : "document.txt");
        fileType = "text/plain";
        textContent = text.trim();
      } else {
        return NextResponse.json(
          { success: false, error: "Please select a file to upload or enter document text." },
          { status: 400 }
        );
      }
    } else {
      const json = await req.json().catch(() => ({}));
      fileName = json.file_name || json.fileName || json.filename || "document.pdf";
      fileType = json.file_type || json.fileType || "application/pdf";
      base64Content = json.base64_data || json.base64 || "";
      textContent = (json.text_content || json.textContent || json.content || "").trim();
      docTypeHint = (json.doc_type_hint || json.doc_type || "").trim();

      if (!base64Content && !textContent) {
        return NextResponse.json(
          { success: false, error: "Please provide document content or text." },
          { status: 400 }
        );
      }
    }

    // Run OpenAI Document Extraction & Classification
    const extractionResult = await extractDocumentWithOpenAI(
      fileName,
      fileType,
      base64Content,
      textContent,
      client.missing_items || client.checklist_required || []
    );

    // If docTypeHint is explicitly specified and classified_type is generic, honor the hint
    if (docTypeHint && (extractionResult.classified_type === "supporting_document" || !client.missing_items?.includes(extractionResult.classified_type))) {
      extractionResult.classified_type = docTypeHint;
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: ExtractedDocument = {
      doc_id: docId,
      client_id: client.id,
      filename: fileName,
      file_name: fileName,
      file_type: fileType,
      doc_type: extractionResult.classified_type,
      classified_type: extractionResult.classified_type,
      confidence: extractionResult.confidence_score,
      confidence_score: extractionResult.confidence_score,
      key_fields: extractionResult.extracted_fields,
      extracted_fields: extractionResult.extracted_fields,
      verification_status: extractionResult.flagged_for_review ? "flagged" : "verified",
      verification_notes: extractionResult.verification_notes,
      flagged_for_review: extractionResult.flagged_for_review,
      uploaded_at: new Date().toISOString()
    };

    // Save document to DB
    await db.saveDocument(newDoc);

    // Update Client's missing items list
    const currentMissing = client.missing_items || [];
    const classifiedType = extractionResult.classified_type;
    const updatedMissing = currentMissing.filter(
      item => item.toLowerCase() !== classifiedType.toLowerCase()
    );

    const isComplete = updatedMissing.length === 0;
    const newStatus = isComplete ? "Ready" : "Awaiting Documents";

    const updatedClient = await db.updateClient(client.id, {
      missing_items: updatedMissing,
      status: newStatus,
      booking_unlocked: isComplete,
      documents: [...(client.documents || []), newDoc]
    });

    let staffSummary = null;
    let reminderDispatched = null;

    if (isComplete) {
      // When checklist is complete, prepare staff summary with OpenAI GPT-4o
      const allDocs = await db.getDocumentsByClientId(client.id);
      try {
        staffSummary = await generateStaffSummaryWithOpenAI(updatedClient, allDocs);
        await db.saveStaffSummary(staffSummary);
      } catch (err) {
        console.error("Auto staff summary generation error:", err);
      }
    } else {
      // If at least one item is missing, generate a real reminder
      try {
        reminderDispatched = await sendClientEmail(
          updatedClient,
          "escalation_1",
          portalUrl,
          bookingUrl
        );
      } catch (err) {
        console.error("Auto reminder dispatch error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      document: newDoc,
      extraction: extractionResult,
      extracted: {
        doc_type: extractionResult.classified_type,
        period_covered: "Current Period",
        key_fields: extractionResult.extracted_fields,
        confidence: extractionResult.confidence_score,
        needs_human_review: extractionResult.flagged_for_review,
        source: "OpenAI GPT-4o"
      },
      missing_items: updatedMissing,
      all_complete: isComplete,
      booking_unlocked: isComplete,
      client_status: newStatus,
      staff_summary: staffSummary,
      reminder_dispatched: reminderDispatched,
      client: updatedClient
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
