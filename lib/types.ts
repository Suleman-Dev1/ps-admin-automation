export interface ThemeSettings {
  id?: string;
  firm_name: string;
  tagline: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  border_color: string;
  text_primary: string;
  text_secondary: string;
  font_family: string;
  border_radius: string;
  updated_at?: string;
}

export interface BusinessType {
  id: string;
  name: string; // e.g. "Ltd", "Sole Trader", "Partnership", "Law Firm", "Consultancy"
  description?: string;
  created_at?: string;
}

export interface Service {
  id: string;
  name: string; // e.g. "Year-end accounts", "VAT", "Payroll", "Conveyancing"
  description?: string;
  created_at?: string;
}

export interface FormFieldDefinition {
  field_id: string;
  label: string;
  field_type: "text" | "number" | "select" | "email" | "tel" | "date" | "textarea";
  options?: string[];
  required: boolean;
  placeholder?: string;
  help_text?: string;
  min?: number;
  max?: number;
}

export interface ChecklistConfig {
  id: string;
  business_type_id: string;
  service_id: string;
  business_type_name?: string;
  service_name?: string;
  required_documents: string[]; // e.g. ["bank_statement", "prior_year_accounts", ...]
  required_fields: FormFieldDefinition[]; // Dynamic form fields for this combo
  updated_at?: string;
}

export interface EmailTemplate {
  id: string;
  template_type: "checklist_initial" | "reminder_chase_1" | "reminder_chase_2" | "reminder_chase_3" | "staff_summary";
  subject: string;
  headline: string;
  body_text: string;
  cta_button_text: string;
  updated_at?: string;
}

export interface ReminderTier {
  tier: number;
  days_elapsed: number;
  tone: "polite" | "firm" | "urgent";
  subject: string;
  headline: string;
  body_text: string;
}

export interface ReminderSchedule {
  id?: string;
  tiers: ReminderTier[];
  auto_send_enabled: boolean;
  updated_at?: string;
}

export interface AIPromptSettings {
  id?: string;
  system_extraction_prompt: string;
  system_summary_prompt: string;
  model: string; // "gpt-4o", "gpt-4o-mini"
  temperature: number;
  fixed_compliance_boundary: string; // Non-editable server-side rule
  updated_at?: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "accountant" | "associate" | "auditor";
  receive_summaries: boolean;
  receive_chase_alerts: boolean;
  created_at?: string;
}

export type ClientStatus =
  | "New"
  | "Awaiting Documents"
  | "Chasing"
  | "Ready"
  | "Meeting Booked"
  | "Summary Sent"
  | "pending_documents"
  | "in_progress"
  | "ready_for_review";

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ClientRecord {
  id: string; // client_id e.g. "CLI-2026-XXXX"
  company_name?: string;
  business_type: string;
  service_requested: string;
  business_type_id?: string;
  service_id?: string;
  turnover_band?: string;
  employee_count?: number;
  relevant_date?: string;
  existing_provider?: string;
  contact: ContactInfo;
  custom_intake_data?: Record<string, any>;
  custom_fields?: Record<string, any>;
  status: ClientStatus;
  upload_token: string;
  upload_token_expires_at?: string;
  checklist_required?: string[];
  missing_items: string[];
  documents?: ExtractedDocument[];
  meeting_slot?: string;
  booking_unlocked?: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ExtractedDocument {
  doc_id: string;
  client_id: string;
  doc_type?: string; // e.g. "bank_statement"
  classified_type?: string;
  filename?: string;
  file_name?: string;
  file_type?: string;
  storage_path?: string;
  period_covered?: string;
  key_fields?: Record<string, any>;
  extracted_fields?: Record<string, any>;
  confidence?: number;
  confidence_score?: number;
  needs_human_review?: boolean;
  flagged_for_review?: boolean;
  verification_status?: string;
  verification_notes?: string;
  extraction_notes?: string;
  uploaded_at: string;
}

export interface ReminderSentRecord {
  id: string;
  client_id: string;
  reminder_number: number;
  missing_items: string[];
  recipient_email: string;
  subject: string;
  sent_at: string;
  channel: "email";
  status: "sent" | "delivered" | "failed" | "logged";
}

export interface StaffSummary {
  client_id: string;
  business_profile: string;
  service_requested: string;
  documents_received: string[];
  key_figures_extracted: Record<string, any>;
  open_questions: string[];
  flagged_items: string[];
  advice_disclaimer: string;
  generated_at: string;
}
