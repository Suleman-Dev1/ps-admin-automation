-- ============================================================================
-- DEFAULT SEED DATA FOR PROFESSIONAL SERVICES ADMIN AUTOMATION
-- ============================================================================

-- 1. Theme Settings
INSERT INTO theme_settings (
    id, firm_name, tagline, logo_url, primary_color, secondary_color,
    accent_color, background_color, surface_color, border_color,
    text_primary, text_secondary, font_family, border_radius
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Apex Professional Advisory',
    'Automated Administrative Onboarding & Verification',
    '/logo.svg',
    '#1e3a8a',
    '#0284c7',
    '#f59e0b',
    '#f8fafc',
    '#ffffff',
    '#e2e8f0',
    '#0f172a',
    '#475569',
    '''Inter'', -apple-system, sans-serif',
    '8px'
) ON CONFLICT (id) DO NOTHING;

-- 2. Business Types
INSERT INTO business_types (id, name, description) VALUES
    ('bt_ltd', 'Ltd', 'Private Limited Company incorporated in the UK'),
    ('bt_sole_trader', 'Sole Trader', 'Self-employed individual or unincorporated business'),
    ('bt_partnership', 'Partnership', 'Traditional partnership or LLP'),
    ('bt_law_firm', 'Law Firm', 'Legal practice requiring commercial onboarding')
ON CONFLICT (id) DO NOTHING;

-- 3. Services
INSERT INTO services (id, name, description) VALUES
    ('srv_year_end', 'Year-end accounts', 'Annual statutory accounts & corporation tax compliance'),
    ('srv_vat', 'VAT', 'Quarterly VAT return preparation and submission'),
    ('srv_payroll', 'Payroll', 'Monthly employee PAYE, RTI, and pension compliance'),
    ('srv_self_assessment', 'Self Assessment', 'Personal tax return for directors and sole traders'),
    ('srv_conveyancing', 'Conveyancing', 'Commercial and residential property transaction onboarding')
ON CONFLICT (id) DO NOTHING;

-- 4. Checklists & Form Fields
INSERT INTO checklist_config (id, business_type_id, service_id, required_documents, required_fields) VALUES
    (
        'cfg_ltd_year_end',
        'bt_ltd',
        'srv_year_end',
        '["bank_statement", "prior_year_accounts", "payroll_summary", "id", "proof_of_address", "vat_certificate"]'::jsonb,
        '[
            {"field_id": "turnover_band", "label": "Annual Turnover Band", "field_type": "select", "options": ["Under £100k", "£100k - £250k", "£250k - £500k", "£500k - £1m", "£1m - £5m", "£5m+"], "required": true},
            {"field_id": "employee_count", "label": "Number of Employees", "field_type": "number", "required": true, "min": 0},
            {"field_id": "relevant_date", "label": "Company Year-End Date", "field_type": "date", "required": false},
            {"field_id": "existing_provider", "label": "Previous Accountant", "field_type": "text", "required": false, "placeholder": "e.g. Previous Firm LLP or None"}
        ]'::jsonb
    ),
    (
        'cfg_sole_trader_self_assessment',
        'bt_sole_trader',
        'srv_self_assessment',
        '["bank_statement", "id", "proof_of_address", "expense_records"]'::jsonb,
        '[
            {"field_id": "turnover_band", "label": "Estimated Self-Employed Revenue", "field_type": "select", "options": ["Under £50k", "£50k - £100k", "£100k - £250k", "£250k+"], "required": true},
            {"field_id": "utr_number", "label": "Unique Taxpayer Reference (UTR)", "field_type": "text", "required": false, "placeholder": "10-digit UTR"}
        ]'::jsonb
    ),
    (
        'cfg_law_firm_conveyancing',
        'bt_law_firm',
        'srv_conveyancing',
        '["id", "proof_of_address", "source_of_funds", "property_title_deeds"]'::jsonb,
        '[
            {"field_id": "property_address", "label": "Target Property Address", "field_type": "text", "required": true},
            {"field_id": "transaction_value", "label": "Estimated Transaction Value (£)", "field_type": "number", "required": true}
        ]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Email Templates
INSERT INTO email_templates (id, template_type, subject, headline, body_text, cta_button_text) VALUES
    (
        'tpl_checklist_initial',
        'checklist_initial',
        'Action Required: Welcome to {{firm_name}} — Documents required for {{service}}',
        'Welcome to {{firm_name}}',
        'Thank you for completing your initial intake for {{service}}. To begin our review, please upload the required documents using your personal secure upload link below.',
        'Open Secure Upload Portal'
    ),
    (
        'tpl_reminder_chase_1',
        'reminder_chase_1',
        'Friendly Reminder: Documents needed to complete your onboarding - {{client_name}}',
        'Onboarding Check-In',
        'We hope you are well. This is a gentle reminder that we are still awaiting the following documents to proceed with your {{service}}: {{missing_items}}.',
        'Upload Missing Documents'
    ),
    (
        'tpl_reminder_chase_2',
        'reminder_chase_2',
        'Important: File review on hold pending outstanding documents - {{client_name}}',
        'File Review On Hold',
        'Please be advised that administrative review of your {{service}} file cannot commence until all required documents are received. Missing items: {{missing_items}}.',
        'Complete Upload Now'
    ),
    (
        'tpl_reminder_chase_3',
        'reminder_chase_3',
        'FINAL NOTICE: Inactive file warning for {{client_name}} - Action required',
        'Final Administrative Notice',
        'This is our final notification regarding outstanding documentation for your {{service}}. If missing items ({{missing_items}}) are not uploaded within 48 hours, your onboarding file will be closed.',
        'Submit Urgent Documents'
    ),
    (
        'tpl_staff_summary',
        'staff_summary',
        'Onboarding Complete: Staff Pre-Meeting Briefing for {{client_name}} ({{service}})',
        'Pre-Meeting Staff Briefing',
        'The client has successfully uploaded all required documents. A pre-meeting factual summary has been compiled by the administrative AI pipeline and attached for your review.',
        'View Client Profile in CRM'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Reminder Schedule
INSERT INTO reminder_schedule (id, tiers, auto_send_enabled) VALUES (
    'default_schedule',
    '[
        {"tier": 1, "days_elapsed": 2, "tone": "polite", "subject": "Friendly Reminder: Documents needed to complete your onboarding - {{client_name}}", "headline": "Onboarding Check-In", "body_text": "We hope you are well. This is a gentle reminder that we are still awaiting the following documents to proceed with your {{service}}: {{missing_items}}."},
        {"tier": 2, "days_elapsed": 5, "tone": "firm", "subject": "Important: File review on hold pending outstanding documents - {{client_name}}", "headline": "File Review On Hold", "body_text": "Please be advised that administrative review of your {{service}} file cannot commence until all required documents are received. Missing items: {{missing_items}}."},
        {"tier": 3, "days_elapsed": 9, "tone": "urgent", "subject": "FINAL NOTICE: Inactive file warning for {{client_name}} - Action required", "headline": "Final Administrative Notice", "body_text": "This is our final notification regarding outstanding documentation for your {{service}}. If missing items ({{missing_items}}) are not uploaded within 48 hours, your onboarding file will be closed."}
    ]'::jsonb,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 7. AI Prompt Settings with Fixed Compliance Boundary
INSERT INTO ai_prompt_settings (
    id, system_extraction_prompt, system_summary_prompt, model, temperature, fixed_compliance_boundary
) VALUES (
    'default_ai_settings',
    'You are an administrative data extraction engine for a professional services firm. You analyze uploaded documents and extract structured facts (dates, figures, entity names, reference numbers) into strictly valid JSON.',
    'You are an administrative assistant preparing a factual pre-meeting briefing for a professional advisor. Synthesize the client profile and extracted document facts into a concise structured briefing.',
    'gpt-4o',
    0.1,
    'NON-NEGOTIABLE COMPLIANCE BOUNDARY (Server-Enforced): This system automates ADMINISTRATION ONLY. You must NEVER generate, imply, or simulate autonomous tax, accounting, legal, or other regulated professional advice. All outputs are factual extraction, status tracking, and summarization — never recommendations or judgments requiring a licensed professional. Every output must carry the mandatory disclaimer: "This is an informational summary only. It does not constitute tax, accounting, legal, or other regulated professional advice."'
) ON CONFLICT (id) DO NOTHING;

-- 8. Staff Users
INSERT INTO staff_users (id, name, email, role, receive_summaries, receive_chase_alerts) VALUES
    ('staff_001', 'Sarah Jenkins, FCA', 'sarah.jenkins@apex-accountants.co.uk', 'admin', TRUE, TRUE),
    ('staff_002', 'Marcus Vance', 'marcus.vance@apex-accountants.co.uk', 'accountant', TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;
