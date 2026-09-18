"use client";

import React, { useState, useEffect } from "react";
import { StaffUser } from "@/lib/types";
import { Users, Plus, Trash2, Mail, CheckCircle2 } from "lucide-react";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "accountant" | "associate" | "auditor">("accountant");
  const [receiveSummaries, setReceiveSummaries] = useState(true);
  const [receiveAlerts, setReceiveAlerts] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newStaff: StaffUser = {
      id: `staff_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      receive_summaries: receiveSummaries,
      receive_chase_alerts: receiveAlerts,
    };

    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStaff),
    });

    if (res.ok) {
      setName("");
      setEmail("");
      setSavedMessage("Staff member added successfully!");
      fetchData();
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              <span>Staff Notification Team</span>
            </h2>
            <p className="text-xs text-brand-textSecondary mt-1">
              Staff members registered here automatically receive pre-meeting summaries and missing document chase alerts.
            </p>
          </div>
          {savedMessage && (
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add Staff Member */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-brand-textPrimary flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-brand-primary" />
            <span>Add Staff Member</span>
          </h3>
          <form onSubmit={handleAddStaff} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Vance, ACA"
                required
                className="w-full px-2.5 py-1.5 text-xs rounded border border-brand-border"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="david@firm.com"
                required
                className="w-full px-2.5 py-1.5 text-xs rounded border border-brand-border"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">Practice Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-brand-border bg-white"
              >
                <option value="admin">Managing Partner / Admin</option>
                <option value="accountant">Senior Accountant</option>
                <option value="associate">Onboarding Associate</option>
                <option value="auditor">Audit Lead</option>
              </select>
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center gap-2 text-xs text-brand-textPrimary">
                <input
                  type="checkbox"
                  checked={receiveSummaries}
                  onChange={(e) => setReceiveSummaries(e.target.checked)}
                />
                <span>Receive Pre-Meeting Factual Summaries</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-brand-textPrimary">
                <input
                  type="checkbox"
                  checked={receiveAlerts}
                  onChange={(e) => setReceiveAlerts(e.target.checked)}
                />
                <span>Receive Missing Document Escalation Alerts</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 bg-brand-primary text-white text-xs font-bold rounded shadow"
            >
              Add Staff User
            </button>
          </form>
        </div>

        {/* Right: Staff List Table */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-brand-textPrimary">Registered Staff ({staffList.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-brand-border text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Subscriptions</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s.id} className="border-b border-brand-border/50">
                    <td className="py-2.5 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2.5 text-slate-600">{s.email}</td>
                    <td className="py-2.5">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 font-semibold">{s.role}</span>
                    </td>
                    <td className="py-2.5 space-x-1">
                      {s.receive_summaries && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                          Summaries
                        </span>
                      )}
                      {s.receive_chase_alerts && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold">
                          Alerts
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
