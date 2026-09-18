"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { ShieldAlert, Settings, FileText, Users, Building } from "lucide-react";

export function Navbar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const isCurrent = (path: string) => pathname === path || pathname?.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 bg-brand-surface border-b border-brand-border shadow-sm">
      {/* Hard boundary compliance notice banner */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
        <span>
          <strong>Administrative Automation Only</strong> — This system automates factual intake, document processing, and briefings. It does not provide regulated tax, accounting, or legal advice.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          {theme.logo_url ? (
            <img src={theme.logo_url} alt={theme.firm_name} className="h-9 w-auto rounded" />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow"
              style={{
                backgroundColor: theme.primary_color || "#1e3a8a",
              }}
            >
              <Building className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="font-bold text-base text-brand-textPrimary group-hover:opacity-90 transition">
              {theme.firm_name || "Professional Services Platform"}
            </div>
            <div className="text-xs text-brand-textSecondary">
              {theme.tagline || "Admin Automation Platform"}
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className={`px-3 py-1.5 text-sm font-medium rounded-brand transition flex items-center gap-1.5 ${
              isCurrent("/admin")
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Admin Panel</span>
          </Link>

          <Link
            href="/intake"
            className={`px-3 py-1.5 text-sm font-medium rounded-brand transition flex items-center gap-1.5 ${
              isCurrent("/intake")
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Client Intake</span>
          </Link>

          <Link
            href="/staff"
            className={`px-3 py-1.5 text-sm font-medium rounded-brand transition flex items-center gap-1.5 ${
              isCurrent("/staff")
                ? "bg-brand-primary text-white shadow-sm"
                : "text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff CRM</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
