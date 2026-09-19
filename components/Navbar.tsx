"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { ShieldAlert, Settings, FileText, Users, Building, LogIn, LogOut, UserCheck } from "lucide-react";

export function Navbar() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
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

          {/* User Auth Status Pill */}
          <div className="pl-2 border-l border-slate-200 ml-1 flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-brand-textPrimary leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-brand-textSecondary capitalize font-mono">
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-brand bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 transition flex items-center gap-1.5 border border-slate-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-bold rounded-brand bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
