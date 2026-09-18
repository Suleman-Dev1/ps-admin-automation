import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ChecklistConfig } from "@/lib/types";

export async function GET() {
  try {
    const configs = await db.getChecklistConfigs();
    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ChecklistConfig = await req.json();
    if (!body.id) {
      body.id = `cfg_${body.business_type_id}_${body.service_id}`;
    }
    const saved = await db.saveChecklistConfig(body);
    return NextResponse.json({ success: true, config: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
