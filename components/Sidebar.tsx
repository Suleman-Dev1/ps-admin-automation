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
      <div className="lg:hidden bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md bg-gradient-to-br from-blue-500 to-indigo-600"
          >
            <Building className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight truncate">
            {theme.firm_name || "Apex Advisory"}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 animate-in fade-in"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container (Fixed / Sticky on Left) */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-[#0B0F17] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top: Brand Header & Main Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-3 group">
              {theme.logo_url ? (
                <img src={theme.logo_url} alt={theme.firm_name} className="h-9 w-auto rounded-lg object-contain" />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.35)] bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-105 transition"
                >
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-white tracking-tight truncate group-hover:text-blue-400 transition">
                  {theme.firm_name || "Apex Advisory"}
                </div>
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{theme.tagline || "Chartered & Digital"}</span>
                </div>
              </div>
            </Link>

            {/* Close button on mobile inside drawer */}
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-6">
            {/* Section 1: Customer & Public Links */}
            <div className="space-y-1.5">
              <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                Client &amp; Services
              </div>

              <Link
                href="/"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent("/")
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Home &amp; Overview</span>
              </Link>

              <Link
                href="/intake"
                onClick={closeMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent("/intake")
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Client Intake</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase">
                  Fast
                </span>
              </Link>

              <Link
                href="/login"
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isCurrent("/login")
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                <span>Sign In / Sign Up</span>
              </Link>
            </div>

            {/* Section 2: Staff Workspace (Available to Staff & Admins) */}
            {(user?.role === "admin" || user?.role === "accountant" || user?.role === "associate") && (
              <div className="space-y-1.5">
                <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                  Staff Workspace
                </div>

                <Link
                  href="/staff"
                  onClick={closeMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isCurrent("/staff")
                      ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Staff CRM Pipeline</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            )}

            {/* Section 3: Admin Panel (Only for Admins) */}
            {user?.role === "admin" && (
              <div className="space-y-1.5">
                <div className="px-3 pb-1 text-[10px] font-black tracking-wider text-slate-500 uppercase">
                  Admin Configuration
                </div>

                <Link
                  href="/admin"
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isCurrent("/admin") && pathname === "/admin"
                      ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Admin Overview</span>
                </Link>

                <div className="pl-6 space-y-1 border-l border-slate-800/80 ml-3">
                  <Link
                    href="/admin/theme"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/theme")
                        ? "text-blue-400 font-bold bg-blue-500/10"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    🎨 Theme &amp; Colors
                  </Link>

                  <Link
                    href="/admin/verticals"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/verticals")
                        ? "text-blue-400 font-bold bg-blue-500/10"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    📋 Verticals &amp; Forms
                  </Link>

                  <Link
                    href="/admin/emails"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/emails")
                        ? "text-blue-400 font-bold bg-blue-500/10"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    ✉️ Email Templates
                  </Link>

                  <Link
                    href="/admin/ai"
                    onClick={closeMobile}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isCurrent("/admin/ai")
                        ? "text-blue-400 font-bold bg-blue-500/10"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
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
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm"
                >
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono capitalize">
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
                className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-red-500/10 border border-slate-700/60 hover:border-red-500/30 text-slate-300 hover:text-red-400 transition text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 text-center font-medium">
                Staff &amp; Client Portal
              </div>
              <Link
                href="/login"
                onClick={closeMobile}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Link>
            </div>
          )}

          {/* Platform Status */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Platform Operational • v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
