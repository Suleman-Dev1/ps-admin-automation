"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Palette, Briefcase, Mail, Bot, Users, PlayCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Overview & Simulator", icon: PlayCircle, exact: true },
    { href: "/admin/theme", label: "Theme & Branding", icon: Palette },
    { href: "/admin/verticals", label: "Verticals & Checklists", icon: Briefcase },
    { href: "/admin/emails", label: "Email & Reminders", icon: Mail },
    { href: "/admin/ai", label: "OpenAI Prompts", icon: Bot },
    { href: "/admin/staff", label: "Staff Team", icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-primary" />
            <h1 className="text-2xl font-bold text-brand-textPrimary">Admin Control Center</h1>
          </div>
          <p className="text-xs text-brand-textSecondary mt-1">
            Dynamic Runtime Governance — All client-facing features read live from this panel.
          </p>
        </div>
      </div>

      {/* Admin Subnav */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-2 text-xs font-semibold rounded-brand transition flex items-center gap-2 ${
                isActive
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-brand-surface text-brand-textSecondary hover:text-brand-textPrimary hover:bg-slate-100 border border-brand-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
