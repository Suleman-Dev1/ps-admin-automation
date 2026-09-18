import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ThemeSettings } from "@/lib/types";

export async function GET() {
  try {
    const theme = await db.getThemeSettings();
    return NextResponse.json({ success: true, theme });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<ThemeSettings> = await req.json();
    const updatedTheme = await db.updateThemeSettings(body);
    return NextResponse.json({ success: true, theme: updatedTheme });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
