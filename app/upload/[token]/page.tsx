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
  Calendar,
  Bell,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function TokenizedUploadPage() {
  const params = useParams();
  const token = params?.token as string;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [staffSummary, setStaffSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  const [removingDoc, setRemovingDoc] = useState<string | null>(null);

  // File upload input & image preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target document dropdown
  const [syntheticDocType, setSyntheticDocType] = useState("bank_statement");
  const [fileContent, setFileContent] = useState("");
  const [showDemoTools, setShowDemoTools] = useState(false);

  const fetchClientData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/upload/${token}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setReminders(data.reminders || []);
        setStaffSummary(data.staff_summary || null);
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

  // Handle file selection and generate preview for photos/images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setUploadError(null);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    } else {
      setFilePreview(null);
    }
  };

  // Standard File / Photo Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadResult(null);
    setDemoNotice(null);

    if (!selectedFile && !fileContent.trim()) {
      setUploadError("Please attach a document file/photo or enter document text to upload.");
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
        if (data.staff_summary) setStaffSummary(data.staff_summary);
        setFileContent("");
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setDemoNotice(`Successfully uploaded & verified "${syntheticDocType.replace(/_/g, " ")}" via OpenAI GPT-4o.`);
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

  // Cancel / Remove / Replace Uploaded Document
  const handleRemoveDocument = async (docType: string) => {
    setRemovingDoc(docType);
    setUploadError(null);
    setDemoNotice(null);
    try {
      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_document", doc_type: docType }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDemoNotice(
          `Document "${docType.replace(/_/g, " ")}" has been removed. It is now marked MISSING in RED, and meeting booking is LOCKED again until replaced.`
        );
        setSyntheticDocType(docType);
        fetchClientData();
      } else {
        setUploadError(data.error || "Failed to remove document");
      }
    } catch (err: any) {
      setUploadError("Failed to remove document: " + err.message);
    } finally {
      setRemovingDoc(null);
    }
  };

  // Populate form with sample text (does NOT upload or verify automatically)
  const handleFillSample = (type: string, content: string) => {
    setSyntheticDocType(type);
    setFileContent(content);
    setUploadError(null);
    setDemoNotice(
      `Sample text for "${type.replace(/_/g, " ")}" has been pasted into the form below. Review it and click "Upload Document & Process with OpenAI" (or attach a real photo/file) to process.`
    );
  };

  // Automated Test Step 1: Upload partial documents & deliberately leave 1 missing
  const handleSyntheticPartial = async () => {
    setUploadError(null);
    setUploading(true);
    setUploadResult(null);
    setDemoNotice(null);

    try {
      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "synthetic_partial" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult(data);
        setDemoNotice(
          `System identified deliberately missing item: "${data.deliberately_missing?.replace(/_/g, " ")}". A real reminder was generated and sent to ${data.client?.contact?.email}. Meeting booking remains strictly LOCKED in RED.`
        );
        fetchClientData();
      } else {
        setUploadError(data.error || "Partial synthetic upload failed.");
      }
    } catch (err: any) {
      setUploadError("Partial upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Automated Test Step 2: Upload the missing item to complete the checklist
  const handleSyntheticComplete = async () => {
    setUploadError(null);
    setUploading(true);
    setUploadResult(null);
    setDemoNotice(null);

    try {
      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "synthetic_complete" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadResult(data);
        if (data.staff_summary) setStaffSummary(data.staff_summary);
        setDemoNotice(
          "Checklist is now 100% complete! OpenAI GPT-4o prepared the staff summary, updated status to 'Ready', and unlocked Cal.com meeting booking."
        );
        fetchClientData();
      } else {
        setUploadError(data.error || "Completion upload failed.");
      }
    } catch (err: any) {
      setUploadError("Completion upload failed: " + err.message);
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
  const latestReminder = reminders.length > 0 ? reminders[0] : (uploadResult?.reminder || uploadResult?.reminder_dispatched);

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
            Client: <strong>{client.company_name || client.contact?.name}</strong> &bull; Legal Entity: {client.business_type} &bull; Service: {client.service_requested}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Onboarding Progress</div>
            <div className="text-sm font-bold text-slate-900">{percentComplete}% Complete ({receivedCount}/{checklist.length})</div>
          </div>
          <div 
            className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-xs shadow-xs" 
            style={{ 
              borderColor: isComplete ? "#10b981" : "#ef4444",
              color: isComplete ? "#047857" : "#b91c1c",
              backgroundColor: isComplete ? "#ecfdf5" : "#fef2f2"
            }}
          >
            {percentComplete}%
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {demoNotice && (
        <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded-xl text-blue-950 text-xs flex items-start gap-3 shadow-xs animate-in fade-in">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
            ℹ️
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Status Update</div>
            <p className="mt-0.5 text-blue-900 leading-relaxed">{demoNotice}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setDemoNotice(null)} 
            className="text-blue-500 hover:text-blue-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =================================================================== */}
        {/* Left Column (5 Cols): Client Profile, Checklist & Gated Meeting Card */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Client Info Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Client Profile</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isComplete ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                {client.status || (isComplete ? "Ready" : "Awaiting Documents")}
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
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Required Documents Checklist
                </h3>
                <p className="text-[11px] text-slate-400">
                  {receivedCount} of {checklist.length} verified
                </p>
              </div>
              <span className={`text-xs font-bold ${isComplete ? "text-emerald-600" : "text-red-600"}`}>
                {isComplete ? "✓ All Received" : `${missing.length} Missing`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${percentComplete}%`, 
                  backgroundColor: isComplete ? "#10b981" : "#ef4444" 
                }}
              />
            </div>

            {/* Checklist Items List (TURNS RED IF MISSING, HAS CROSS (X) TO CANCEL / REPLACE) */}
            <div className="space-y-3">
              {checklist.map((item) => {
                const isMissing = missing.includes(item);
                const isRemoving = removingDoc === item;

                return (
                  <div
                    key={item}
                    className={`p-3.5 rounded-xl border-2 transition shadow-xs ${
                      isMissing
                        ? "border-red-500 bg-red-50/90 text-red-950"
                        : "border-emerald-500 bg-emerald-50/90 text-emerald-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Status Icon + Document Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isMissing 
                              ? "bg-red-100 border-red-300 text-red-600" 
                              : "bg-emerald-100 border-emerald-300 text-emerald-600"
                          }`}
                        >
                          {isMissing ? (
                            <AlertTriangle className="w-4 h-4 animate-pulse" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs capitalize truncate">
                            {item.replace(/_/g, " ")}
                          </div>
                          <div className={`text-[10px] font-medium ${isMissing ? "text-red-700" : "text-emerald-700"}`}>
                            {isMissing ? "❌ Missing — Upload required" : "✓ Uploaded & Verified by OpenAI"}
                          </div>
                        </div>
                      </div>

                      {/* Right Action: Badges & Cross Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span 
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs ${
                            isMissing
                              ? "bg-red-600 text-white"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {isMissing ? "MISSING" : "VERIFIED"}
                        </span>

                        {/* Cross Button (X) to Cancel / Replace Uploaded Document */}
                        {!isMissing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(item)}
                            disabled={isRemoving}
                            title="Cancel or replace this document"
                            className="px-2 py-1 rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-100 hover:text-red-800 transition text-[10px] flex items-center gap-1 font-bold shadow-2xs group disabled:opacity-50"
                          >
                            {isRemoving ? (
                              <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition" />
                            )}
                            <span>Cancel / Replace</span>
                          </button>
                        )}

                        {/* Quick Select Button if Missing */}
                        {isMissing && (
                          <button
                            type="button"
                            onClick={() => {
                              setSyntheticDocType(item);
                              if (fileInputRef.current) fileInputRef.current.click();
                            }}
                            title="Select and attach file for this document"
                            className="px-2 py-1 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 transition text-[10px] flex items-center gap-1 font-bold shadow-2xs"
                          >
                            <Upload className="w-3 h-3 text-blue-600" />
                            <span>Upload File</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gated Cal.com Meeting Status Box (STRICTLY LOCKED IF ANY ITEM IS MISSING) */}
          <div 
            className={`p-6 rounded-2xl border-2 shadow-xs transition space-y-3.5 ${
              isComplete
                ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                : "border-red-400 bg-red-50/80 text-red-950"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 font-bold ${
                  isComplete ? "bg-emerald-600" : "bg-red-600"
                }`}
              >
                {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  {isComplete ? "Meeting Booking Unlocked!" : "Meeting Booking Gated & Locked"}
                </h4>
                <p className={`text-[11px] font-bold ${isComplete ? "text-emerald-700" : "text-red-700"}`}>
                  {isComplete
                    ? `All ${checklist.length} required documents verified`
                    : `Cannot proceed — ${missing.length} document(s) missing`}
                </p>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isComplete ? "text-emerald-800" : "text-red-800"}`}>
              {isComplete
                ? "All mandatory documents have been classified and verified by OpenAI GPT-4o. Staff summary is ready. You can now schedule your discovery consultation."
                : `Meeting booking is strictly disabled until all ${checklist.length} documents are uploaded and verified. Our professional staff cannot conduct discovery consultations without a complete financial file.`}
            </p>

            {/* Action Button: Disabled if missing, Active if complete */}
            {isComplete ? (
              <Link
                href={`/book/${token}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase shadow-md transition transform hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Open Cal.com Meeting Scheduler Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-xl bg-red-100 border-2 border-red-300 text-red-700 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-2xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Booking Blocked — Upload Missing Items First</span>
              </button>
            )}

            {!isComplete && (
              <div className="text-[11px] text-red-700 bg-white/80 p-3 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Meeting calendar will automatically unlock in green as soon as all missing items turn verified.</span>
              </div>
            )}
          </div>

          {/* Real Reminder Sent Notification Banner */}
          {latestReminder && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Real Reminder Generated & Dispatched</span>
              </div>
              <div className="text-[11px] text-amber-800 space-y-1">
                <div>Subject: <strong>&quot;{latestReminder.subject}&quot;</strong></div>
                <div>Recipient: <span className="font-mono">{latestReminder.recipient_email}</span></div>
                <div>Status: <span className="font-bold uppercase text-emerald-700">{latestReminder.status || "LOGGED"}</span> &bull; Sent: {new Date(latestReminder.sent_at || Date.now()).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {/* Compliance Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Administrative Verification:</strong> Document classification is factual extraction only. No professional tax or legal advice is given.
            </p>
          </div>

        </div>

        {/* =================================================================== */}
        {/* Right Column (7 Cols): Real File Upload Form & Previews */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Real File & Photo Upload Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Document File or Photo</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">OpenAI GPT-4o Vision & OCR</span>
            </div>

            {uploadError && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Custom File or Photo Upload Form */}
            <form onSubmit={handleFileUpload} className="space-y-5">
              
              {/* Target Document Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  1. Select Target Document To Upload *
                </label>
                <select
                  value={syntheticDocType}
                  onChange={(e) => setSyntheticDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-blue-500 transition font-medium"
                >
                  {checklist.map((item) => (
                    <option key={item} value={item}>
                      {item.replace(/_/g, " ")} &bull; {missing.includes(item) ? "❌ MISSING" : "✓ ALREADY VERIFIED"}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Choose which required checklist item you are uploading a document for.
                </p>
              </div>

              {/* Real File & Picture Attachment Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  2. Attach Document Photo or File (PNG, JPG, PDF, TXT) *
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="space-y-3">
                      {filePreview ? (
                        <div className="relative inline-block">
                          <img 
                            src={filePreview} 
                            alt="Document Preview" 
                            className="max-h-48 max-w-full rounded-xl border border-slate-200 shadow-sm mx-auto object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setFilePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        Click or drag to change selected file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        Click to take a photo or browse your computer files
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Supports high-resolution camera photos (PNG, JPG, HEIC), PDF statements, and text documents
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Or Paste OCR Text Payload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Or Paste Document Text / OCR Payload (Optional)
                </label>
                <textarea
                  rows={2}
                  value={fileContent}
                  onChange={(e) => {
                    setFileContent(e.target.value);
                    if (e.target.value.trim()) setUploadError(null);
                  }}
                  placeholder="Paste OCR text payload or synthetic bank figures here..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono bg-slate-50/50 text-slate-900 focus:bg-white transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || (!selectedFile && !fileContent.trim())}
                className="w-full py-3.5 rounded-xl font-bold text-white text-xs shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 hover:opacity-95"
                style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploading ? "Extracting with OpenAI gpt-4o..." : "Upload Document & Process with OpenAI"}</span>
              </button>
            </form>

            {/* Real-time Extraction Results Card */}
            {uploadResult && (
              <div className="p-4 rounded-xl bg-slate-900 text-white text-xs font-mono space-y-2.5 shadow-sm">
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

            {/* Staff Summary Display (Appears when checklist is complete) */}
            {staffSummary && (
              <div className="p-5 bg-slate-900 text-white rounded-2xl border-2 border-emerald-500 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="font-bold text-xs text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>OpenAI GPT-4o Pre-Meeting Staff Briefing (Automated Output)</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
                    Ready for Staff
                  </span>
                </div>

                <div className="text-xs space-y-3">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">1. Factual Business Profile:</span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed">{staffSummary.business_profile}</p>
                  </div>

                  {staffSummary.key_figures_extracted && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">2. Extracted Financial Figures:</span>
                      <pre className="text-[10px] text-blue-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 mt-1 whitespace-pre-wrap font-mono">
                        {JSON.stringify(staffSummary.key_figures_extracted, null, 2)}
                      </pre>
                    </div>
                  )}

                  {staffSummary.open_questions && staffSummary.open_questions.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">3. Suggested Advisor Discussion Points:</span>
                      <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1 mt-1">
                        {staffSummary.open_questions.map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic">
                    <strong>Statutory Disclaimer:</strong> {staffSummary.advice_disclaimer}
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible / Distinct Developer & Demo Tools Section */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDemoTools(!showDemoTools)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between w-full py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>🧪 Demo Simulation Shortcuts (For Instant Testing)</span>
                </span>
                <span className="text-[11px] text-blue-600 underline">
                  {showDemoTools ? "Hide Demo Shortcuts ▲" : "Show Demo Shortcuts ▼"}
                </span>
              </button>

              {showDemoTools && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                  <p className="text-[11px] text-slate-500">
                    Use these buttons to quickly simulate document uploads without needing actual file attachments:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleSyntheticPartial}
                      disabled={uploading}
                      className="p-3 rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-50 text-left transition shadow-2xs text-xs font-bold"
                    >
                      <div>⚡ 1-Click Partial Upload (Leave 1 Missing)</div>
                      <div className="text-[10px] text-amber-700 font-normal mt-0.5">
                        Uploads synthetic docs and leaves 1 deliberately missing to test RED gate.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyntheticComplete}
                      disabled={uploading}
                      className="p-3 rounded-xl bg-white border border-emerald-300 text-emerald-950 hover:bg-emerald-50 text-left transition shadow-2xs text-xs font-bold"
                    >
                      <div>⚡ 1-Click Complete Checklist</div>
                      <div className="text-[10px] text-emerald-700 font-normal mt-0.5">
                        Uploads missing item, prepares staff summary, and unlocks Cal.com.
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-slate-600 mb-2">
                      Click to paste sample text into the upload form below (does not upload automatically):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleFillSample(
                            "bank_statement",
                            "Barclays Bank Statement. Account: 20491823. Period: 2024-01-01 to 2024-12-31. Closing Balance: £42,580.20. Turnover: £620,000.00."
                          )
                        }
                        className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-medium rounded-lg hover:bg-slate-100 transition shadow-2xs"
                      >
                        📝 Paste Sample Bank Statement
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFillSample(
                            "prior_year_accounts",
                            "Apex Trading Ltd Accounts 2024. Turnover: £580,000. Net Profit: £74,200."
                          )
                        }
                        className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-medium rounded-lg hover:bg-slate-100 transition shadow-2xs"
                      >
                        📝 Paste Sample Accounts
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFillSample(
                            "payroll_summary",
                            "P32 PAYE Summary. PAYE Ref: 120/AT89123. 5 Employees. Gross Pay: £18,400."
                          )
                        }
                        className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-medium rounded-lg hover:bg-slate-100 transition shadow-2xs"
                      >
                        📝 Paste Sample Payroll
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFillSample(
                            "id",
                            "UK Passport. Surname: Smith. Given: John David. No: 554981203."
                          )
                        }
                        className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-medium rounded-lg hover:bg-slate-100 transition shadow-2xs"
                      >
                        📝 Paste Sample ID
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFillSample(
                            "proof_of_address",
                            "British Gas Commercial Utility Bill. Suite 4, High Street Business Park, London EC2A 4NE."
                          )
                        }
                        className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 text-[11px] font-medium rounded-lg hover:bg-slate-100 transition shadow-2xs"
                      >
                        📝 Paste Sample Proof of Address
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
