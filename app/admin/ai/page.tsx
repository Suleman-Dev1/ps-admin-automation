"use client";

import React, { useState, useEffect } from "react";
import { AIPromptSettings } from "@/lib/types";
import { Bot, Shield, Save, CheckCircle2, Lock, AlertTriangle, Key } from "lucide-react";

export default function AdminAIPage() {
  const [aiSettings, setAiSettings] = useState<AIPromptSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/ai");
      if (res.ok) {
        const data = await res.json();
        setAiSettings(data.settings);
        setHasApiKey(data.has_api_key);
      }
    } catch (err) {
      console.error("Failed to load AI settings:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSettings) return;
    setSaving(true);
    setSavedMessage("");

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });

      if (res.ok) {
        setSavedMessage("OpenAI prompt settings saved successfully!");
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (err) {
      alert("Failed to save AI settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!aiSettings) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading OpenAI settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-primary" />
              <span>OpenAI API Prompt Configuration & Guardrails</span>
            </h2>
            <p className="text-xs text-brand-textSecondary mt-1">
              Configures document extraction and staff briefing prompts. Non-negotiable statutory compliance boundaries are server-enforced.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                hasApiKey
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <Key className="w-3 h-3" />
              <span>{hasApiKey ? "OpenAI API Key Active" : "Local Parser Mode (Key Optional)"}</span>
            </span>
            {savedMessage && (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Selection & Parameters */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-brand-textPrimary uppercase tracking-wider">
            Model & Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                OpenAI Model Name
              </label>
              <select
                value={aiSettings.model}
                onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
              >
                <option value="gpt-4o">gpt-4o (Vision & Multimodal Document Parsing)</option>
                <option value="gpt-4o-mini">gpt-4o-mini (Fast & Low Cost)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                <code>gpt-4o</code> natively handles images, scans, and PDF page screenshots for OCR extraction.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                Temperature (Determinism)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={aiSettings.temperature}
                onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Set to <code>0.1</code> for factual, hallucination-resistant data extraction.
              </p>
            </div>
          </div>
        </div>

        {/* Extraction Prompt (Editable) */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-textPrimary uppercase tracking-wider">
              Document Classification & Extraction System Prompt (Admin-Editable)
            </h3>
          </div>
          <textarea
            rows={4}
            value={aiSettings.system_extraction_prompt}
            onChange={(e) => setAiSettings({ ...aiSettings, system_extraction_prompt: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded border border-brand-border bg-white font-mono"
          />
        </div>

        {/* Summary Prompt (Editable) */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-textPrimary uppercase tracking-wider">
              Staff Pre-Meeting Briefing System Prompt (Admin-Editable)
            </h3>
          </div>
          <textarea
            rows={4}
            value={aiSettings.system_summary_prompt}
            onChange={(e) => setAiSettings({ ...aiSettings, system_summary_prompt: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded border border-brand-border bg-white font-mono"
          />
        </div>

        {/* Fixed Non-Editable Compliance Boundary */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-brand p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Fixed Server-Enforced Compliance Boundary (Non-Editable & Non-Removable)</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            This boundary text is strictly enforced in code and appended server-side to every OpenAI API call. Even if an admin attempts to remove or alter prompts above, this block guarantees that the system automates administration only and never generates regulated tax, accounting, or legal advice.
          </p>
          <div className="p-3.5 bg-white border border-amber-200 rounded font-mono text-xs text-slate-800 select-all">
            {aiSettings.fixed_compliance_boundary}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-primary text-white rounded-brand text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Saving..." : "Save AI Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
