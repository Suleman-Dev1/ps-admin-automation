"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import { useSidebar } from "./SidebarContext";
import { 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Home, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Building,
  UserCheck
} from "lucide-react";

export function WorkspaceTopBar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname() || "";

  // Compute breadcrumb label from current path
  const getBreadcrumb = () => {
    if (pathname === "/login") return "Portal Gateway / Sign In";
    if (pathname === "/admin") return "Admin Overview";
    if (pathname === "/admin/theme") return "Admin / Theme & Colors";
    if (pathname === "/admin/verticals") return "Admin / Verticals & Form Builder";
    if (pathname === "/admin/emails") return "Admin / Automated Email Templates";
    if (pathname === "/admin/ai") return "Admin / OpenAI Document Verification";
    if (pathname === "/admin/staff") return "Admin / Staff Management";
    if (pathname === "/staff") return "Staff CRM / Client Review Pipeline";
    if (pathname.startsWith("/staff/clients/")) return "Staff CRM / Client Dossier";
    return "Workspace";
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
      {/* Left: Line Icon Button (Toggle Sidebar) & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* The Line Icon Toggle Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className={`
            p-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all duration-200 shadow-2xs border
            ${
              isOpen
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300/80"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-500/20"
            }
          `}
          title={isOpen ? "Click line icon to hide sidebar" : "Click line icon to show sidebar"}
          aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {/* Universal 3-line hamburger icon */}
          <Menu className="w-4 h-4 text-slate-800" />
          <span className="hidden sm:inline font-semibold">
            {isOpen ? "Hide Sidebar" : "Show Sidebar"}
          </span>
        </button>

        {/* Breadcrumb Info */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="text-slate-400 hover:text-slate-700 transition flex items-center gap-1"
            title="Go to Public Landing Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Public Site</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800 tracking-tight">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: Firm Info, User Profile & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Compliance pill */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Operational v2.0</span>
        </div>

        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 capitalize">
                {user.role}
              </span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
              {user.name?.charAt(0) || "U"}
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
