"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeSettings } from "@/lib/types";
import { Palette, CheckCircle2, RefreshCw, Eye } from "lucide-react";

export default function AdminThemePage() {
  const { theme, updateThemeLocal } = useTheme();
  const [formData, setFormData] = useState<ThemeSettings>(theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(theme);
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    // Instant live preview
    updateThemeLocal(updated);
  };

  const handlePresetSelect = (preset: { name: string; primary: string; secondary: string; accent: string }) => {
    const updated = {
      ...formData,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent,
    };
    setFormData(updated);
    updateThemeLocal(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(data);
        updateThemeLocal(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      alert("Failed to save theme settings.");
    } finally {
      setSaving(false);
    }
  };

  const presets = [
    { name: "Royal Navy & Sky (Corporate Accountancy)", primary: "#1e3a8a", secondary: "#0284c7", accent: "#f59e0b" },
    { name: "Emerald & Forest (Wealth & Tax Advisory)", primary: "#065f46", secondary: "#059669", accent: "#d97706" },
    { name: "Midnight Crimson (Commercial Law Firm)", primary: "#881337", secondary: "#be123c", accent: "#e11d48" },
    { name: "Deep Amethyst (Management Consulting)", primary: "#4c1d95", secondary: "#7c3aed", accent: "#a855f7" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
          <div>
            <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-primary" />
              <span>Firm Branding & Dynamic Theme Editor</span>
            </h2>
            <p className="text-xs text-brand-textSecondary mt-1">
              Changes apply instantly to public intake forms, client upload links, staff dashboards, and email templates.
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Theme Applied Live!</span>
            </div>
          )}
        </div>

        {/* Quick Color Presets */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-brand">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
            Quick Brand Palettes (Click to Test Live Swapping)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className="p-2.5 text-left bg-white border border-slate-200 rounded-brand hover:border-slate-400 transition text-xs flex flex-col justify-between"
              >
                <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.primary }} />
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.secondary }} />
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Firm Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Firm / Practice Name
              </label>
              <input
                type="text"
                name="firm_name"
                value={formData.firm_name || ""}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 text-sm rounded-brand border border-brand-border bg-white text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Practice Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline || ""}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-brand border border-brand-border bg-white text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color || "#1e3a8a"}
                  onChange={handleChange}
                  className="w-10 h-10 p-0 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="primary_color"
                  value={formData.primary_color || "#1e3a8a"}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1.5 text-sm rounded-brand border border-brand-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color || "#0284c7"}
                  onChange={handleChange}
                  className="w-10 h-10 p-0 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="secondary_color"
                  value={formData.secondary_color || "#0284c7"}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1.5 text-sm rounded-brand border border-brand-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="accent_color"
                  value={formData.accent_color || "#f59e0b"}
                  onChange={handleChange}
                  className="w-10 h-10 p-0 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  name="accent_color"
                  value={formData.accent_color || "#f59e0b"}
                  onChange={handleChange}
                  className="flex-1 px-3 py-1.5 text-sm rounded-brand border border-brand-border"
                />
              </div>
            </div>
          </div>

          {/* Typography and Border Radius */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Typography Font Family
              </label>
              <select
                name="font_family"
                value={formData.font_family || "'Inter', sans-serif"}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-brand border border-brand-border bg-white text-brand-textPrimary"
              >
                <option value="'Inter', sans-serif">Inter (Modern & Clean)</option>
                <option value="'Georgia', serif">Georgia (Traditional Legal / Advisory)</option>
                <option value="'Roboto', sans-serif">Roboto (Structured)</option>
                <option value="system-ui, sans-serif">Native System UI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                Corner Radius
              </label>
              <select
                name="border_radius"
                value={formData.border_radius || "8px"}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-brand border border-brand-border bg-white text-brand-textPrimary"
              >
                <option value="4px">Compact (4px)</option>
                <option value="8px">Standard (8px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="16px">Pill / Soft (16px)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-brand font-bold text-white text-sm shadow transition disabled:opacity-50"
              style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
            >
              {saving ? "Saving to Database..." : "Save & Publish Theme"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
