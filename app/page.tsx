import Link from "next/link";
import { Settings, FileText, Users, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Building2, Clock, Lock } from "lucide-react";
import { db } from "@/lib/db";

export default async function HomePage() {
  const theme = await db.getThemeSettings();
  const businessTypes = await db.getBusinessTypes();
  const services = await db.getServices();
  const clients = await db.getClients();

  return (
    <div className="space-y-10">
      {/* Framed Hero & Live Metrics Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Enterprise Demo &bull; Next.js 14 App Router</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Professional Services <span style={{ color: theme.primary_color }}>Admin Automation</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Dynamic client onboarding, tokenized document collection, OpenAI GPT-4o multimodal extraction, automated gap detection, and strictly gated Cal.com scheduling.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <Link
              href="/intake"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: theme.primary_color }}
            >
              <FileText className="w-4 h-4" /> Start Client Intake
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition border border-slate-200"
            >
              <Settings className="w-4 h-4" /> Admin Console
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Business Verticals</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{businessTypes.length || 3} Configured</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Accountancy, Legal, Consulting</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Active Services</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{services.length || 6} Defined</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Dynamic form schemas</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">Pipeline Clients</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{clients.length || 0} Registered</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live CRM & DB state</div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center sm:text-left">
            <div className="text-xs text-slate-500 font-medium">AI Multimodal OCR</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">OpenAI GPT-4o</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Confidence scoring active</div>
          </div>
        </div>
      </div>

      {/* 3 Framed Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: theme.primary_color }}
              >
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border">
                Full Control
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Admin Control Panel</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure live brand theme (colors, logo, typography), business verticals, checklists, form fields, email copy, and OpenAI prompts without code changes.
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live 7-step simulator</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dynamic CSS theme generator</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vertical & checklist builder</span>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Intake Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: theme.secondary_color || "#0284c7" }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Client-Facing
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Intake Portal</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Dynamic onboarding form rendered strictly from Admin DB schema. On submission, automatically creates client in Postgres & syncs with CRM.
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-data-entry experience</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Real-time field validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant upload token generation</span>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>Launch Intake Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Staff Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: theme.accent_color || "#f59e0b" }}
              >
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Staff CRM
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Staff Dashboard & CRM</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review active client onboarding pipelines, inspect OpenAI document extraction results, monitor gap alerts, and read pre-meeting briefings.
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Client pipeline tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Document confidence inspect</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI pre-meeting briefs</span>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <Link
              href="/staff"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <span>Open Staff Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Framed 2-Column Architecture & Governance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 Cols): 4-Stage Operational Pipeline */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Operational Pipeline Lifecycle</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border">
              4 Core Stages
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Dynamic Intake & CRM Sync</h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Questions are pulled from DB at runtime. Submission creates Postgres record, syncs with Airtable & HubSpot, and triggers welcome email.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Tokenized Document Upload & OCR</h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Client receives private tokenized URL (no passwords). OpenAI GPT-4o analyzes uploads, classifies type, and flags items with confidence &lt; 85%.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Gap Detection & Escalating Chasers</h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  System continuously monitors missing checklist items. Automated follow-ups are dispatched on Day 2, Day 5, and Day 9 via Resend.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Gated Booking & AI Staff Briefing</h4>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Cal.com meeting booking remains strictly locked until 100% of required documents are verified. A 4-point briefing is prepared for staff.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 Cols): Invariants & Compliance Governance */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>System Invariants & Governance</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Enforced
            </span>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
              <div className="font-bold text-blue-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Dynamic Config — Zero Hardcoded Rules</span>
              </div>
              <p className="text-blue-900 text-[11px] leading-relaxed">
                Brand colors, logos, fonts, business types, document checklists, and email templates are fetched from the database at runtime.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Strict Gated Cal.com Scheduling</span>
              </div>
              <p className="text-amber-900 text-[11px] leading-relaxed">
                Staff time is safeguarded. Meeting links cannot be booked until all statutory documents are submitted and verified.
              </p>
            </div>

            <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
              <div className="font-bold text-purple-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>Statutory Disclaimer Invariant</span>
              </div>
              <p className="text-purple-900 text-[11px] leading-relaxed">
                Every AI summary and staff briefing automatically enforces the statutory disclaimer: administration only, no tax or legal advice.
              </p>
            </div>

            {/* Quick Link to Workflow Guide on Desktop */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                Interactive workflow documentation is saved on your Desktop at <br />
                <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">
                  /Users/macrorld/Desktop/ADMIN_AUTOMATION_WORKFLOW.html
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
