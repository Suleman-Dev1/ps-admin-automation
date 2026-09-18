import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const service = searchParams.get("service");

    let clients = await db.getClients();

    if (status && status !== "all") {
      clients = clients.filter(c => c.status === status);
    }
    if (service && service !== "all") {
      clients = clients.filter(c => c.service_requested === service);
    }

    return NextResponse.json({ success: true, clients });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
