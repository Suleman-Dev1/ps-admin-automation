"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Settings, Palette, Briefcase, Mail, Bot, Users, PlayCircle, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const navItems = [
    { href: "/admin", label: "Overview & Simulator", icon: PlayCircle, exact: true },
    { href: "/admin/theme", label: "Theme & Branding", icon: Palette },
    { href: "/admin/verticals", label: "Verticals & Checklists", icon: Briefcase },
    { href: "/admin/emails", label: "Email & Reminders", icon: Mail },
    { href: "/admin/ai", label: "OpenAI Prompts", icon: Bot },
    { href: "/admin/staff", label: "Staff Team", icon: Users },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/admin")}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
        <p className="text-xs text-brand-textSecondary font-semibold">Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-brand-textPrimary">Authentication Required</h2>
        <p className="text-xs text-brand-textSecondary">
          The Admin Control Center requires a valid staff or administrator session.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname || "/admin")}`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-brand text-xs font-bold text-white shadow"
          style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
        >
          Sign In to Admin Panel
        </Link>
      </div>
    );
  }

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

        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Authenticated as: <strong>{user.name}</strong> ({user.role})</span>
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
