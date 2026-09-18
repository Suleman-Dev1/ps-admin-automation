import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StaffUser } from "@/lib/types";

export async function GET() {
  try {
    const staff = await db.getStaffUsers();
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: StaffUser = await req.json();
    if (!body.id) {
      body.id = `staff_${Date.now()}`;
    }
    const saved = await db.createStaffUser(body);
    return NextResponse.json({ success: true, user: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
