# Professional Services Admin Automation

A dynamic multi-agent administrative automation platform built for professional services firms (initial vertical: **Accountancy**, fully portable to **Law Firms**, **Consultancies**, etc., via dynamic Admin configuration rather than code changes).

---

## ⚡ Key Updates: OpenAI Integration & Dynamic Admin System
- **OpenAI API Integration (Not Claude)**:
  - Document classification, structured extraction, and pre-meeting factual summaries are powered by **OpenAI** (`gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`).
  - Zero external SDK dependencies: Communicates natively via Python standard library `urllib.request`.
  - Configurable in the Admin panel with deterministic local fallback when no API key is provided.
- **100% Dynamic — Everything Fetched from Admin**:
  - **Dynamic Theme & CSS**: Firm colors (`--primary-color`, `--secondary-color`, `--bg-color`), typography, firm name, and logo are fetched in real-time from the Admin Store. Changing the theme in Admin immediately updates the client intake portal, upload links, and staff dashboards!
  - **Dynamic Form Fields**: Form inputs, question labels, validation rules, and select options are defined in Admin and rendered dynamically.
  - **Dynamic Checklists**: Document requirements per business structure (Ltd, Sole Trader, Law Firm, etc.) are dynamically maintained in Admin with zero code modifications.
  - **Dynamic Follow-up Reminders**: Multi-tier escalation intervals (Day 2, Day 5, Day 9) and email messaging templates are managed in Admin.

---

## ⚖️ Hard Boundary (Non-Negotiable)
> **ADMINISTRATIVE AUTOMATION ONLY**  
> This system automates intake, secure document collection, classification, gap detection, escalating follow-up communications, and factual pre-meeting summaries.  
> It **never** generates, implies, or simulates autonomous tax, accounting, legal, or regulated professional advice.  
> All staff-facing and client-facing outputs carry a visible disclaimer:
> *"NOTICE: Information only — not professional tax, accounting, or legal advice. This administrative summary extracts factual data for review by licensed professionals."*

---

## 🚀 Quickstart: Running the System

### Option A: Interactive Web App & Admin Control Center (Recommended)
```bash
# 1. Navigate to the project on your Desktop
cd ~/Desktop/ps-admin-automation

# 2. Launch the dynamic web app
python3 web_app.py
```
Open your browser to:
- **Admin Control Center**: [`http://127.0.0.1:8000/admin`](http://127.0.0.1:8000/admin) — Edit themes live, configure OpenAI model, view checklists, and trigger the 1-Click Live Simulation.
- **Dynamic Client Intake Portal**: [`http://127.0.0.1:8000/intake`](http://127.0.0.1:8000/intake) — Live form rendered from Admin settings.
- **Staff CRM & Briefings**: [`http://127.0.0.1:8000/staff`](http://127.0.0.1:8000/staff) — View pipelines, gap status, and briefings.

---

### Option B: Terminal Demo Runner
```bash
# Run the complete end-to-end interactive CLI demo
python3 run_demo.py
```

### Option C: Automated Test Suite (60/60 Tests Passing)
```bash
# Run all tests across all agents
python3 -m unittest discover -s . -p "test_*.py"

# Run the 6-point acceptance test suite
python3 agent5_qa_compliance/acceptance_test.py
```

---

## 🏗️ Architecture & Dynamic Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADMIN CONTROL CENTER                            │
│  • Theme & Brand Colors    • Intake Form Fields   • Legal Checklists   │
│  • OpenAI Model Settings   • Reminder Schedules   • Compliance Notices │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Dynamic Configuration Fetch)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        5-AGENT PIPELINE FLEET                          │
├────────────────────────────────────────────────────────────────────────┤
│  Agent 1: Intake & CRM          │ Fetches dynamic fields & checklists  │
│  Agent 2: Document Processing   │ Uses OpenAI API for extraction       │
│  Agent 3: Follow-up & Reminders │ Fetches dynamic escalation schedules │
│  Agent 4: Scheduling & Summary  │ Uses OpenAI for staff briefing       │
│  Agent 5: Compliance & QA       │ Audits hard boundaries & disclaimers │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Final Acceptance Criteria Verification (7/7 Passed)

| Criterion | Target Requirement | Status | Verification Details |
| :--- | :--- | :---: | :--- |
| **Criterion 1** | Dummy client completes intake form | **PASS** | Validated for Apex Trading Ltd with dynamic fields |
| **Criterion 2** | CRM record created automatically from form | **PASS** | `ClientRecord` provisioned, status `New` &rarr; `Awaiting Documents` |
| **Criterion 3** | Client uploads synthetic documents | **PASS** | 5 documents ingested with OpenAI classification |
| **Criterion 4** | System identifies deliberately missing item | **PASS** | Omitted `proof_of_address` flagged, status updated to `Chasing` |
| **Criterion 5** | Real reminder generated for missing item | **PASS** | 3-tier escalating email artifacts generated with advice disclaimer |
| **Criterion 6** | Staff summary prepared once checklist complete | **PASS** | Gap cleared, OpenAI briefing generated (£580k turnover, £42.5k bank balance), status updated to `Summary Sent` |
| **Auxiliary** | Compliance gating & vertical portability | **PASS** | Low confidence flagged (< 0.85), advice patterns blocked, Law Firm config swapped without code changes |

---

## 📁 Repository Structure

```
ps-admin-automation/
├── admin_config.py                # Dynamic Admin configuration store & theme generator
├── openai_client.py               # OpenAI API client (gpt-4o-mini) with prompt safety guardrails
├── web_app.py                     # Dynamic Web App (/admin, /intake, /upload, /staff)
├── run_demo.py                    # Live end-to-end interactive demo runner
├── contracts.py                   # Authoritative shared dataclasses & schemas
├── config/
│   ├── admin_dynamic_config.json  # Stored dynamic configuration
│   ├── checklists.json            # Swappable checklist definitions
│   └── checklists.yaml            # YAML formatted checklist definitions
├── agent1_intake_crm/             # Agent 1: Intake validation & atomic CRM persistence
├── agent2_document/               # Agent 2: Tokenized upload portal (HMAC-SHA256) & OCR pipeline
├── agent3_followup/               # Agent 3: Gap-detection engine & 3-tier escalating reminder dispatch
├── agent4_scheduling_summary/     # Agent 4: Gated booking gate & pre-meeting staff briefing renderer
├── agent5_qa_compliance/          # Agent 5: Compliance audit, synthetic docs & acceptance tests
└── synthetic_docs/                # Synthetic test document pack & OCR fixtures
```
