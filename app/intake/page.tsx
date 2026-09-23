"use client";

import React, { useState, useEffect } from "react";
import { BusinessType, Service, ChecklistConfig } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Building, 
  ShieldCheck, 
  HelpCircle, 
  Clock, 
  FileCheck 
} from "lucide-react";
import Link from "next/link";

export default function DynamicIntakePage() {
  const { theme } = useTheme();

  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [configs, setConfigs] = useState<ChecklistConfig[]>([]);

  // Selected state
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [activeConfig, setActiveConfig] = useState<ChecklistConfig | null>(null);

  // Core contact form state
  const [contactName, setContactName] = useState("John David Smith");
  const [contactEmail, setContactEmail] = useState("john.smith@apextrading.co.uk");
  const [contactPhone, setContactPhone] = useState("+44 20 7946 0912");

  // Dynamic fields state
  const [dynamicFormValues, setDynamicFormValues] = useState<Record<string, any>>({
    turnover_band: "£500k - £1m",
    employee_count: 5,
    relevant_date: "2025-12-31",
    existing_provider: "None",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch dynamic verticals and configurations from Admin
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/verticals");
        if (res.ok) {
          const data = await res.json();
          const btypes = data.business_types || [];
          const srvs = data.services || [];
          const cfgs = data.checklist_configs || [];

          setBusinessTypes(btypes);
          setServices(srvs);
          setConfigs(cfgs);

          if (btypes.length > 0) {
            setSelectedType(btypes[0].name);
          }
          if (srvs.length > 0) {
            setSelectedService(srvs[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load intake config:", err);
      }
    }
    loadConfig();
  }, []);

  // Update active checklist and form fields when business_type or service changes
  useEffect(() => {
    if (!selectedType || !selectedService || configs.length === 0) return;

    const matched = configs.find(
      (c) =>
        (c.business_type_name?.toLowerCase() === selectedType.toLowerCase() ||
          c.business_type_id?.toLowerCase().includes(selectedType.toLowerCase())) &&
        (c.service_name?.toLowerCase() === selectedService.toLowerCase() ||
          c.service_id?.toLowerCase().includes(selectedService.toLowerCase()))
    );

    setActiveConfig(matched || configs[0]);
  }, [selectedType, selectedService, configs]);

  // Ensure all dynamic fields from activeConfig have default values in state
  useEffect(() => {
    if (!activeConfig?.required_fields) return;
    setDynamicFormValues((prev) => {
      const next = { ...prev };
      for (const field of activeConfig.required_fields) {
        if (next[field.field_id] === undefined) {
          if (field.field_type === "select" && field.options?.length) {
            next[field.field_id] = field.options[0];
          } else if (field.field_type === "number") {
            next[field.field_id] = field.min ?? 0;
          } else {
            next[field.field_id] = "";
          }
        }
      }
      return next;
    });
  }, [activeConfig]);

  const handleDynamicChange = (fieldId: string, val: any) => {
    setDynamicFormValues((prev) => ({ ...prev, [fieldId]: val }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSubmissionResult(null);

    const payload = {
      company_name: contactName || "Valued Client",
      business_type: selectedType,
      service_requested: selectedService,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      contact: {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
      },
      turnover_band: dynamicFormValues.turnover_band || "Under £100k",
      employee_count: parseInt(dynamicFormValues.employee_count || "0") || 0,
      relevant_date: dynamicFormValues.relevant_date || undefined,
      existing_provider: dynamicFormValues.existing_provider || undefined,
      custom_fields: dynamicFormValues,
      custom_intake_data: dynamicFormValues,
      ...dynamicFormValues,
    };

    try {
      const res = await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult(data);
      } else {
        const errText = data.error || "Submission could not be completed. Please check your inputs.";
        setErrorMessage(errText);
      }
    } catch (err: any) {
      setErrorMessage("Network error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clientData = submissionResult?.client || (submissionResult ? {
    id: submissionResult.client_id,
    upload_token: submissionResult.upload_token,
    status: "Awaiting Documents",
    checklist_required: submissionResult.missing_items || [],
  } : null);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Building className="w-3.5 h-3.5" /> Client Onboarding Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Client Intake &amp; Dynamic Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome to {theme.firm_name}. Complete this form to generate your customized onboarding requirements.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-slate-300 shrink-0">
          <Clock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Estimated time: <strong className="text-white">2 minutes</strong></span>
        </div>
      </div>

      {submissionResult ? (
        /* Success Framed Card */
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white">Intake Record Created Successfully!</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your profile has been registered, synced with our CRM, and your tailored onboarding checklist has been dynamically provisioned.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Client Reference ID</div>
              <div className="font-mono text-sm font-bold text-white mt-1">{clientData?.id}</div>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">CRM Sync Status</div>
              <div className="text-sm font-bold text-blue-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Connected</span>
              </div>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Lifecycle Status</div>
              <div className="text-sm font-bold text-amber-400 mt-1">Awaiting Documents</div>
            </div>
          </div>

          <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl max-w-2xl mx-auto text-left">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Required Documents Checklist ({clientData?.checklist_required?.length || 0} items)
            </div>
            <div className="flex flex-wrap gap-2">
              {(clientData?.checklist_required || []).map((doc: string) => (
                <span key={doc} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono font-medium text-slate-200 capitalize">
                  {doc.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/upload/${clientData?.upload_token}`}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-[0_0_20px_rgba(37,99,235,0.4)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-2 transition hover:scale-105"
            >
              <span>Proceed to Tokenized Upload Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/staff/clients/${clientData?.id}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition"
            >
              View in Staff CRM
            </Link>
          </div>
        </div>
      ) : (
        /* Framed 2-Column Responsive Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context, Steps & Dynamic Checklist Preview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step Progress Tracker */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Onboarding Steps
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Entity &amp; Service Selection</div>
                    <p className="text-[11px] text-slate-400">Specify your business structure to tailor checklist</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">Financial &amp; Contact Details</div>
                    <p className="text-[11px] text-slate-500">Provide company profile and director contact</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300">Tokenized Document Upload</div>
                    <p className="text-[11px] text-slate-500">Submit files with automated OpenAI verification</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Checklist Preview Box */}
            {activeConfig && (
              <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/50 rounded-3xl p-6 space-y-3">
                <div className="font-bold text-xs text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Required Documents Checklist Preview</span>
                </div>
                <p className="text-xs text-blue-200">
                  Based on selecting <strong>{selectedType}</strong> for <strong>{selectedService}</strong>, the following {activeConfig.required_documents?.length || 0} documents will be requested:
                </p>
                <div className="space-y-2 pt-1">
                  {(activeConfig.required_documents || []).map((doc) => (
                    <div key={doc} className="flex items-center gap-2 text-xs bg-slate-900/80 border border-blue-800/40 rounded-xl px-3.5 py-2 text-blue-100 font-medium capitalize">
                      <FileCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{doc.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Guarantee */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Administrative Automation Only:</strong>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  This portal handles factual intake collation only. No regulated tax, accounting, or legal advice is given.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Required Information Incomplete</p>
                  <p className="text-red-300 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Entity & Service */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  Step 1: Entity &amp; Engagement
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Legal Business Structure *
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      {businessTypes.map((b) => (
                        <option key={b.id} value={b.name} className="bg-slate-900 text-white">
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Service Requested *
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.name} className="bg-slate-900 text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  Step 2: Primary Contact
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Dynamic Form Questions */}
              {activeConfig && activeConfig.required_fields && activeConfig.required_fields.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                    Step 3: Entity &amp; Financial Schema Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeConfig.required_fields.map((field) => (
                      <div key={field.field_id}>
                        <label className="block text-xs font-bold text-slate-200 mb-1.5">
                          {field.label} {field.required ? "*" : ""}
                        </label>

                        {field.field_type === "select" ? (
                          <select
                            value={dynamicFormValues[field.field_id] || (field.options?.[0] || "")}
                            onChange={(e) => handleDynamicChange(field.field_id, e.target.value)}
                            required={field.required}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          >
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt} className="bg-slate-900 text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
                            value={dynamicFormValues[field.field_id] ?? ""}
                            onChange={(e) => handleDynamicChange(field.field_id, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder || ""}
                            min={field.min}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-6 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-sm shadow-[0_0_25px_rgba(37,99,235,0.4)] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  <span>{submitting ? "Processing Administrative Intake..." : "Submit Client Intake & Generate Checklist"}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
