import Link from "next/link";
import { Settings, FileText, Users, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Building2, Clock, Lock } from "lucide-react";
import { db } from "@/lib/db";

export default async function HomePage() {
  const theme = await db.getThemeSettings();
  const businessTypes = await db.getBusinessTypes();
  const services = await db.getServices();
  const clients = await db.getClients();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next.js 14 App Router • OpenAI gpt-4o • Supabase • Resend • Cal.com</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-textPrimary">
          Professional Services <span style={{ color: theme.primary_color }}>Admin Automation</span>
        </h1>
        <p className="text-lg text-brand-textSecondary leading-relaxed">
          Dynamic client onboarding, tokenized document collection, automated gap detection, escalating follow-ups, gated booking, and AI pre-meeting staff briefings.
        </p>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Card */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: theme.primary_color }}
            >
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Admin Control Panel</h3>
            <p className="text-sm text-brand-textSecondary">
              Configure live brand theme (colors, logo, fonts), business verticals, checklists, form fields, email copy, and OpenAI settings without code changes.
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Intake Card */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: theme.secondary_color || "#0284c7" }}
            >
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Client Intake Portal</h3>
            <p className="text-sm text-brand-textSecondary">
              Dynamic onboarding form rendered strictly from Admin schema. On submission, automatically creates client in Postgres & syncs with CRM.
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80"
            >
              <span>Launch Intake Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Staff Card */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: theme.accent_color || "#f59e0b" }}
            >
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Staff Dashboard & CRM</h3>
            <p className="text-sm text-brand-textSecondary">
              Review active client onboarding pipelines, inspect OpenAI document extraction results, monitor gap alerts, and read pre-meeting briefings.
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/staff"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:opacity-80"
            >
              <span>Open Staff Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic Architecture Highlights */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
        <h2 className="text-xl font-bold text-brand-textPrimary mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Core End-to-End Workflow & Governance Invariants</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand space-y-2">
            <div className="font-semibold text-brand-textPrimary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Dynamic Config</span>
            </div>
            <p className="text-slate-600 text-xs">
              Every field, document checklist, email template, and CSS color is loaded from DB at runtime. Changing theme in Admin updates live site immediately.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand space-y-2">
            <div className="font-semibold text-brand-textPrimary flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>2. Tokenized Upload</span>
            </div>
            <p className="text-slate-600 text-xs">
              Cryptographically signed upload portal (no login). Client uploads are analyzed by OpenAI gpt-4o with confidence scoring and human review flagging.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand space-y-2">
            <div className="font-semibold text-brand-textPrimary flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>3. Gap & Reminders</span>
            </div>
            <p className="text-slate-600 text-xs">
              Continuous gap detection compares received docs against checklist. Escalating follow-ups are dispatched via Resend on a defined schedule.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand space-y-2">
            <div className="font-semibold text-brand-textPrimary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>4. Gated Cal.com & Briefing</span>
            </div>
            <p className="text-slate-600 text-xs">
              Meeting scheduling is locked until missing items reach zero. Once complete, OpenAI generates a factual staff briefing with mandatory advice disclaimer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
