-- ============================================================================
-- PROFESSIONAL SERVICES ADMIN AUTOMATION — SUPABASE POSTGRESQL SCHEMA
-- ============================================================================

-- 1. Theme & Branding Settings (Runtime live configuration)
CREATE TABLE IF NOT EXISTS theme_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_name TEXT NOT NULL DEFAULT 'Apex Professional Advisory',
    tagline TEXT NOT NULL DEFAULT 'Automated Administrative Onboarding & Verification',
    logo_url TEXT NOT NULL DEFAULT '',
    primary_color TEXT NOT NULL DEFAULT '#1e3a8a',
    secondary_color TEXT NOT NULL DEFAULT '#0284c7',
    accent_color TEXT NOT NULL DEFAULT '#f59e0b',
    background_color TEXT NOT NULL DEFAULT '#f8fafc',
    surface_color TEXT NOT NULL DEFAULT '#ffffff',
    border_color TEXT NOT NULL DEFAULT '#e2e8f0',
    text_primary TEXT NOT NULL DEFAULT '#0f172a',
    text_secondary TEXT NOT NULL DEFAULT '#475569',
    font_family TEXT NOT NULL DEFAULT '''Inter'', sans-serif',
    border_radius TEXT NOT NULL DEFAULT '8px',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Business Types (e.g. Ltd, Sole Trader, Partnership, Law Firm)
CREATE TABLE IF NOT EXISTS business_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Services (e.g. Year-end accounts, VAT, Payroll, Conveyancing)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Checklist & Form Field Configuration (Keyed by business_type_id + service_id)
CREATE TABLE IF NOT EXISTS checklist_config (
    id TEXT PRIMARY KEY,
    business_type_id TEXT NOT NULL REFERENCES business_types(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (business_type_id, service_id)
);

-- 5. Email Templates (Admin-editable copy with placeholders)
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    template_type TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    headline TEXT NOT NULL,
    body_text TEXT NOT NULL,
    cta_button_text TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Reminder Schedule Configuration
CREATE TABLE IF NOT EXISTS reminder_schedule (
    id TEXT PRIMARY KEY DEFAULT 'default_schedule',
    tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
    auto_send_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AI Prompt Settings (Editable system prompt + non-removable compliance boundary)
CREATE TABLE IF NOT EXISTS ai_prompt_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_ai_settings',
    system_extraction_prompt TEXT NOT NULL,
    system_summary_prompt TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'gpt-4o',
    temperature NUMERIC NOT NULL DEFAULT 0.1,
    fixed_compliance_boundary TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Staff Users (Notification recipients)
CREATE TABLE IF NOT EXISTS staff_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'accountant',
    receive_summaries BOOLEAN NOT NULL DEFAULT TRUE,
    receive_chase_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Clients (CRM and intake records)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    business_type TEXT NOT NULL,
    service_requested TEXT NOT NULL,
    business_type_id TEXT,
    service_id TEXT,
    turnover_band TEXT NOT NULL,
    employee_count INTEGER NOT NULL DEFAULT 0,
    relevant_date TEXT,
    existing_provider TEXT,
    contact JSONB NOT NULL DEFAULT '{}'::jsonb,
    custom_intake_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'New',
    upload_token TEXT NOT NULL UNIQUE,
    upload_token_expires_at TIMESTAMPTZ,
    checklist_required JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    meeting_slot TEXT,
    booking_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Documents (Uploaded and extracted records)
CREATE TABLE IF NOT EXISTS documents (
    doc_id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    filename TEXT NOT NULL,
    storage_path TEXT,
    period_covered TEXT,
    key_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC NOT NULL DEFAULT 1.0,
    needs_human_review BOOLEAN NOT NULL DEFAULT FALSE,
    extraction_notes TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Reminders Sent (Audit trail of sent communications)
CREATE TABLE IF NOT EXISTS reminders_sent (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    reminder_number INTEGER NOT NULL,
    missing_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    channel TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'sent'
);

-- 12. Staff Summaries (Generated pre-meeting briefings)
CREATE TABLE IF NOT EXISTS staff_summaries (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    business_profile TEXT NOT NULL,
    service_requested TEXT NOT NULL,
    documents_received JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_figures_extracted JSONB NOT NULL DEFAULT '{}'::jsonb,
    open_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    flagged_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    advice_disclaimer TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_upload_token ON clients(upload_token);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_client_id ON reminders_sent(client_id);
