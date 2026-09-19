import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    // 1. Fetch staff users
    const staffUsers = await db.getStaffUsers();

    // Check if matching user exists
    let matchedUser = staffUsers.find(
      (u) => u.email.toLowerCase() === email
    );

    // Support demo logins
    if (!matchedUser) {
      if (email.includes("admin") || email === "sarah.jenkins@apex-accountants.co.uk") {
        matchedUser = {
          id: "staff_admin",
          name: "Sarah Jenkins, FCA (Admin)",
          email: email,
          role: "admin",
          receive_summaries: true,
          receive_chase_alerts: true,
        };
        await db.createStaffUser(matchedUser);
      } else if (email.includes("staff") || email === "marcus.vance@apex-accountants.co.uk") {
        matchedUser = {
          id: "staff_accountant",
          name: "Marcus Vance (Staff)",
          email: email,
          role: "accountant",
          receive_summaries: true,
          receive_chase_alerts: false,
        };
        await db.createStaffUser(matchedUser);
      } else {
        // Automatically allow demo access for any valid format if password is >= 4 chars
        if (password.length >= 4) {
          matchedUser = {
            id: `staff_${Date.now()}`,
            name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
            email: email,
            role: email.includes("admin") ? "admin" : "accountant",
            receive_summaries: true,
            receive_chase_alerts: true,
          };
          await db.createStaffUser(matchedUser);
        } else {
          return NextResponse.json(
            { success: false, error: "Invalid credentials. Try quick login or use password with at least 4 characters." },
            { status: 401 }
          );
        }
      }
    }

    // Set auth cookie
    const sessionData = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      login_time: new Date().toISOString(),
    };

    const cookieStore = cookies();
    cookieStore.set("auth_session", JSON.stringify(sessionData), {
      httpOnly: false, // Accessible to client components
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: sessionData,
      message: `Welcome back, ${matchedUser.name}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
