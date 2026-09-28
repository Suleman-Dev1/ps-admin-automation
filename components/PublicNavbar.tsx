"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { useSidebar } from "./SidebarContext";
import { 
  Building, 
  FileText, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Calculator,
  HelpCircle,
  Briefcase,
  ExternalLink
} from "lucide-react";

export function PublicNavbar() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { toggleSidebar, isOpen } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Compliance / Qualification Top Strip */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-[11px] font-medium tracking-wide flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">ICAEW &amp; ACCA Qualified Standards</span>
            <span className="hidden md:inline text-slate-400">• Dynamic Intake &amp; OCR Verification</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-400 text-[10px]">
              Administrative Automation Only
            </span>
            <Link 
              href="/login"
              className="text-slate-200 hover:text-white font-semibold underline underline-offset-2 flex items-center gap-1 text-[11px]"
            >
              <span>Staff / Admin Gateway</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          {/* If logged in, also show a quick line-icon toggle for convenience */}
          {user && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition"
              title={isOpen ? "Hide Sidebar (Line Icon)" : "Show Sidebar (Line Icon)"}
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            {theme.logo_url ? (
              <img src={theme.logo_url} alt={theme.firm_name} className="h-9 w-auto rounded-lg object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:scale-105 transition-transform">
                <Building className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight group-hover:text-blue-600 transition">
                {theme.firm_name || "Apex Advisory"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {theme.tagline || "Chartered & Digital Accounting"}
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Anchor Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-600">
          <Link
            href="/#services"
            className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100/80 transition"
          >
            Services &amp; Scope
          </Link>

          <Link
            href="/#calculator"
            className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100/80 transition"
          >
            Fee Estimator
          </Link>

          <Link
            href="/#process"
            className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100/80 transition"
          >
            How It Works
          </Link>

          <Link
            href="/#faq"
            className="px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100/80 transition"
          >
            Client FAQ
          </Link>

          <Link
            href="/intake"
            className="px-3 py-2 rounded-xl text-blue-600 hover:bg-blue-50 transition flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Client Intake</span>
          </Link>
        </nav>

        {/* Right Action CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            /* Logged In View */
            <div className="flex items-center gap-2.5">
              <Link
                href={user.role === "admin" ? "/admin" : "/staff"}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs"
              >
                <span>{user.role === "admin" ? "Admin Panel" : "Staff CRM"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Public Visitor View */
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Staff &amp; Admin Sign In</span>
              </Link>

              <Link
                href="/intake"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs hover:shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Start Client Intake</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/intake"
            className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold"
          >
            Intake
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in fade-in">
          <div className="space-y-1">
            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Services &amp; Scope
            </Link>
            <Link
              href="/#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Fee Estimator
            </Link>
            <Link
              href="/#process"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Client FAQ
            </Link>
            <Link
              href="/intake"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/70"
            >
              Client Intake Form (2 Mins)
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin" : "/staff"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white text-center shadow-xs"
                >
                  Enter {user.role === "admin" ? "Admin Panel" : "Staff CRM"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-red-600 bg-red-50 text-center border border-red-100"
                >
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 text-white text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff &amp; Admin Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
