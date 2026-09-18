import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EmailTemplate, ReminderSchedule } from "@/lib/types";

export async function GET() {
  try {
    const [templates, schedule] = await Promise.all([
      db.getEmailTemplates(),
      db.getReminderSchedule()
    ]);
    return NextResponse.json({
      success: true,
      templates,
      schedule
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.template) {
      const template: EmailTemplate = body.template;
      const saved = await db.saveEmailTemplate(template);
      return NextResponse.json({ success: true, template: saved });
    }

    if (body.schedule) {
      const schedule: Partial<ReminderSchedule> = body.schedule;
      const updated = await db.updateReminderSchedule(schedule);
      return NextResponse.json({ success: true, schedule: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
