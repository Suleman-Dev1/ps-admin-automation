import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import {
  ThemeSettings,
  BusinessType,
  Service,
  ChecklistConfig,
  EmailTemplate,
  ReminderSchedule,
  AIPromptSettings,
  StaffUser,
  ClientRecord,
  ExtractedDocument,
  ReminderSentRecord,
  StaffSummary,
} from "./types";

// Environment settings
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_KEY &&
  !SUPABASE_URL.includes("placeholder") &&
  !SUPABASE_KEY.includes("placeholder")
);

const supabase = isSupabaseConfigured
  ? createSupabaseClient(SUPABASE_URL!, SUPABASE_KEY!)
  : null;

// File-backed Local Store fallback for instantaneous zero-setup local dev
const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "local_db.json");

interface LocalDatabaseState {
  theme_settings: ThemeSettings;
  business_types: BusinessType[];
  services: Service[];
  checklist_config: ChecklistConfig[];
  email_templates: EmailTemplate[];
  reminder_schedule: ReminderSchedule;
  ai_prompt_settings: AIPromptSettings;
  staff_users: StaffUser[];
  clients: ClientRecord[];
  documents: ExtractedDocument[];
  reminders_sent: ReminderSentRecord[];
  staff_summaries: StaffSummary[];
}

const DEFAULT_STATE: LocalDatabaseState = {
  theme_settings: {
    firm_name: "Apex Professional Advisory",
    tagline: "Automated Administrative Onboarding & Verification",
    logo_url: "",
    primary_color: "#1e3a8a",
    secondary_color: "#0284c7",
    accent_color: "#f59e0b",
    background_color: "#f8fafc",
    surface_color: "#ffffff",
    border_color: "#e2e8f0",
    text_primary: "#0f172a",
    text_secondary: "#475569",
    font_family: "'Inter', sans-serif",
    border_radius: "8px",
    updated_at: new Date().toISOString(),
  },
  business_types: [
    { id: "bt_ltd", name: "Ltd", description: "Private Limited Company incorporated in the UK" },
    { id: "bt_sole_trader", name: "Sole Trader", description: "Self-employed individual" },
    { id: "bt_partnership", name: "Partnership", description: "Traditional or limited liability partnership" },
    { id: "bt_law_firm", name: "Law Firm", description: "Legal entity requiring conveyancing / transaction onboarding" }
  ],
  services: [
    { id: "srv_year_end", name: "Year-end accounts", description: "Statutory year-end accounts and corporate tax filing" },
    { id: "srv_vat", name: "VAT", description: "Quarterly VAT reporting and return submissions" },
    { id: "srv_payroll", name: "Payroll", description: "Monthly payroll, RTI, and PAYE filings" },
    { id: "srv_self_assessment", name: "Self Assessment", description: "Personal director and self-employed tax return" },
    { id: "srv_conveyancing", name: "Conveyancing", description: "Commercial and residential property transaction onboarding" }
  ],
  checklist_config: [
    {
      id: "cfg_ltd_year_end",
      business_type_id: "bt_ltd",
      service_id: "srv_year_end",
      business_type_name: "Ltd",
      service_name: "Year-end accounts",
      required_documents: [
        "bank_statement",
        "prior_year_accounts",
        "payroll_summary",
        "id",
        "proof_of_address",
        "vat_certificate"
      ],
      required_fields: [
        {
          field_id: "turnover_band",
          label: "Annual Turnover Band",
          field_type: "select",
          options: ["Under £100k", "£100k - £250k", "£250k - £500k", "£500k - £1m", "£1m - £5m", "£5m+"],
          required: true
        },
        {
          field_id: "employee_count",
          label: "Number of Employees",
          field_type: "number",
          required: true,
          min: 0
        },
        {
          field_id: "relevant_date",
          label: "Financial Year-End Date",
          field_type: "date",
          required: false
        },
        {
          field_id: "existing_provider",
          label: "Previous Accountant",
          field_type: "text",
          required: false,
          placeholder: "e.g. Previous Firm Ltd or None"
        }
      ]
    },
    {
      id: "cfg_sole_trader_self_assessment",
      business_type_id: "bt_sole_trader",
      service_id: "srv_self_assessment",
      business_type_name: "Sole Trader",
      service_name: "Self Assessment",
      required_documents: ["bank_statement", "id", "proof_of_address", "expense_records"],
      required_fields: [
        {
          field_id: "turnover_band",
          label: "Estimated Annual Revenue",
          field_type: "select",
          options: ["Under £50k", "£50k - £100k", "£100k - £250k", "£250k+"],
          required: true
        },
        {
          field_id: "utr_number",
          label: "Unique Taxpayer Reference (UTR)",
          field_type: "text",
          required: false,
          placeholder: "10-digit UTR"
        }
      ]
    },
    {
      id: "cfg_law_firm_conveyancing",
      business_type_id: "bt_law_firm",
      service_id: "srv_conveyancing",
      business_type_name: "Law Firm",
      service_name: "Conveyancing",
      required_documents: ["id", "proof_of_address", "source_of_funds", "property_title_deeds"],
      required_fields: [
        {
          field_id: "property_address",
          label: "Property Transaction Address",
          field_type: "text",
          required: true
        },
        {
          field_id: "transaction_value",
          label: "Estimated Property Value (£)",
          field_type: "number",
          required: true
        }
      ]
    }
  ],
  email_templates: [
    {
      id: "tpl_checklist_initial",
      template_type: "checklist_initial",
      subject: "Action Required: Welcome to {{firm_name}} — Documents required for {{service}}",
      headline: "Welcome to {{firm_name}}",
      body_text: "Thank you for starting your onboarding with us. To begin preparing your {{service}}, our administrative team requires a few initial documents listed below. Please upload them using your personal secure portal link.",
      cta_button_text: "Open Secure Upload Portal"
    },
    {
      id: "tpl_reminder_chase_1",
      template_type: "reminder_chase_1",
      subject: "Friendly Reminder: Documents needed to complete your onboarding - {{client_name}}",
      headline: "Onboarding Check-In",
      body_text: "We hope you are well. This is a gentle reminder that we are still awaiting the following documents to proceed with your {{service}}: {{missing_items}}.",
      cta_button_text: "Upload Missing Documents"
    },
    {
      id: "tpl_reminder_chase_2",
      template_type: "reminder_chase_2",
      subject: "Important: File review on hold pending outstanding documents - {{client_name}}",
      headline: "File Review On Hold",
      body_text: "Please be advised that administrative review of your {{service}} file cannot commence until all required documents are received. Missing items: {{missing_items}}.",
      cta_button_text: "Complete Upload Now"
    },
    {
      id: "tpl_reminder_chase_3",
      template_type: "reminder_chase_3",
      subject: "FINAL NOTICE: Inactive file warning for {{client_name}} - Action required",
      headline: "Final Administrative Notice",
      body_text: "This is our final notification regarding outstanding documentation for your {{service}}. If missing items ({{missing_items}}) are not uploaded within 48 hours, your onboarding file will be closed.",
      cta_button_text: "Submit Urgent Documents"
    },
    {
      id: "tpl_staff_summary",
      template_type: "staff_summary",
      subject: "Onboarding Complete: Staff Pre-Meeting Briefing for {{client_name}} ({{service}})",
      headline: "Pre-Meeting Staff Briefing",
      body_text: "The client has successfully uploaded all required documents. A pre-meeting factual summary has been compiled by the administrative AI pipeline and attached for your review.",
      cta_button_text: "View Client Profile in CRM"
    }
  ],
  reminder_schedule: {
    id: "default_schedule",
    auto_send_enabled: true,
    tiers: [
      {
        tier: 1,
        days_elapsed: 2,
        tone: "polite",
        subject: "Friendly Reminder: Documents needed to complete your onboarding - {{client_name}}",
        headline: "Onboarding Check-In",
        body_text: "We hope you are well. This is a gentle reminder that we are still awaiting the following documents to proceed with your {{service}}: {{missing_items}}."
      },
      {
        tier: 2,
        days_elapsed: 5,
        tone: "firm",
        subject: "Important: File review on hold pending outstanding documents - {{client_name}}",
        headline: "File Review On Hold",
        body_text: "Please be advised that administrative review of your {{service}} file cannot commence until all required documents are received. Missing items: {{missing_items}}."
      },
      {
        tier: 3,
        days_elapsed: 9,
        tone: "urgent",
        subject: "FINAL NOTICE: Inactive file warning for {{client_name}} - Action required",
        headline: "Final Administrative Notice",
        body_text: "This is our final notification regarding outstanding documentation for your {{service}}. If missing items ({{missing_items}}) are not uploaded within 48 hours, your onboarding file will be closed."
      }
    ]
  },
  ai_prompt_settings: {
    id: "default_ai_settings",
    system_extraction_prompt: "You are an administrative data extraction engine for a professional services firm. You analyze uploaded documents and extract structured facts (dates, figures, entity names, reference numbers) into strictly valid JSON.",
    system_summary_prompt: "You are an administrative assistant preparing a factual pre-meeting briefing for a professional advisor. Synthesize the client profile and extracted document facts into a concise structured briefing.",
    model: "gpt-4o",
    temperature: 0.1,
    fixed_compliance_boundary: 'NON-NEGOTIABLE COMPLIANCE BOUNDARY (Server-Enforced): This system automates ADMINISTRATION ONLY. You must NEVER generate, imply, or simulate autonomous tax, accounting, legal, or other regulated professional advice. All outputs are factual extraction, status tracking, and summarization — never recommendations or judgments requiring a licensed professional. Every output must carry the mandatory disclaimer: "This is an informational summary only. It does not constitute tax, accounting, legal, or other regulated professional advice."'
  },
  staff_users: [
    {
      id: "staff_001",
      name: "Sarah Jenkins, FCA",
      email: "sarah.jenkins@apex-accountants.co.uk",
      role: "admin",
      receive_summaries: true,
      receive_chase_alerts: true
    },
    {
      id: "staff_002",
      name: "Marcus Vance",
      email: "marcus.vance@apex-accountants.co.uk",
      role: "accountant",
      receive_summaries: true,
      receive_chase_alerts: false
    }
  ],
  clients: [],
  documents: [],
  reminders_sent: [],
  staff_summaries: []
};

// Helper to read local file-backed state
function getLocalState(): LocalDatabaseState {
  try {
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const dir = path.dirname(LOCAL_STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), "utf-8");
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    const data = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveLocalState(state: LocalDatabaseState) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist local DB state:", err);
  }
}

// ============================================================================
// DATA ACCESS REPOSITORY
// ============================================================================

export const db = {
  // Theme Settings
  async getThemeSettings(): Promise<ThemeSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("theme_settings").select("*").limit(1).single();
      if (!error && data) return data as ThemeSettings;
    }
    return getLocalState().theme_settings;
  },

  async updateThemeSettings(updates: Partial<ThemeSettings>): Promise<ThemeSettings> {
    const current = await this.getThemeSettings();
    const merged = { ...current, ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      await supabase.from("theme_settings").upsert(merged);
    }
    const state = getLocalState();
    state.theme_settings = merged;
    saveLocalState(state);
    return merged;
  },

  // Business Types
  async getBusinessTypes(): Promise<BusinessType[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("business_types").select("*").order("name");
      if (!error && data) return data as BusinessType[];
    }
    return getLocalState().business_types;
  },

  async createBusinessType(type: BusinessType): Promise<BusinessType> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("business_types").upsert(type);
    }
    const state = getLocalState();
    state.business_types = state.business_types.filter(b => b.id !== type.id).concat(type);
    saveLocalState(state);
    return type;
  },

  async saveBusinessType(type: BusinessType): Promise<BusinessType> {
    return this.createBusinessType(type);
  },

  async deleteBusinessType(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("business_types").delete().eq("id", id);
    }
    const state = getLocalState();
    state.business_types = state.business_types.filter(b => b.id !== id);
    saveLocalState(state);
  },

  // Services
  async getServices(): Promise<Service[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (!error && data) return data as Service[];
    }
    return getLocalState().services;
  },

  async createService(service: Service): Promise<Service> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("services").upsert(service);
    }
    const state = getLocalState();
    state.services = state.services.filter(s => s.id !== service.id).concat(service);
    saveLocalState(state);
    return service;
  },

  async saveService(service: Service): Promise<Service> {
    return this.createService(service);
  },

  async deleteService(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("services").delete().eq("id", id);
    }
    const state = getLocalState();
    state.services = state.services.filter(s => s.id !== id);
    saveLocalState(state);
  },

  // Checklist Config
  async getChecklistConfigs(): Promise<ChecklistConfig[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("checklist_config").select("*");
      if (!error && data) return data as ChecklistConfig[];
    }
    return getLocalState().checklist_config;
  },

  async getChecklistConfig(businessTypeId: string, serviceId: string): Promise<ChecklistConfig | null> {
    const configs = await this.getChecklistConfigs();
    return configs.find(c => c.business_type_id === businessTypeId && c.service_id === serviceId) || null;
  },

  async getChecklistConfigByNames(businessTypeName: string, serviceName: string): Promise<ChecklistConfig | null> {
    const configs = await this.getChecklistConfigs();
    if (!configs || configs.length === 0) return null;

    const btypes = await this.getBusinessTypes();
    const services = await this.getServices();
    const btype = btypes.find(b => b.name.toLowerCase() === (businessTypeName || "").toLowerCase());
    const service = services.find(s => s.name.toLowerCase() === (serviceName || "").toLowerCase());

    if (btype && service) {
      const exact = await this.getChecklistConfig(btype.id, service.id);
      if (exact) return exact;
    }

    // Direct lookup by name matching in configs
    const byName = configs.find(c =>
      c.business_type_name?.toLowerCase() === (businessTypeName || "").toLowerCase() &&
      c.service_name?.toLowerCase() === (serviceName || "").toLowerCase()
    );
    if (byName) return byName;

    // Fallback: match by business type or service
    const byBtype = configs.find(c =>
      c.business_type_name?.toLowerCase() === (businessTypeName || "").toLowerCase() ||
      (btype && c.business_type_id === btype.id)
    );
    if (byBtype) return byBtype;

    const byService = configs.find(c =>
      c.service_name?.toLowerCase() === (serviceName || "").toLowerCase() ||
      (service && c.service_id === service.id)
    );
    if (byService) return byService;

    // Default to first available config
    return configs[0];
  },

  async saveChecklistConfig(config: ChecklistConfig): Promise<ChecklistConfig> {
    const enriched = { ...config, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      await supabase.from("checklist_config").upsert(enriched);
    }
    const state = getLocalState();
    state.checklist_config = state.checklist_config.filter(c => c.id !== config.id).concat(enriched);
    saveLocalState(state);
    return enriched;
  },

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("email_templates").select("*");
      if (!error && data) return data as EmailTemplate[];
    }
    return getLocalState().email_templates;
  },

  async getEmailTemplate(type: string): Promise<EmailTemplate | null> {
    const templates = await this.getEmailTemplates();
    return templates.find(t => t.template_type === type) || null;
  },

  async saveEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const updated = { ...template, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      await supabase.from("email_templates").upsert(updated);
    }
    const state = getLocalState();
    state.email_templates = state.email_templates.filter(t => t.id !== template.id).concat(updated);
    saveLocalState(state);
    return updated;
  },

  // Reminder Schedule
  async getReminderSchedule(): Promise<ReminderSchedule> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("reminder_schedule").select("*").limit(1).single();
      if (!error && data) return data as ReminderSchedule;
    }
    return getLocalState().reminder_schedule;
  },

  async updateReminderSchedule(schedule: Partial<ReminderSchedule>): Promise<ReminderSchedule> {
    const current = await this.getReminderSchedule();
    const merged = { ...current, ...schedule, updated_at: new Date().toISOString() };
    if (isSupabaseConfigured && supabase) {
      await supabase.from("reminder_schedule").upsert(merged);
    }
    const state = getLocalState();
    state.reminder_schedule = merged;
    saveLocalState(state);
    return merged;
  },

  // AI Prompt Settings
  async getAIPromptSettings(): Promise<AIPromptSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("ai_prompt_settings").select("*").limit(1).single();
      if (!error && data) return data as AIPromptSettings;
    }
    return getLocalState().ai_prompt_settings;
  },

  async updateAIPromptSettings(settings: Partial<AIPromptSettings>): Promise<AIPromptSettings> {
    const current = await this.getAIPromptSettings();
    // Enforce non-removable compliance boundary
    const merged = {
      ...current,
      ...settings,
      fixed_compliance_boundary: current.fixed_compliance_boundary, // Non-editable server-side
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from("ai_prompt_settings").upsert(merged);
    }
    const state = getLocalState();
    state.ai_prompt_settings = merged;
    saveLocalState(state);
    return merged;
  },

  // Staff Users
  async getStaffUsers(): Promise<StaffUser[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("staff_users").select("*");
      if (!error && data) return data as StaffUser[];
    }
    return getLocalState().staff_users;
  },

  async createStaffUser(user: StaffUser): Promise<StaffUser> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("staff_users").upsert(user);
    }
    const state = getLocalState();
    state.staff_users = state.staff_users.filter(s => s.id !== user.id).concat(user);
    saveLocalState(state);
    return user;
  },

  // Clients
  async getClients(): Promise<ClientRecord[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (!error && data) return data as ClientRecord[];
    }
    return getLocalState().clients;
  },

  async getClientById(id: string): Promise<ClientRecord | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
      if (!error && data) return data as ClientRecord;
    }
    const state = getLocalState();
    return state.clients.find(c => c.id === id) || null;
  },

  async getClientByUploadToken(token: string): Promise<ClientRecord | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("clients").select("*").eq("upload_token", token).single();
      if (!error && data) return data as ClientRecord;
    }
    const state = getLocalState();
    return state.clients.find(c => c.upload_token === token) || null;
  },

  async createClient(client: ClientRecord): Promise<ClientRecord> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("clients").insert(client);
    }
    const state = getLocalState();
    state.clients = [client, ...state.clients.filter(c => c.id !== client.id)];
    saveLocalState(state);
    return client;
  },

  async updateClient(id: string, updates: Partial<ClientRecord>): Promise<ClientRecord | null> {
    const current = await this.getClientById(id);
    if (!current) return null;
    const merged = { ...current, ...updates, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      await supabase.from("clients").update(merged).eq("id", id);
    }
    const state = getLocalState();
    state.clients = state.clients.map(c => (c.id === id ? merged : c));
    saveLocalState(state);
    return merged;
  },

  // Documents
  async getDocumentsByClientId(clientId: string): Promise<ExtractedDocument[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("documents").select("*").eq("client_id", clientId);
      if (!error && data) return data as ExtractedDocument[];
    }
    const state = getLocalState();
    return state.documents.filter(d => d.client_id === clientId);
  },

  async saveDocument(doc: ExtractedDocument): Promise<ExtractedDocument> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("documents").upsert(doc);
    }
    const state = getLocalState();
    state.documents = state.documents.filter(d => d.doc_id !== doc.doc_id).concat(doc);
    saveLocalState(state);
    return doc;
  },

  async deleteDocument(clientId: string, docType: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("documents").delete().eq("client_id", clientId).eq("doc_type", docType);
    }
    const state = getLocalState();
    state.documents = state.documents.filter(d => !(d.client_id === clientId && (d.doc_type === docType || d.classified_type === docType)));
    saveLocalState(state);
  },

  // Reminders Sent
  async getRemindersSent(clientId?: string): Promise<ReminderSentRecord[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("reminders_sent").select("*").order("sent_at", { ascending: false });
      if (clientId) query = query.eq("client_id", clientId);
      const { data, error } = await query;
      if (!error && data) return data as ReminderSentRecord[];
    }
    const state = getLocalState();
    if (clientId) return state.reminders_sent.filter(r => r.client_id === clientId);
    return state.reminders_sent;
  },

  async recordReminderSent(record: ReminderSentRecord): Promise<ReminderSentRecord> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("reminders_sent").insert(record);
    }
    const state = getLocalState();
    state.reminders_sent = [record, ...state.reminders_sent];
    saveLocalState(state);
    return record;
  },

  // Staff Summaries
  async getStaffSummary(clientId: string): Promise<StaffSummary | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("staff_summaries").select("*").eq("client_id", clientId).limit(1).single();
      if (!error && data) return data as StaffSummary;
    }
    const state = getLocalState();
    return state.staff_summaries.find(s => s.client_id === clientId) || null;
  },

  async saveStaffSummary(summary: StaffSummary): Promise<StaffSummary> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("staff_summaries").upsert(summary);
    }
    const state = getLocalState();
    state.staff_summaries = state.staff_summaries.filter(s => s.client_id !== summary.client_id).concat(summary);
    saveLocalState(state);
    return summary;
  },

  async deleteStaffSummary(clientId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from("staff_summaries").delete().eq("client_id", clientId);
    }
    const state = getLocalState();
    state.staff_summaries = state.staff_summaries.filter(s => s.client_id !== clientId);
    saveLocalState(state);
  }
};
