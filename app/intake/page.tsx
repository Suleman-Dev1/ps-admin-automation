"use client";

import React, { useState, useEffect } from "react";
import { BusinessType, Service, ChecklistConfig } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";
import { FileText, CheckCircle2, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
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
        window.scrollTo({ top: 150, behavior: "smooth" });
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-textPrimary">
          Client Onboarding & Intake
        </h1>
        <p className="text-sm text-brand-textSecondary max-w-lg mx-auto">
          Welcome to {theme.firm_name}. Please specify your entity structure and service to generate your tailored onboarding checklist.
        </p>
      </div>

      {/* Dynamic Intake Card */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-brand bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Required Information Missing</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {submissionResult ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Intake Record Created Successfully!</h2>
              <p className="text-sm text-slate-600">
                A CRM record has been provisioned and your customized checklist has been dynamically assigned.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand max-w-md mx-auto text-left text-xs space-y-2">
              <div>
                <strong>Client Reference ID:</strong> <code className="font-mono">{clientData?.id}</code>
              </div>
              <div>
                <strong>CRM Sync Status:</strong>{" "}
                <span className="capitalize font-semibold text-blue-700">
                  {submissionResult.crm_status?.provider || "Connected"} (Record: {submissionResult.crm_status?.recordId || clientData?.id})
                </span>
              </div>
              <div>
                <strong>Initial Lifecycle Status:</strong>{" "}
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  {clientData?.status || "Awaiting Documents"}
                </span>
              </div>
              <div>
                <strong>Required Checklist ({clientData?.checklist_required?.length || 0} items):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(clientData?.checklist_required || []).map((doc: string) => (
                    <span key={doc} className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/upload/${clientData?.upload_token}`}
                className="w-full sm:w-auto px-6 py-3 rounded-brand text-white font-bold text-sm shadow flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
              >
                <span>Proceed to Tokenized Upload Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/staff/clients/${clientData?.id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-brand bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
              >
                View in Staff CRM
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Legal Entity & Service Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-brand-border">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                  1. Legal Business Structure *
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-brand-border bg-white text-brand-textPrimary"
                >
                  {businessTypes.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1.5">
                  2. Service Requested *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-brand-border bg-white text-brand-textPrimary"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checklist Preview Box */}
            {activeConfig && (
              <div className="p-4 rounded-brand bg-blue-50/60 border border-blue-200 text-xs">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dynamically Provisioned Checklist for {selectedType} &rarr; {selectedService}:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeConfig.required_documents.map((doc) => (
                    <span key={doc} className="px-2.5 py-1 rounded bg-white border border-blue-200 font-mono text-blue-950 font-medium">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                Contact Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-textPrimary mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-textPrimary mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-textPrimary mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    required
                    className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Dynamic Form Questions (Fetched from Admin checklist_config) */}
            {activeConfig && activeConfig.required_fields && activeConfig.required_fields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-brand-border">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">
                  Entity & Financial Details (Dynamic Schema)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeConfig.required_fields.map((field) => (
                    <div key={field.field_id}>
                      <label className="block text-xs font-medium text-brand-textPrimary mb-1">
                        {field.label} {field.required ? "*" : ""}
                      </label>

                      {field.field_type === "select" ? (
                        <select
                          value={dynamicFormValues[field.field_id] || (field.options?.[0] || "")}
                          onChange={(e) => handleDynamicChange(field.field_id, e.target.value)}
                          required={field.required}
                          className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                        >
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
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
                          className="w-full px-3 py-2 text-sm rounded border border-brand-border bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-brand-border">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-brand font-bold text-white text-base shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                <span>{submitting ? "Processing Administrative Intake..." : "Submit Client Intake & Generate Checklist"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
