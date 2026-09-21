"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { 
  Building, 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Palette, 
  Sliders, 
  Mail, 
  Bot, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

export function Sidebar() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCurrent = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Header with Hamburger Toggle */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs"
            style={{ backgroundColor: theme.primary_color || "#1e3a8a" }}
          >
            <Building className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 truncate">
            {theme.firm_name || "Professional Advisory"}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 animate-in fade-in"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container (Fixed / Sticky on Left) */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-sm
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top: Brand Header & Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-3 group">
              {theme.logo_url ? (
                <img src={theme.logo_url} alt={theme.firm_name} className="h-9 w-auto rounded object-contain" />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition"
                  style={{ backgroundColor: theme.primary_color || "#1e3a8a" }}
                >
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-slate-900 truncate group-hover:text-blue-700 transition">
                  {theme.firm_name || "Professional Services"}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {theme.tagline || "Admin Platform"}
                </div>
              </div>
            </Link>

            {/* Close button on mobile inside drawer */}
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-5">
            {/* Section 1: Public / Client Links */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                Customer &amp; Services
              </div>

              <Link
                href="/"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isCurrent("/")
                    ? "bg-blue-50 text-blue-700 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Home &amp; Overview</span>
              </Link>

              <Link
                href="/intake"
                onClick={closeMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isCurrent("/intake")
                    ? "bg-blue-50 text-blue-700 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Client Intake</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase">
                  Enquiry
                </span>
              </Link>

              <Link
                href="/login"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  isCurrent("/login")
                    ? "bg-blue-50 text-blue-700 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Sign In / Sign Up</span>
              </Link>
            </div>

            {/* Section 2: Staff CRM (Available to Staff & Admins) */}
            {(user?.role === "admin" || user?.role === "accountant" || user?.role === "associate") && (
              <div className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Staff Workspace
                </div>

                <Link
                  href="/staff"
                  onClick={closeMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isCurrent("/staff")
                      ? "bg-blue-50 text-blue-700 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Staff CRM Pipeline</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            )}

            {/* Section 3: Admin Panel (Only for Admins) */}
            {user?.role === "admin" && (
              <div className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Admin Configuration
                </div>

                <Link
                  href="/admin"
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isCurrent("/admin") && pathname === "/admin"
                      ? "bg-blue-50 text-blue-700 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span>Admin Overview</span>
                </Link>

                <div className="pl-6 space-y-1 border-l border-slate-100 ml-3">
                  <Link
                    href="/admin/theme"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/theme")
                        ? "text-blue-700 font-bold bg-blue-50/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    🎨 Theme &amp; Colors
                  </Link>

                  <Link
                    href="/admin/verticals"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/verticals")
                        ? "text-blue-700 font-bold bg-blue-50/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    📋 Verticals &amp; Forms
                  </Link>

                  <Link
                    href="/admin/emails"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/emails")
                        ? "text-blue-700 font-bold bg-blue-50/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    ✉️ Email Templates
                  </Link>

                  <Link
                    href="/admin/ai"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/ai")
                        ? "text-blue-700 font-bold bg-blue-50/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    🤖 OpenAI Settings
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Card: User Authentication & Profile / Sign In */}
        <div className="p-4 border-t border-slate-200/90 bg-slate-50/60 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
                  style={{ backgroundColor: theme.primary_color || "#1e3a8a" }}
                >
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono capitalize">
                    {user.role} Account
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  closeMobile();
                }}
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500 text-center">
                Staff &amp; Administrative Portal
              </div>
              <Link
                href="/login"
                onClick={closeMobile}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Sign In</span>
              </Link>
            </div>
          )}

          {/* Quick Notice */}
          <div className="text-[10px] text-slate-400 text-center leading-tight">
            Administrative Automation Only
          </div>
        </div>
      </aside>
    </>
  );
}
