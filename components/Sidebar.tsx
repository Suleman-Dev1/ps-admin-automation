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
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity
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
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 text-slate-900 shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs bg-gradient-to-br from-blue-600 to-indigo-600"
          >
            <Building className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
            {theme.firm_name || "Apex Advisory"}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container (Fixed / Sticky on Left, White Theme) */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xs
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top: Brand Header & Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-3 group">
              {theme.logo_url ? (
                <img src={theme.logo_url} alt={theme.firm_name} className="h-9 w-auto rounded-lg object-contain" />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:scale-105 transition"
                >
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-slate-900 tracking-tight truncate group-hover:text-blue-700 transition">
                  {theme.firm_name || "Apex Advisory"}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{theme.tagline || "Chartered & Digital"}</span>
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
          <nav className="space-y-6">
            {/* Section 1: Customer & Public Links */}
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                Client &amp; Services
              </div>

              <Link
                href="/"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent("/")
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Home className={`w-4 h-4 ${isCurrent("/") ? "text-blue-600" : "text-slate-400"}`} />
                <span>Home &amp; Overview</span>
              </Link>

              <Link
                href="/intake"
                onClick={closeMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent("/intake")
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${isCurrent("/intake") ? "text-blue-600" : "text-slate-400"}`} />
                  <span>Client Intake</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-bold uppercase">
                  Fast
                </span>
              </Link>

              <Link
                href="/login"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent("/login")
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LogIn className={`w-4 h-4 ${isCurrent("/login") ? "text-blue-600" : "text-slate-400"}`} />
                <span>Sign In / Sign Up</span>
              </Link>
            </div>

            {/* Section 2: Staff Workspace (Available to Staff & Admins) */}
            {(user?.role === "admin" || user?.role === "accountant" || user?.role === "associate") && (
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Staff Workspace
                </div>

                <Link
                  href="/staff"
                  onClick={closeMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isCurrent("/staff")
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 ${isCurrent("/staff") ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>Staff CRM Pipeline</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            )}

            {/* Section 3: Admin Panel (Only for Admins) */}
            {user?.role === "admin" && (
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  Admin Configuration
                </div>

                <Link
                  href="/admin"
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isCurrent("/admin") && pathname === "/admin"
                      ? "bg-purple-50 text-purple-700 border border-purple-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span>Admin Overview</span>
                </Link>

                <div className="pl-6 space-y-1 border-l border-slate-200 ml-3">
                  <Link
                    href="/admin/theme"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/theme")
                        ? "text-blue-700 font-bold bg-blue-50/60"
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
                        ? "text-blue-700 font-bold bg-blue-50/60"
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
                        ? "text-blue-700 font-bold bg-blue-50/60"
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
                        ? "text-blue-700 font-bold bg-blue-50/60"
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
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xs"
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
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-700 transition text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500 text-center font-medium">
                Staff &amp; Client Portal
              </div>
              <Link
                href="/login"
                onClick={closeMobile}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            </div>
          )}

          {/* Platform Status */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Platform Operational • v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
