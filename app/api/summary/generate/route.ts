import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateStaffSummaryWithOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id } = body;

    if (!client_id) {
      return NextResponse.json({ success: false, error: "client_id is required" }, { status: 400 });
    }

    const client = await db.getClientById(client_id);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const documents = await db.getDocumentsByClientId(client_id);

    // Call OpenAI GPT-4o for structured administrative summary
    const summary = await generateStaffSummaryWithOpenAI(client, documents);

    // Persist to database
    const saved = await db.saveStaffSummary(summary);

    return NextResponse.json({
      success: true,
      summary: saved
    });
  } catch (error: any) {
    console.error("Summary generation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
