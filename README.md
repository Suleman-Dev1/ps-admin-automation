# Professional Services Admin Automation Platform

A production-grade, dynamic full-stack administrative automation platform built for professional services firms (initial vertical: **Accountancy**, fully portable to **Law Firms**, **Consultancies**, etc., via dynamic Admin configuration rather than code modifications).

Powered by **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (with zero-dependency local JSON engine fallback), **OpenAI API (`gpt-4o`)**, **Resend**, and **Cal.com** gated scheduling.

---

## ⚡ Highlights & Hard Requirements Fulfilled

1. **100% Dynamic — Controlled from Admin Panel**:
   - **Theme & Branding**: Firm name, colors (`--brand-primary`, `--brand-secondary`, `--brand-accent`), surface colors, font family, and border radius are fetched dynamically from the database and injected into CSS variables at runtime. Changing them in the Admin Panel immediately updates client portals and staff dashboards without rebuilds.
   - **Verticals, Services & Dynamic Fields**: Business structures (Ltd, Sole Trader, Partnership, Law Firm) and service packages are managed in Admin. Intake form questions and required fields dynamically adapt per selection.
   - **Dynamic Document Checklists**: Mandatory documents per business type and service are configurable in Admin with zero code modifications.
   - **Dynamic Email Templates & Escalating Follow-ups**: Follow-up cadence (Day 2, Day 5, Day 9) and email templates with dynamic tokens (`{{client_name}}`, `{{missing_items}}`, `{{portal_link}}`, `{{firm_name}}`) are fully customizable.
   - **OpenAI Prompt Settings**: System extraction prompts and summary generation prompts are editable in Admin.

2. **OpenAI GPT-4o Multimodal Extraction (NOT Claude)**:
   - Automated document classification (Bank Statements, Prior Year Accounts, Payroll P32/P60, ID/Passport, VAT Certificates, Utility Bills).
   - Structured key field extraction (balances, turnover, VAT numbers, dates, confidence scores).
   - Documents with confidence < 0.85 or poor quality are automatically flagged for staff review.

3. **Gated Cal.com Meeting Booking**:
   - Meeting booking is **strictly locked** while any mandatory onboarding items remain unsubmitted.
   - Once all documents are uploaded and verified, the gated calendar unlocks automatically and launches pre-populated Cal.com booking.

4. **⚖️ Non-Negotiable Compliance Boundary (Server-Enforced)**:
   - System automates **ADMINISTRATION ONLY**.
   - Strict server-side code prevents generation, simulation, or implication of regulated tax, accounting, or legal advice.
   - A non-removable statutory disclaimer is permanently injected into all AI prompts, staff briefs, and client emails:
     > *"This is an informational summary only. It does not constitute tax, accounting, legal, or other regulated professional advice."*

5. **Zero-Setup Resilient Architecture**:
   - Ready to run immediately with `npm run dev` or `npm run build` without requiring Supabase or external API setup (`data/local_db.json` provides instantaneous persistence and fallback).

---

## 🚀 Quickstart: Running the Web Application

The application is stored directly on your Desktop at `/Users/macrorld/Desktop/ps-admin-automation`.

### 1. Start the Next.js Full-Stack Application
```bash
cd ~/Desktop/ps-admin-automation

# Start the live development server
npm run dev
```

Open your browser to:
- **System Launchpad**: [http://localhost:3000](http://localhost:3000)
- **Admin Control Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
  - 🎨 **Theme & Branding**: [http://localhost:3000/admin/theme](http://localhost:3000/admin/theme)
  - 📂 **Verticals & Checklists**: [http://localhost:3000/admin/verticals](http://localhost:3000/admin/verticals)
  - ✉️ **Emails & Escalations**: [http://localhost:3000/admin/emails](http://localhost:3000/admin/emails)
  - 🤖 **OpenAI Prompts**: [http://localhost:3000/admin/ai](http://localhost:3000/admin/ai)
  - 👥 **Staff Users**: [http://localhost:3000/admin/staff](http://localhost:3000/admin/staff)
- **Dynamic Client Intake Portal**: [http://localhost:3000/intake](http://localhost:3000/intake)
- **Staff CRM & Pipeline**: [http://localhost:3000/staff](http://localhost:3000/staff)

---

## 🧪 1-Click End-to-End Simulator

Visit [http://localhost:3000/admin](http://localhost:3000/admin) and click **"Run Live 7-Step Simulation"** or run:
```bash
curl -X POST http://localhost:3000/api/demo/simulate -H "Content-Type: application/json"
```

The simulator executes all 7 operational phases automatically:
1. **Intake Registration**: Creates client record and initializes dynamic checklist for *Nexus Engineering Ltd*.
2. **Welcome Dispatch & Multi-CRM Sync**: Formats dynamic email and syncs to Airtable & HubSpot.
3. **OpenAI Document Extraction**: Ingests Barclays Bank Statement & Prior Accounts via GPT-4o, extracting turnover, profit, and balances.
4. **Dynamic Gap Analysis**: Identifies remaining missing documents; evaluates Cal.com booking as **LOCKED**.
5. **Escalation Reminder**: Dispatches 1st chase reminder via Resend with dynamic placeholder list.
6. **Checklist Fulfillment**: Ingests remaining required documents; transitions status to `ready_for_review`.
7. **Booking Unlock & Briefing**: Evaluates Cal.com booking as **UNLOCKED**; generates OpenAI 4-point administrative brief with statutory disclaimer.

---

## ⚙️ Environment Configuration (`.env.local`)

To activate live external cloud services, configure `.env.local` (reference `.env.example`):

```bash
# 1. OpenAI (Multimodal GPT-4o extraction & briefing)
OPENAI_API_KEY=sk-...

# 2. Supabase (Optional: connects remote PostgreSQL & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 3. Resend (Email delivery)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@yourfirm.com

# 4. CRM Synchronization
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
HUBSPOT_ACCESS_TOKEN=pat-na1-...

# 5. Cal.com Gated Booking
NEXT_PUBLIC_CAL_USERNAME=apex-advisory
NEXT_PUBLIC_CAL_EVENT_SLUG=30min-onboarding
```

*Note: If any key is left unset, the platform seamlessly activates its local mock and offline fallback engine without errors.*

---

## 📁 Repository Structure

```
ps-admin-automation/
├── app/
│   ├── layout.tsx                    # Root layout with dynamic theme provider
│   ├── page.tsx                      # Main launchpad and quick navigation
│   ├── globals.css                   # Tailwind CSS styling with dynamic CSS vars
│   ├── intake/page.tsx               # Dynamic client intake form
│   ├── upload/[token]/page.tsx       # Secure tokenized client document upload portal
│   ├── book/[token]/page.tsx         # Gated Cal.com meeting scheduling
│   ├── staff/page.tsx                # Staff CRM pipeline dashboard
│   ├── staff/clients/[id]/page.tsx   # Staff client detail, verification & briefing view
│   ├── admin/
│   │   ├── layout.tsx                # Admin tab navigation
│   │   ├── page.tsx                  # Admin Overview & 1-Click Simulator UI
│   │   ├── theme/page.tsx            # Live Theme & Color Editor with DOM preview
│   │   ├── verticals/page.tsx        # Multi-vertical, services & form field builder
│   │   ├── emails/page.tsx           # Email templates & escalation schedule editor
│   │   ├── ai/page.tsx               # OpenAI prompt settings & immutable compliance banner
│   │   └── staff/page.tsx            # Staff team management & alert preferences
│   └── api/
│       ├── admin/                    # Admin REST endpoints (theme, verticals, checklists, emails, ai, staff)
│       ├── intake/submit/            # Client intake submission endpoint
│       ├── upload/[token]/           # Document upload & OpenAI GPT-4o extraction
│       ├── clients/                  # Clients list & detail endpoints
│       ├── reminders/send-single/    # On-demand reminder trigger via Resend
│       ├── summary/generate/         # OpenAI pre-meeting brief generator
│       └── demo/simulate/            # 1-Click 7-step simulator engine
├── components/
│   ├── Navbar.tsx                    # Dynamic branded top navigation bar with statutory badge
│   └── ThemeProvider.tsx             # Client-side dynamic CSS variable injector
├── lib/
│   ├── types.ts                      # Authoritative TypeScript types & contracts
│   ├── db.ts                         # Dual-engine repository (Supabase + Local JSON store)
│   ├── openai.ts                     # OpenAI GPT-4o multimodal client & compliance guard
│   ├── resend.ts                     # Resend email dispatcher with template tokens
│   ├── crm.ts                        # Airtable & HubSpot sync with local store
│   └── cal.ts                        # Gated Cal.com booking rules engine
├── supabase/
│   ├── schema.sql                    # Production Postgres DDL (12 tables, RLS, indexes)
│   └── seed.sql                      # Default vertical seeds (Accountancy + Legal)
└── data/
    └── local_db.json                 # File-backed local store for zero-setup persistence
```

---

## 🏛️ Statutory Disclaimer
This platform strictly automates administrative workflows, intake collation, document extraction, and pre-meeting factual summaries. It does not provide, imply, or replace regulated tax, accounting, or legal advice. All outputs must be reviewed by licensed professionals.
