"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Upload, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  X, 
  FileText, 
  ShieldCheck, 
  Calendar 
} from "lucide-react";
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
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-xs text-slate-500 font-semibold">Verifying tokenized upload session...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white border border-red-200 rounded-2xl p-8 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-xs text-slate-600">{error || "Upload token could not be verified."}</p>
        <Link href="/intake" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow">
          Go to Intake Form
        </Link>
      </div>
    );
  }

  const checklist: string[] = client.checklist_required && client.checklist_required.length > 0
    ? client.checklist_required
    : (client.missing_items || []);
  const missing: string[] = client.missing_items || [];
  const receivedCount = Math.max(0, checklist.length - missing.length);
  const percentComplete = checklist.length > 0 ? Math.round((receivedCount / checklist.length) * 100) : 100;
  const isComplete = missing.length === 0 && checklist.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <Lock className="w-3.5 h-3.5" /> Token-Secured Client Portal (No Login Required)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Document Upload & Verification Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Client: <strong>{client.company_name || client.contact?.name}</strong> • Legal Entity: {client.business_type} • Service: {client.service_requested}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Onboarding Progress</div>
            <div className="text-sm font-bold text-slate-900">{percentComplete}% Complete ({receivedCount}/{checklist.length})</div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center font-bold text-xs" style={{ borderColor: isComplete ? "#10b981" : "var(--brand-primary, #1e3a8a)" }}>
            {percentComplete}%
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Client Profile & Live Checklist Tracker */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Client Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Profile</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isComplete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {client.status || "Awaiting Documents"}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">{client.company_name || client.contact?.name}</div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Email: <span className="font-mono text-slate-800">{client.contact?.email}</span></div>
              <div>Engagement: <span className="font-semibold text-slate-800">{client.service_requested}</span></div>
              <div>Reference ID: <span className="font-mono text-slate-800">{client.id}</span></div>
            </div>
          </div>

          {/* Checklist Progress Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Mandatory Documents Checklist ({receivedCount} / {checklist.length})
              </h3>
              <span className={`text-xs font-bold ${isComplete ? "text-emerald-600" : "text-amber-600"}`}>
                {isComplete ? "✓ All Received" : `${missing.length} Missing`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${percentComplete}%`, 
                  backgroundColor: isComplete ? "#10b981" : "var(--brand-primary, #1e3a8a)" 
                }}
              />
            </div>

            {/* Checklist Items List */}
            <div className="space-y-2">
              {checklist.map((item) => {
                const isMissing = missing.includes(item);
                return (
                  <div
                    key={item}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                      isMissing
                        ? "bg-red-50/60 border-red-200 text-red-900"
                        : "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium capitalize">
                      {isMissing ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>{item.replace(/_/g, " ")}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/80 border border-current">
                      {isMissing ? "Missing" : "Verified"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gated Cal.com Meeting Status Box */}
          <div className={`p-5 rounded-2xl border transition ${isComplete ? "bg-emerald-50 border-emerald-300" : "bg-amber-50/70 border-amber-200"}`}>
            <div className="flex items-center gap-2 mb-1.5">
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <Lock className="w-5 h-5 text-amber-600" />
              )}
              <h4 className="text-sm font-bold text-slate-900">
                {isComplete ? "Meeting Booking Unlocked!" : "Meeting Booking Gated"}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {isComplete
                ? "All required documents are verified. You are eligible to book your discovery consultation with our senior advisory team."
                : `Scheduling is locked until all ${checklist.length} mandatory documents are uploaded and verified by OpenAI.`}
            </p>
            {isComplete ? (
              <Link
                href={`/book/${token}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Open Cal.com Meeting Scheduler</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="text-[11px] text-amber-800 font-medium">
                Upload remaining {missing.length} documents on the right to unlock calendar.
              </div>
            )}
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Administrative Verification:</strong> Document classification is factual extraction only. No professional tax or legal advice is given.
            </p>
          </div>

        </div>

        {/* Right Column: Upload Box, Synthetic Testing & Live OpenAI Results */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload & OpenAI Multimodal Extraction</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Engine: OpenAI GPT-4o</span>
            </div>

            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Quick Synthetic Upload Testing Buttons */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant Ingestion Shortcuts (1-Click Test Documents):</span>
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
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 transition shadow-2xs"
                >
                  + Bank Statement
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
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 transition shadow-2xs"
                >
                  + Prior Accounts
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
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 transition shadow-2xs"
                >
                  + Payroll Summary
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
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 transition shadow-2xs"
                >
                  + Director ID
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
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium hover:bg-slate-100 disabled:opacity-50 transition shadow-2xs"
                >
                  + VAT Certificate
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
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 disabled:opacity-50 transition shadow-2xs"
                >
                  + Proof of Address
                </button>
              </div>
            </div>

            {/* Custom Upload Form */}
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Checklist Item
                  </label>
                  <select
                    value={syntheticDocType}
                    onChange={(e) => setSyntheticDocType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white transition"
                  >
                    {checklist.map((item) => (
                      <option key={item} value={item}>
                        {item.replace(/_/g, " ")} {missing.includes(item) ? "(Missing)" : "(Received)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attach File (PDF, Image, TXT)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      if (file) setUploadError(null);
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-700"
                  />
                  {selectedFile && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 mt-1 px-1">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Paste Document Text / OCR Payload
                </label>
                <textarea
                  rows={3}
                  value={fileContent}
                  onChange={(e) => {
                    setFileContent(e.target.value);
                    if (e.target.value.trim()) setUploadError(null);
                  }}
                  placeholder="Paste document text or synthetic OCR payload here..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono bg-slate-50/50 text-slate-900 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-xl font-bold text-white text-xs shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploading ? "Extracting with OpenAI gpt-4o..." : "Upload Document & Process with OpenAI"}</span>
              </button>
            </form>

            {/* Real-time Extraction Results Card */}
            {uploadResult && (
              <div className="p-4 rounded-xl bg-slate-900 text-white text-xs font-mono space-y-2.5">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span>✓ OpenAI Extraction Succeeded ({uploadResult.extracted?.source || "OpenAI GPT-4o"})</span>
                  <span>Confidence: {((uploadResult.extracted?.confidence || uploadResult.extraction?.confidence_score || 0.95) * 100).toFixed(0)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Classified Doc Type:</span>
                    <div className="text-white font-bold">{uploadResult.extracted?.doc_type || uploadResult.document?.classified_type}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Needs Review:</span>
                    <div className={uploadResult.extracted?.needs_human_review ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                      {uploadResult.extracted?.needs_human_review ? "YES (Flagged)" : "NO"}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Key Extracted Fields:</span>
                  <pre className="text-blue-300 mt-1 p-2 bg-slate-950 rounded border border-slate-800 whitespace-pre-wrap text-[10px]">
                    {JSON.stringify(uploadResult.extracted?.key_fields || uploadResult.document?.key_fields || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
