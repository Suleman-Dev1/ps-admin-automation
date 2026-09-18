import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BusinessType, Service } from "@/lib/types";

export async function GET() {
  try {
    const [businessTypes, services, checklistConfigs] = await Promise.all([
      db.getBusinessTypes(),
      db.getServices(),
      db.getChecklistConfigs()
    ]);
    return NextResponse.json({
      success: true,
      business_types: businessTypes,
      services: services,
      checklist_configs: checklistConfigs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === "save_business_type") {
      const btype: BusinessType = payload;
      if (!btype.id) {
        btype.id = `bt_${btype.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
      const saved = await db.saveBusinessType(btype);
      return NextResponse.json({ success: true, item: saved });
    }

    if (action === "save_service") {
      const srv: Service = payload;
      if (!srv.id) {
        srv.id = `srv_${srv.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      }
      const saved = await db.saveService(srv);
      return NextResponse.json({ success: true, item: saved });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
