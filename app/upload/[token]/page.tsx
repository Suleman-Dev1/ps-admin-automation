"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { Upload, FileCheck, AlertTriangle, CheckCircle2, Loader2, Lock, ArrowRight, FileUp, Sparkles, X } from "lucide-react";
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
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File upload input state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (data.client?.missing_items?.length > 0) {
          setSyntheticDocType(data.client.missing_items[0]);
        }
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
    setUploadError(null);
    setUploadResult(null);

    if (!selectedFile && !fileContent.trim()) {
      setUploadError("Please choose a file or enter document text to upload.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("doc_type_hint", syntheticDocType);

    if (selectedFile) {
      formData.append("file", selectedFile);
      formData.append("filename", selectedFile.name);
    } else {
      formData.append("text_content", fileContent);
      formData.append("filename", `${syntheticDocType}.txt`);
    }

    try {
      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult(data);
        setFileContent("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchClientData();
      } else {
        setUploadError(data.error || "Upload could not be processed.");
      }
    } catch (err: any) {
      setUploadError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleQuickSynthetic = async (type: string, content: string) => {
    setUploadError(null);
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
      } else {
        setUploadError(data.error || "Synthetic upload failed");
      }
    } catch (err: any) {
      setUploadError("Upload failed: " + err.message);
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

  const checklist: string[] = client.checklist_required && client.checklist_required.length > 0
    ? client.checklist_required
    : (client.missing_items || []);
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
              Client: <strong>{client.company_name || client.contact?.name}</strong> • Entity: {client.business_type} • Service: {client.service_requested}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Lifecycle Status</div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                client.status === "Ready" || client.status === "Meeting Booked" || client.status === "Summary Sent" || client.status === "ready_for_review"
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
            <span>Required Checklist ({Math.max(0, checklist.length - missing.length)} / {checklist.length} received)</span>
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
                  <span className="capitalize">{item.replace(/_/g, " ")}</span>
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

        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Quick Upload Test Buttons (Synthetic Documents) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick Test Synthetic Documents (Instant Ingestion):</span>
          </div>
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
              + Upload Proof of Address
            </button>
          </div>
        </div>

        {/* Custom File or Text Input Form */}
        <form onSubmit={handleFileUpload} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                Target Checklist Item
              </label>
              <select
                value={syntheticDocType}
                onChange={(e) => setSyntheticDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded border border-brand-border bg-white"
              >
                {checklist.map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, " ")} {missing.includes(item) ? "(Missing)" : "(Received)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                Attach File (PDF, Image, or TXT)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  if (file) setUploadError(null);
                }}
                className="w-full px-2 py-1 text-xs border border-brand-border rounded bg-white"
              />
              {selectedFile && (
                <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1">
                  <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
              Or Paste Document Text / OCR Content
            </label>
            <textarea
              rows={3}
              value={fileContent}
              onChange={(e) => {
                setFileContent(e.target.value);
                if (e.target.value.trim()) setUploadError(null);
              }}
              placeholder="Paste document text or synthetic OCR payload here..."
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
            <span>{uploading ? "Extracting with OpenAI gpt-4o..." : "Upload Document & Process with OpenAI"}</span>
          </button>
        </form>

        {/* Real-time Extraction Results */}
        {uploadResult && (
          <div className="mt-4 p-4 rounded-brand bg-slate-900 text-white text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>✓ OpenAI Extraction Succeeded ({uploadResult.extracted?.source || "OpenAI GPT-4o"})</span>
              <span>Confidence: {((uploadResult.extracted?.confidence || uploadResult.extraction?.confidence_score || 0.95) * 100).toFixed(0)}%</span>
            </div>
            <div>
              <strong>Classified Doc Type:</strong> {uploadResult.extracted?.doc_type || uploadResult.document?.classified_type}
            </div>
            <div>
              <strong>Period Covered:</strong> {uploadResult.extracted?.period_covered || "Current"}
            </div>
            <div>
              <strong>Needs Human Review:</strong> {uploadResult.extracted?.needs_human_review ? "YES (Flagged)" : "NO"}
            </div>
            <div>
              <strong>Key Extracted Fields:</strong>
              <pre className="text-blue-300 mt-1 whitespace-pre-wrap">
                {JSON.stringify(uploadResult.extracted?.key_fields || uploadResult.document?.key_fields || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
