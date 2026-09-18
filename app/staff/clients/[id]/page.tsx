"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Calendar,
  Sparkles,
  ArrowLeft,
  Loader2,
  Lock,
  FileCheck,
} from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [client, setClient] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchClientDetails = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setDocuments(data.documents || []);
        setReminders(data.reminders || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  // Actions
  const handleTriggerReminder = async () => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/reminders/send-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Follow-up email dispatched to ${client.contact?.email}! Status: ${data.status}`);
        fetchClientDetails();
      } else {
        alert(data.error || "Failed to send reminder");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const res = await fetch("/api/summary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSummary(data.summary);
        setActionMessage("OpenAI pre-meeting briefing generated with mandatory disclaimer!");
        fetchClientDetails();
      } else {
        alert(data.error || "Failed to generate summary");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
        <p className="text-sm text-slate-500 mt-2">Loading client profile...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center bg-white border rounded">
        <p className="text-slate-600">Client record not found.</p>
        <Link href="/staff" className="text-blue-600 text-xs font-bold mt-2 inline-block">
          &larr; Back to Staff CRM
        </Link>
      </div>
    );
  }

  const checklist: string[] = client.checklist_required || [];
  const missing: string[] = client.missing_items || [];
  const isComplete = missing.length === 0 && checklist.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link href="/staff" className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-brand-textPrimary">{client.contact?.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {client.id}
              </span>
            </div>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              {client.business_type} • {client.service_requested} • Registered: {new Date(client.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {missing.length > 0 && (
            <button
              onClick={handleTriggerReminder}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shadow flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Chase Reminder (Resend)</span>
            </button>
          )}

          {isComplete && (
            <button
              onClick={handleGenerateSummary}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize Summary (OpenAI)</span>
            </button>
          )}

          <Link
            href={`/upload/${client.upload_token}`}
            target="_blank"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold border transition"
          >
            Upload Portal Link
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Grid: Client Details & Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Intake & CRM Details */}
        <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary border-b border-brand-border pb-2">
            Intake & Profile Details
          </h2>
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500">Contact Email:</span>
              <div className="font-bold text-slate-800">{client.contact?.email}</div>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>
              <div className="font-bold text-slate-800">{client.contact?.phone}</div>
            </div>
            <div>
              <span className="text-slate-500">Business Entity:</span>
              <div className="font-bold text-slate-800">{client.business_type}</div>
            </div>
            <div>
              <span className="text-slate-500">Turnover Band:</span>
              <div className="font-bold text-slate-800">{client.turnover_band}</div>
            </div>
            <div>
              <span className="text-slate-500">Employee Headcount:</span>
              <div className="font-bold text-slate-800">{client.employee_count} employees</div>
            </div>
            {client.relevant_date && (
              <div>
                <span className="text-slate-500">Accounting Year-End:</span>
                <div className="font-bold text-slate-800">{client.relevant_date}</div>
              </div>
            )}
            {client.existing_provider && (
              <div>
                <span className="text-slate-500">Previous Provider:</span>
                <div className="font-bold text-slate-800">{client.existing_provider}</div>
              </div>
            )}
          </div>

          {/* Gated Cal.com Meeting Status */}
          <div className="pt-4 border-t border-brand-border">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Gated Meeting Booking Status</span>
            </div>
            {isComplete ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Booking Unlocked</span>
                </div>
                <p className="text-[11px] text-emerald-700">Checklist is 100% complete.</p>
                <Link
                  href={`/book/${client.upload_token}`}
                  target="_blank"
                  className="mt-1.5 inline-block text-[11px] font-bold text-emerald-800 underline"
                >
                  Open Cal.com Booking Link &rarr;
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Booking Locked</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Missing {missing.length} documents: {missing.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2 & 3: Documents, Extraction, & OpenAI Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Verification & Extraction Table */}
          <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary">
                Uploaded Documents & Extraction Results ({documents.length})
              </h2>
              <span className="text-[11px] text-slate-500 font-semibold">
                {documents.length} / {checklist.length} received
              </span>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.doc_id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-brand text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>{doc.doc_type}</span>
                      <span className="font-mono text-slate-500 font-normal">({doc.filename})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        Confidence: {(Number(doc.confidence) * 100).toFixed(0)}%
                      </span>
                      {doc.needs_human_review && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Needs Review
                        </span>
                      )}
                    </div>
                  </div>

                  {doc.key_fields && Object.keys(doc.key_fields).length > 0 && (
                    <div className="p-2 bg-white rounded border border-slate-200 text-[11px] font-mono text-slate-800">
                      <strong>Extracted Facts:</strong> {JSON.stringify(doc.key_fields)}
                    </div>
                  )}
                </div>
              ))}

              {documents.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No documents uploaded yet. Use the client upload portal to test uploads!
                </div>
              )}
            </div>
          </div>

          {/* OpenAI Pre-Meeting Staff Briefing Summary */}
          {summary && (
            <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h2 className="text-sm font-bold text-brand-textPrimary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Pre-Meeting Factual Staff Briefing (OpenAI gpt-4o)</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(summary.generated_at).toLocaleString()}
                </span>
              </div>

              {/* Statutory Non-Removable Disclaimer Banner */}
              <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-950 text-xs rounded-r">
                <strong>Mandatory Statutory Notice:</strong> {summary.advice_disclaimer}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Business Profile:</span>
                  <p className="text-slate-900 mt-0.5 font-medium">{summary.business_profile}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-700">Aggregated Key Figures Extracted:</span>
                  <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded font-mono text-[11px] mt-1 whitespace-pre-wrap">
                    {JSON.stringify(summary.key_figures_extracted, null, 2)}
                  </pre>
                </div>

                <div>
                  <span className="font-bold text-slate-700">Suggested Factual Inquiries for Staff:</span>
                  <ul className="list-disc list-inside text-slate-800 mt-1 space-y-1">
                    {(summary.open_questions || []).map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up Reminder History */}
          <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary border-b border-brand-border pb-2">
              Follow-Up & Reminder Audit Trail ({reminders.length})
            </h2>
            <div className="space-y-2">
              {reminders.map((r) => (
                <div key={r.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{r.subject}</div>
                    <div className="text-[11px] text-slate-500">
                      Chase #{r.reminder_number} sent to {r.recipient_email} at {new Date(r.sent_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                    {r.status}
                  </span>
                </div>
              ))}
              {reminders.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">No follow-ups dispatched yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
