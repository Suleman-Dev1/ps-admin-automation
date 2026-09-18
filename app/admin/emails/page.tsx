"use client";

import React, { useState, useEffect } from "react";
import { EmailTemplate, ReminderSchedule } from "@/lib/types";
import { Mail, Clock, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [schedule, setSchedule] = useState<ReminderSchedule | null>(null);
  const [activeTemplateType, setActiveTemplateType] = useState<string>("checklist_initial");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/emails");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        setSchedule(data.schedule || null);
      }
    } catch (err) {
      console.error("Failed to load email config:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentTemplate = templates.find((t) => t.template_type === activeTemplateType);

  const handleUpdateTemplate = (field: keyof EmailTemplate, val: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.template_type === activeTemplateType ? { ...t, [field]: val } : t))
    );
  };

  const handleUpdateScheduleTier = (index: number, field: string, val: any) => {
    if (!schedule) return;
    const newTiers = [...schedule.tiers];
    newTiers[index] = { ...newTiers[index], [field]: val };
    setSchedule({ ...schedule, tiers: newTiers });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSavedMessage("");

    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templates, schedule }),
      });

      if (res.ok) {
        setSavedMessage("Email copy and schedule saved live!");
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (err) {
      alert("Failed to save email settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-primary" />
              <span>Email Copy Templates & Escalating Reminder Schedules</span>
            </h2>
            <p className="text-xs text-brand-textSecondary mt-1">
              Supports dynamic placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">&#123;&#123;client_name&#125;&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">&#123;&#123;missing_items&#125;&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">&#123;&#123;service&#125;&#125;</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">&#123;&#123;firm_name&#125;&#125;</code>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedMessage}</span>
              </div>
            )}
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2.5 bg-brand-primary text-white rounded-brand text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save All Templates"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Selector */}
        <div className="space-y-4">
          <div className="bg-brand-surface border border-brand-border rounded-brand p-4 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase text-brand-textPrimary mb-2">Select Template to Edit</div>
            <button
              type="button"
              onClick={() => setActiveTemplateType("checklist_initial")}
              className={`w-full text-left p-3 text-xs rounded border transition ${
                activeTemplateType === "checklist_initial"
                  ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div>Initial Checklist & Upload Link</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sent immediately upon intake submission</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateType("reminder_chase_1")}
              className={`w-full text-left p-3 text-xs rounded border transition ${
                activeTemplateType === "reminder_chase_1"
                  ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div>Chase 1: Friendly Check-In (Day 2)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Polite reminder of outstanding items</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateType("reminder_chase_2")}
              className={`w-full text-left p-3 text-xs rounded border transition ${
                activeTemplateType === "reminder_chase_2"
                  ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div>Chase 2: Review On Hold (Day 5)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Direct notice that review is blocked</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateType("reminder_chase_3")}
              className={`w-full text-left p-3 text-xs rounded border transition ${
                activeTemplateType === "reminder_chase_3"
                  ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div>Chase 3: Final Urgent Notice (Day 9)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Final warning before inactive file closure</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateType("staff_summary")}
              className={`w-full text-left p-3 text-xs rounded border transition ${
                activeTemplateType === "staff_summary"
                  ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div>Staff Pre-Meeting Briefing Notice</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sent to staff once all checklist items are fulfilled</div>
            </button>
          </div>

          {/* Schedule Intervals Card */}
          {schedule && (
            <div className="bg-brand-surface border border-brand-border rounded-brand p-4 shadow-sm space-y-3">
              <div className="text-xs font-bold uppercase text-brand-textPrimary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-primary" />
                <span>Follow-up Interval Schedule</span>
              </div>
              <div className="space-y-2">
                {schedule.tiers.map((tier, idx) => (
                  <div key={tier.tier} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Chase {tier.tier} ({tier.tone})</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={tier.days_elapsed}
                          onChange={(e) => handleUpdateScheduleTier(idx, "days_elapsed", parseInt(e.target.value) || 1)}
                          className="w-12 px-1.5 py-0.5 text-xs text-center border rounded font-mono"
                        />
                        <span className="text-[11px] text-slate-500">days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Template Editor */}
        <div className="lg:col-span-2 space-y-4">
          {currentTemplate ? (
            <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                <h3 className="font-bold text-sm text-brand-textPrimary uppercase tracking-wider">
                  Editing: {currentTemplate.template_type}
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={currentTemplate.subject}
                  onChange={(e) => handleUpdateTemplate("subject", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                  Card Headline Title
                </label>
                <input
                  type="text"
                  value={currentTemplate.headline}
                  onChange={(e) => handleUpdateTemplate("headline", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                  Email Body Content Text
                </label>
                <textarea
                  rows={6}
                  value={currentTemplate.body_text}
                  onChange={(e) => handleUpdateTemplate("body_text", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                  Action Button Text (CTA)
                </label>
                <input
                  type="text"
                  value={currentTemplate.cta_button_text}
                  onChange={(e) => handleUpdateTemplate("cta_button_text", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                />
              </div>

              {/* Statutory Notice Indicator */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                🔒 <strong>Server-Enforced Compliance Notice:</strong> All dispatched emails automatically append the statutory disclaimer: <em>&quot;This is an informational summary only. It does not constitute tax, accounting, legal, or other regulated professional advice.&quot;</em>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-brand-surface border border-brand-border rounded-brand">
              Select a template to configure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
