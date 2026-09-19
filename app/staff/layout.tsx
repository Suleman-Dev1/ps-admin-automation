"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Users, Lock, Loader2, ShieldCheck } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/staff")}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
        <p className="text-xs text-brand-textSecondary font-semibold">Verifying staff credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-brand-textPrimary">Staff Sign-In Required</h2>
        <p className="text-xs text-brand-textSecondary">
          Please sign in with your staff account to access client files and CRM pipelines.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname || "/staff")}`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-brand text-xs font-bold text-white shadow"
          style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
        >
          Sign In to Staff CRM
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
            Staff CRM Workspace
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Session: <strong>{user.name}</strong> ({user.role})</span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
