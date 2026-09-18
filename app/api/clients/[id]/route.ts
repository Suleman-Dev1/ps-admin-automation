import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ClientRecord } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const client = await db.getClientById(id);
    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const [documents, reminders, summary] = await Promise.all([
      db.getDocumentsByClientId(id),
      db.getRemindersSent(id),
      db.getStaffSummary(id)
    ]);

    return NextResponse.json({
      success: true,
      client,
      documents,
      reminders,
      summary
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: Partial<ClientRecord> = await req.json();

    const updated = await db.updateClient(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, client: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
