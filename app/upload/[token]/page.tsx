"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Upload, FileCheck, AlertTriangle, CheckCircle2, Loader2, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TokenizedUploadPage() {
  const params = useParams();
  const token = params?.token as string;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Text / synthetic file simulator input
  const [syntheticDocType, setSyntheticDocType] = useState("bank_statement");
  const [fileContent, setFileContent] = useState("");

  const fetchClientData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload/${token}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid or expired upload link.");
      }
    } catch (err: any) {
      setError("Failed to connect to upload portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [token]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("doc_type_hint", syntheticDocType);
    formData.append("text_content", fileContent);
    formData.append("filename", `${syntheticDocType}.txt`);

    try {
      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult(data);
        setFileContent("");
        fetchClientData();
      } else {
        alert("Upload error: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleQuickSynthetic = async (type: string, content: string) => {
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("doc_type_hint", type);
    formData.append("text_content", content);
    formData.append("filename", `${type}.txt`);

    try {
      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult(data);
        fetchClientData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
        <p className="text-sm text-brand-textSecondary">Verifying secure upload token...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-brand-surface border border-brand-border rounded-brand p-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-brand-textPrimary">Access Denied</h2>
        <p className="text-xs text-brand-textSecondary">{error || "Upload token could not be verified."}</p>
        <Link href="/intake" className="inline-block px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded">
          Go to Intake Form
        </Link>
      </div>
    );
  }

  const checklist: string[] = client.checklist_required || [];
  const missing: string[] = client.missing_items || [];
  const isComplete = missing.length === 0 && checklist.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Portal Header */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
              <Lock className="w-3 h-3" />
              <span>Token-Secured Client Portal (No Login Required)</span>
            </div>
            <h1 className="text-xl font-bold text-brand-textPrimary">
              Upload Onboarding Documents
            </h1>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Client: <strong>{client.contact?.name}</strong> • Entity: {client.business_type} • Service: {client.service_requested}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Lifecycle Status</div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                client.status === "Ready" || client.status === "Meeting Booked" || client.status === "Summary Sent"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {client.status}
            </span>
          </div>
        </div>

        {/* Dynamic Checklist Tracker */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-2">
            <span>Required Checklist ({checklist.length - missing.length} / {checklist.length} received)</span>
            <span className={isComplete ? "text-emerald-600" : "text-amber-600"}>
              {isComplete ? "✓ All Documents Fulfilled" : `${missing.length} Missing Items`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {checklist.map((item) => {
              const isMissing = missing.includes(item);
              return (
                <span
                  key={item}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    isMissing
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {isMissing ? (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  ) : (
                    <FileCheck className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{item}</span>
                  <span className="text-[10px] font-bold uppercase">{isMissing ? "(Missing)" : "(Received)"}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gated Booking Unlock Banner if complete */}
      {isComplete && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-brand flex items-center justify-between shadow-sm">
          <div>
            <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Checklist Complete — Meeting Booking Unlocked!</span>
            </div>
            <p className="text-xs text-emerald-700 mt-0.5">
              All mandatory documentation has been processed. You can now book your preliminary consultation meeting.
            </p>
          </div>
          <Link
            href={`/book/${token}`}
            className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1 shadow"
          >
            <span>Book Meeting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider">
          Upload & OpenAI Vision/Text Extraction
        </h2>

        {/* Quick Upload Test Buttons (Synthetic Documents) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand space-y-2">
          <div className="text-xs font-bold text-slate-700">Quick Test Synthetic Documents:</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                handleQuickSynthetic(
                  "bank_statement",
                  "Barclays Bank UK PLC Statement. Account: 20491823. Period: 2024-01-01 to 2024-12-31. Closing Balance: £42,580.20. Turnover: £620,000.00."
                )
              }
              disabled={uploading}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              + Upload Bank Statement
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSynthetic(
                  "prior_year_accounts",
                  "Apex Trading Ltd Statutory Accounts 2024-12-31. Turnover: £580,000. Net Profit: £74,200. Balance Sheet Total Net Assets: £116,780.20."
                )
              }
              disabled={uploading}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              + Upload Prior Accounts
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSynthetic(
                  "payroll_summary",
                  "P32 Monthly PAYE Summary Month 12. PAYE Reference: 120/AT89123. 5 Employees. Gross Pay: £18,400. Total PAYE & NIC due: £4,250."
                )
              }
              disabled={uploading}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              + Upload Payroll Summary
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSynthetic(
                  "id",
                  "United Kingdom Passport. Surname: Smith. Given Names: John David. Number: 554981203. Expiry: 2031-05-14."
                )
              }
              disabled={uploading}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              + Upload Director ID
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSynthetic(
                  "vat_certificate",
                  "HM Revenue & Customs Certificate of VAT Registration. VAT Reg GB 987 6543 21. Effective Date: 2019-04-01. Return Cycle: Quarterly."
                )
              }
              disabled={uploading}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50"
            >
              + Upload VAT Certificate
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSynthetic(
                  "proof_of_address",
                  "British Gas Business Commercial Utility Bill. Service Address: Suite 4, High Street Business Park, London EC2A 4NE. Bill Date: 2026-08-10. Account: 8820 1934 001."
                )
              }
              disabled={uploading}
              className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 disabled:opacity-50"
            >
              + Upload Proof of Address (Missing Gap Resolver)
            </button>
          </div>
        </div>

        {/* Custom Text / File Input */}
        <form onSubmit={handleFileUpload} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                Document Type Classification
              </label>
              <select
                value={syntheticDocType}
                onChange={(e) => setSyntheticDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-brand-border bg-white"
              >
                {checklist.map((item) => (
                  <option key={item} value={item}>
                    {item} {missing.includes(item) ? "(Missing)" : "(Received)"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
              Document Text Payload / OCR Input
            </label>
            <textarea
              rows={4}
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Paste document text or OCR payload here..."
              required
              className="w-full px-3 py-2 text-xs rounded border border-brand-border font-mono bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2.5 rounded-brand font-bold text-white text-xs shadow flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? "Extracting with OpenAI gpt-4o..." : "Upload & Process with OpenAI"}</span>
          </button>
        </form>

        {/* Real-time Extraction Results */}
        {uploadResult && (
          <div className="mt-4 p-4 rounded-brand bg-slate-900 text-white text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>✓ OpenAI Extraction Succeeded ({uploadResult.extracted?.source})</span>
              <span>Confidence: {(uploadResult.extracted?.confidence * 100).toFixed(0)}%</span>
            </div>
            <div>
              <strong>Classified Doc Type:</strong> {uploadResult.extracted?.doc_type}
            </div>
            <div>
              <strong>Period Covered:</strong> {uploadResult.extracted?.period_covered}
            </div>
            <div>
              <strong>Needs Human Review:</strong> {uploadResult.extracted?.needs_human_review ? "YES (Low Confidence)" : "NO"}
            </div>
            <div>
              <strong>Key Extracted Fields:</strong>
              <pre className="text-blue-300 mt-1 whitespace-pre-wrap">
                {JSON.stringify(uploadResult.extracted?.key_fields, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
