import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StaffUser } from "@/lib/types";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();
    const role = (body.role || "accountant") as "admin" | "accountant" | "associate" | "auditor";

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name, email, and password." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const newUser: StaffUser = {
      id: `staff_${Date.now()}`,
      name,
      email,
      role,
      receive_summaries: true,
      receive_chase_alerts: role === "admin",
      created_at: new Date().toISOString(),
    };

    const saved = await db.createStaffUser(newUser);

    const sessionData = {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      login_time: new Date().toISOString(),
    };

    const cookieStore = cookies();
    cookieStore.set("auth_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: sessionData,
      message: "Account created successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
