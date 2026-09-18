import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendClientEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_id, template_type = "escalation_1" } = body;

    if (!client_id) {
      return NextResponse.json({ success: false, error: "client_id is required" }, { status: 400 });
    }

    const client = await db.getClientById(client_id);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const origin = req.nextUrl.origin || "http://localhost:3000";
    const portalUrl = `${origin}/upload/${client.upload_token}`;
    const bookingUrl = `${origin}/book/${client.upload_token}`;

    const sentRecord = await sendClientEmail(
      client,
      template_type,
      portalUrl,
      bookingUrl
    );

    return NextResponse.json({
      success: true,
      message: `Reminder (${template_type}) dispatched successfully to ${client.contact?.email}`,
      reminder: sentRecord
    });
  } catch (error: any) {
    console.error("Reminder dispatch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
