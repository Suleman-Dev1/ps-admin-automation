"use client";

import React, { useState } from "react";
import { PlayCircle, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface SimulationStep {
  step: number;
  title: string;
  detail: string;
  status: "pending" | "running" | "success" | "warning";
}

export default function AdminOverviewPage() {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [activeClient, setActiveClient] = useState<any>(null);

  const runSimulation = async () => {
    setRunning(true);
    setSteps([]);
    setActiveClient(null);

    try {
      const res = await fetch("/api/demo/simulate", { method: "POST" });
      const data = await res.json();

      if (data.steps) {
        setSteps(data.steps);
      }
      if (data.client) {
        setActiveClient(data.client);
      }
    } catch (err: any) {
      setSteps((prev) => [
        ...prev,
        {
          step: 99,
          title: "Simulation Error",
          detail: String(err.message || err),
          status: "warning",
        },
      ]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Hero Card */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full 7-Step Acceptance Verification</span>
            </div>
            <h2 className="text-xl font-bold text-brand-textPrimary">
              End-to-End Onboarding & Verification Simulator
            </h2>
            <p className="text-sm text-brand-textSecondary mt-1">
              Runs the full client lifecycle live: Intake &rarr; CRM &rarr; Tokenized Upload &rarr; Gap Detection &rarr; Real Reminders &rarr; Gated Cal.com &rarr; OpenAI Briefing.
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={running}
            className="px-5 py-2.5 rounded-brand font-bold text-white text-sm flex items-center gap-2 shadow transition disabled:opacity-50"
            style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            <span>{running ? "Simulating Pipeline..." : "Execute 1-Click Live Simulation"}</span>
          </button>
        </div>

        {/* Real-time simulation timeline */}
        {steps.length > 0 && (
          <div className="mt-6 pt-6 border-t border-brand-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
              Live Execution Trace
            </h3>
            <div className="space-y-2">
              {steps.map((s) => (
                <div
                  key={s.step}
                  className="p-3 rounded-brand border border-slate-200 bg-slate-50 flex items-start gap-3 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      Step {s.step}: {s.title}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {activeClient && (
              <div className="mt-4 p-4 rounded-brand bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-800 font-semibold uppercase">Simulation Result</div>
                  <div className="text-sm font-bold text-emerald-950">
                    Client {activeClient.id} ({activeClient.contact?.name}) is complete!
                  </div>
                </div>
                <Link
                  href={`/staff/clients/${activeClient.id}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded bg-emerald-700 text-white hover:bg-emerald-800 transition flex items-center gap-1"
                >
                  <span>View in Staff CRM</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Quick Jump Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/theme"
          className="bg-brand-surface border border-brand-border rounded-brand p-5 hover:shadow-md transition block group"
        >
          <h3 className="font-bold text-base text-brand-textPrimary group-hover:text-brand-primary transition">
            1. Theme & Branding
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Change primary/secondary brand colors, logo, and fonts. Updates live site dynamically without redeploying.
          </p>
        </Link>

        <Link
          href="/admin/verticals"
          className="bg-brand-surface border border-brand-border rounded-brand p-5 hover:shadow-md transition block group"
        >
          <h3 className="font-bold text-base text-brand-textPrimary group-hover:text-brand-primary transition">
            2. Verticals & Checklists
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Define legal structures (Ltd, Sole Trader, Law Firm), services, required documents, and dynamic form fields.
          </p>
        </Link>

        <Link
          href="/admin/emails"
          className="bg-brand-surface border border-brand-border rounded-brand p-5 hover:shadow-md transition block group"
        >
          <h3 className="font-bold text-base text-brand-textPrimary group-hover:text-brand-primary transition">
            3. Email & Reminders
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Edit checklist copy, 3-tier escalating follow-ups, placeholder tags, and chase intervals.
          </p>
        </Link>

        <Link
          href="/admin/ai"
          className="bg-brand-surface border border-brand-border rounded-brand p-5 hover:shadow-md transition block group"
        >
          <h3 className="font-bold text-base text-brand-textPrimary group-hover:text-brand-primary transition">
            4. OpenAI Prompts & Guardrails
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Configure OpenAI gpt-4o extraction and summary prompts. View server-enforced compliance boundary.
          </p>
        </Link>

        <Link
          href="/admin/staff"
          className="bg-brand-surface border border-brand-border rounded-brand p-5 hover:shadow-md transition block group"
        >
          <h3 className="font-bold text-base text-brand-textPrimary group-hover:text-brand-primary transition">
            5. Staff Team
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Manage firm staff who receive briefing emails and chase notifications.
          </p>
        </Link>

        <Link
          href="/intake"
          className="bg-brand-surface border border-brand-border rounded-brand p-5 hover:shadow-md transition block group"
        >
          <h3 className="font-bold text-base text-brand-textPrimary group-hover:text-brand-primary transition">
            6. Test Dynamic Intake
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1">
            Submit a real intake form rendered from current Admin configuration.
          </p>
        </Link>
      </div>
    </div>
  );
}
