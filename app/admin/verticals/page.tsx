"use client";

import React, { useState, useEffect } from "react";
import { BusinessType, Service, ChecklistConfig, FormFieldDefinition } from "@/lib/types";
import { Briefcase, Plus, Trash2, CheckCircle2, Save, FileText, Layers } from "lucide-react";

export default function AdminVerticalsPage() {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [configs, setConfigs] = useState<ChecklistConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // New item inputs
  const [newTypeName, setNewTypeName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newDocName, setNewDocName] = useState("");

  // Selected config editing state
  const [currentConfig, setCurrentConfig] = useState<ChecklistConfig | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verticals");
      if (res.ok) {
        const data = await res.json();
        setBusinessTypes(data.business_types || []);
        setServices(data.services || []);
        setConfigs(data.checklist_configs || []);
        if (data.checklist_configs?.length > 0) {
          setSelectedConfigId(data.checklist_configs[0].id);
          setCurrentConfig(data.checklist_configs[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load verticals data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectConfig = (cfg: ChecklistConfig) => {
    setSelectedConfigId(cfg.id);
    setCurrentConfig(JSON.parse(JSON.stringify(cfg)));
  };

  const handleAddDocument = () => {
    if (!newDocName.trim() || !currentConfig) return;
    const clean = newDocName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!currentConfig.required_documents.includes(clean)) {
      const updated = {
        ...currentConfig,
        required_documents: [...currentConfig.required_documents, clean],
      };
      setCurrentConfig(updated);
    }
    setNewDocName("");
  };

  const handleRemoveDocument = (doc: string) => {
    if (!currentConfig) return;
    setCurrentConfig({
      ...currentConfig,
      required_documents: currentConfig.required_documents.filter((d) => d !== doc),
    });
  };

  const handleAddField = () => {
    if (!currentConfig) return;
    const newField: FormFieldDefinition = {
      field_id: `custom_${Date.now().toString().slice(-4)}`,
      label: "New Form Question",
      field_type: "text",
      required: true,
      placeholder: "Enter value...",
    };
    setCurrentConfig({
      ...currentConfig,
      required_fields: [...(currentConfig.required_fields || []), newField],
    });
  };

  const handleUpdateField = (index: number, updates: Partial<FormFieldDefinition>) => {
    if (!currentConfig) return;
    const fields = [...(currentConfig.required_fields || [])];
    fields[index] = { ...fields[index], ...updates };
    setCurrentConfig({ ...currentConfig, required_fields: fields });
  };

  const handleRemoveField = (index: number) => {
    if (!currentConfig) return;
    const fields = currentConfig.required_fields.filter((_, i) => i !== index);
    setCurrentConfig({ ...currentConfig, required_fields: fields });
  };

  const handleSaveConfig = async () => {
    if (!currentConfig) return;
    setSaving(true);
    setSavedMessage("");

    try {
      const res = await fetch("/api/admin/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentConfig),
      });
      if (res.ok) {
        setSavedMessage("Checklist & Form schema saved live!");
        fetchData();
        setTimeout(() => setSavedMessage(""), 3000);
      }
    } catch (err) {
      alert("Failed to save checklist configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBusinessType = async () => {
    if (!newTypeName.trim()) return;
    const id = `bt_${newTypeName.toLowerCase().replace(/\s+/g, "_")}`;
    await fetch("/api/admin/verticals?action=add_type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: newTypeName.trim() }),
    });
    setNewTypeName("");
    fetchData();
  };

  const handleCreateService = async () => {
    if (!newServiceName.trim()) return;
    const id = `srv_${newServiceName.toLowerCase().replace(/\s+/g, "_")}`;
    await fetch("/api/admin/verticals?action=add_service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: newServiceName.trim() }),
    });
    setNewServiceName("");
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-textPrimary flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-primary" />
              <span>Business Verticals, Services & Dynamic Checklist Rules</span>
            </h2>
            <p className="text-xs text-brand-textSecondary mt-1">
              Defines dynamic intake questions and document checklists. Enables zero-code adaptation across Accountancy, Legal, or Consulting.
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
        {/* Left Column: Registered Types & Services */}
        <div className="space-y-6">
          {/* Business Types Card */}
          <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-brand-textPrimary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-primary" />
              <span>Legal Entity / Business Types</span>
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {businessTypes.map((b) => (
                <div key={b.id} className="text-xs p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                  {b.name}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-brand-border">
              <input
                type="text"
                placeholder="New type (e.g. Healthcare)..."
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded border border-brand-border"
              />
              <button
                type="button"
                onClick={handleCreateBusinessType}
                className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded"
              >
                Add
              </button>
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-brand-textPrimary flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-secondary" />
              <span>Configured Services</span>
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {services.map((s) => (
                <div key={s.id} className="text-xs p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                  {s.name}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-brand-border">
              <input
                type="text"
                placeholder="New service (e.g. Audit)..."
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded border border-brand-border"
              />
              <button
                type="button"
                onClick={handleCreateService}
                className="px-3 py-1.5 bg-brand-primary text-white text-xs font-bold rounded"
              >
                Add
              </button>
            </div>
          </div>

          {/* Combination Selector */}
          <div className="bg-brand-surface border border-brand-border rounded-brand p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-brand-textPrimary">Select Combination to Edit</h3>
            <div className="space-y-1.5">
              {configs.map((cfg) => (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => handleSelectConfig(cfg)}
                  className={`w-full text-left p-2.5 text-xs rounded border transition ${
                    selectedConfigId === cfg.id
                      ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div>{cfg.business_type_name || cfg.business_type_id} &rarr; {cfg.service_name || cfg.service_id}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{cfg.required_documents.length} docs • {cfg.required_fields?.length || 0} form fields</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Combination Editor */}
        <div className="lg:col-span-2 space-y-6">
          {currentConfig ? (
            <div className="bg-brand-surface border border-brand-border rounded-brand p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <div>
                  <h3 className="text-base font-bold text-brand-textPrimary">
                    Rules for: {currentConfig.business_type_name || currentConfig.business_type_id} + {currentConfig.service_name || currentConfig.service_id}
                  </h3>
                  <p className="text-xs text-brand-textSecondary mt-0.5">
                    Modify required documents and dynamic intake form fields below.
                  </p>
                </div>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="px-4 py-2 bg-brand-primary text-white rounded text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Rules"}</span>
                </button>
              </div>

              {/* Section 1: Required Document Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-2">
                  Required Document Checklist ({currentConfig.required_documents.length} items)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentConfig.required_documents.map((doc) => (
                    <span
                      key={doc}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-300 text-slate-800"
                    >
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(doc)}
                        className="text-slate-400 hover:text-red-600 transition"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add document type (e.g. proof_of_address)..."
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded border border-brand-border"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded"
                  >
                    Add Document
                  </button>
                </div>
              </div>

              {/* Section 2: Dynamic Form Fields */}
              <div className="pt-4 border-t border-brand-border">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase text-brand-textPrimary">
                    Dynamic Form Fields ({currentConfig.required_fields?.length || 0} fields)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question Field</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(currentConfig.required_fields || []).map((field, idx) => (
                    <div
                      key={field.field_id || idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-brand space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 bg-white"
                          placeholder="Field Question / Label"
                        />
                        <select
                          value={field.field_type}
                          onChange={(e) => handleUpdateField(idx, { field_type: e.target.value as any })}
                          className="text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white font-medium"
                        >
                          <option value="text">Text Input</option>
                          <option value="number">Number</option>
                          <option value="select">Dropdown Select</option>
                          <option value="date">Date</option>
                          <option value="email">Email</option>
                          <option value="tel">Phone</option>
                        </select>
                        <label className="text-xs flex items-center gap-1 text-slate-700 font-medium">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                          />
                          <span>Required</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {field.field_type === "select" && (
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Dropdown Options (comma separated)
                          </label>
                          <input
                            type="text"
                            value={field.options ? field.options.join(", ") : ""}
                            onChange={(e) =>
                              handleUpdateField(idx, {
                                options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-brand-surface border border-brand-border rounded-brand">
              Select a vertical combination to configure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
