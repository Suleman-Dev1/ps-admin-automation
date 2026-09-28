"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { PublicNavbar } from "./PublicNavbar";
import { WorkspaceTopBar } from "./WorkspaceTopBar";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "./ThemeProvider";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const { theme } = useTheme();
  const { isWorkspaceRoute } = useSidebar();

  // Public landing page and client onboarding routes
  const isPublicRoute = 
    pathname === "/" || 
    pathname === "/intake" || 
    pathname.startsWith("/upload") || 
    pathname.startsWith("/book");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans">
      {/* Dynamic Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area: dynamically expands when sidebar is hidden */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] min-h-screen relative overflow-x-hidden transition-all duration-300">
        {/* Subtle ambient soft background glows */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-blue-100/50 blur-[130px] pointer-events-none rounded-full" />
        <div className="fixed top-64 right-10 w-[500px] h-[300px] bg-indigo-100/40 blur-[120px] pointer-events-none rounded-full" />

        {/* Top Header: Public Navbar on Landing/Intake, Workspace Top Bar on Admin/Staff/Login */}
        {isPublicRoute ? <PublicNavbar /> : <WorkspaceTopBar />}

        {/* Expansive Page Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Enterprise Light Footer */}
        <footer className="border-t border-slate-200/90 bg-white/90 backdrop-blur-md py-8 text-center text-xs text-slate-500 relative z-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="text-slate-700 font-semibold">
              &copy; {new Date().getFullYear()} {theme.firm_name || "Apex Advisory"} — Professional Services Admin Automation Platform
            </p>
            <p className="text-slate-400 text-[11px] max-w-2xl mx-auto leading-relaxed">
              Administrative Automation Only — Regulated Professional Advice Strictly Excluded until verified engagement.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
