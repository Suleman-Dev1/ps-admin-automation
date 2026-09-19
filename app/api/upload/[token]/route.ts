import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractDocumentWithOpenAI } from "@/lib/openai";
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
      documents
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

    // Support both FormData (file uploads & synthetic text) and JSON payloads
    const contentType = req.headers.get("content-type") || "";
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
      client_status: newStatus,
      client: updatedClient
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
