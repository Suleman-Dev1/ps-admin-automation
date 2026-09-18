"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, FileText, AlertTriangle, CheckCircle2, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { ClientRecord } from "@/lib/types";

export default function StaffDashboardPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) => {
    if (filter === "all") return true;
    return c.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-textPrimary flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-primary" />
            <span>Staff Onboarding CRM & Client Pipeline</span>
          </h1>
          <p className="text-xs text-brand-textSecondary mt-1">
            Track onboarding progression, document verification, missing items, and pre-meeting factual summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/intake"
            className="px-3.5 py-2 bg-brand-primary text-white rounded text-xs font-bold shadow hover:opacity-90"
          >
            + New Intake
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "New", "Awaiting Documents", "Chasing", "Ready", "Meeting Booked", "Summary Sent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition ${
              filter === tab
                ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                : "bg-brand-surface text-brand-textSecondary border-brand-border hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Clients Table */}
      <div className="bg-brand-surface border border-brand-border rounded-brand shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-brand-border text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client ID</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Checklist Progress</th>
                <th className="py-3 px-4">Gaps / Missing</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filtered.map((c) => {
                const total = c.checklist_required?.length || 0;
                const missingCount = c.missing_items?.length || 0;
                const received = total - missingCount;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-brand-textPrimary">{c.contact?.name}</div>
                      <div className="text-[11px] text-brand-textSecondary">{c.contact?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{c.business_type}</td>
                    <td className="py-3 px-4 font-medium">{c.service_requested}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          c.status === "Ready" || c.status === "Meeting Booked" || c.status === "Summary Sent"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "Chasing"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">
                        {received} / {total} docs
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {missingCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                          {c.missing_items?.join(", ")}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ✓ All Received
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/staff/clients/${c.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No clients found. Use the Admin Simulator or submit an Intake Form to populate!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
