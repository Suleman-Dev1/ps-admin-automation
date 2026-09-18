import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AIPromptSettings } from "@/lib/types";

export async function GET() {
  try {
    const settings = await db.getAIPromptSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<AIPromptSettings> = await req.json();
    const updated = await db.updateAIPromptSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
