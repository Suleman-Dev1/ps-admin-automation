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

    return NextResponse.json({
      success: true,
      client,
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

    // Support both FormData (file uploads) and JSON payloads
    const contentType = req.headers.get("content-type") || "";
    let fileName = "uploaded_document.pdf";
    let fileType = "application/pdf";
    let base64Content = "";
    let textContent = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }
      fileName = file.name;
      fileType = file.type || "application/octet-stream";
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Content = buffer.toString("base64");
    } else {
      const json = await req.json();
      fileName = json.file_name || json.fileName || "document.pdf";
      fileType = json.file_type || json.fileType || "application/pdf";
      base64Content = json.base64_data || json.base64 || "";
      textContent = json.text_content || json.textContent || "";
    }

    // Run OpenAI Document Extraction & Classification
    const extractionResult = await extractDocumentWithOpenAI(
      fileName,
      fileType,
      base64Content,
      textContent
    );

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: ExtractedDocument = {
      doc_id: docId,
      client_id: client.id,
      filename: fileName,
      file_name: fileName,
      file_type: fileType,
      classified_type: extractionResult.classified_type,
      confidence_score: extractionResult.confidence_score,
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
    const newStatus = isComplete ? "ready_for_review" : "in_progress";

    const updatedClient = await db.updateClient(client.id, {
      missing_items: updatedMissing,
      status: newStatus,
      documents: [...(client.documents || []), newDoc]
    });

    return NextResponse.json({
      success: true,
      document: newDoc,
      extraction: extractionResult,
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
