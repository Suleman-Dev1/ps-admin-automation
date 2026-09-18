# Professional Services Admin Automation

A multi-agent administrative automation platform built for professional services firms (initial vertical: **Accountancy**, fully portable to **Law Firms**, **Consultancies**, etc., via configuration rather than code changes).

---

## ⚖️ Hard Boundary (Non-Negotiable)
> **ADMINISTRATIVE AUTOMATION ONLY**  
> This system automates intake, secure document collection, classification, gap detection, escalating follow-up communications, and factual pre-meeting summaries.  
> It **never** generates, implies, or simulates autonomous tax, accounting, legal, or regulated professional advice.  
> All staff-facing and client-facing outputs carry a visible disclaimer:
> *"NOTICE: Information only — not professional tax, accounting, or legal advice. This administrative summary extracts factual data for review by licensed professionals."*

---

## 🚀 Quickstart: Running the Demo

The project is zero-dependency (built using standard Python 3.10+ library).

```bash
# 1. Navigate to the project directory on your Desktop
cd ~/Desktop/ps-admin-automation

# 2. Run the end-to-end interactive demo
python3 run_demo.py
```

### Running the Full Test Suite
```bash
# Run all 60 tests across all 5 agents + acceptance suite:
python3 -m unittest discover -s . -p "test_*.py"

# Or run the authoritative 6-point acceptance test suite directly:
python3 agent5_qa_compliance/acceptance_test.py
```

---

## 🏗️ 5-Agent Parallel Architecture

All 5 agents were constructed against the **Shared Contract** in `contracts.py`:

```
                                  ┌───────────────────────────┐
                                  │   Intake Form / Prospect  │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
┌──────────────────────────┐      ┌───────────────────────────┐
│         AGENT 1          │─────▶│   CLIENT_RECORD Schema    │◀────┐
│   Intake & CRM Agent     │      │      (status: 'New')      │     │
└──────────────────────────┘      └─────────────┬─────────────┘     │
                                                │                   │
                                                ▼                   │
┌──────────────────────────┐      ┌───────────────────────────┐     │
│         AGENT 2          │─────▶│  Secure Tokenized Portal  │     │
│      Document Agent      │      │ & Classification Pipeline │     │
└──────────────────────────┘      └─────────────┬─────────────┘     │
                                                │                   │
                                                ▼                   │
┌──────────────────────────┐      ┌───────────────────────────┐     │
│         AGENT 3          │─────▶│   Gap-Detection Engine    │─────┘ (status -> 'Chasing')
│     Follow-up Agent      │      │  Multi-Tier Escalation    │
└──────────────────────────┘      └─────────────┬─────────────┘
                                                │ (checklist complete -> 'Ready')
                                                ▼
┌──────────────────────────┐      ┌───────────────────────────┐
│         AGENT 4          │─────▶│ Gated Meeting Scheduling  │
│    Scheduling & Summary  │      │ & Pre-Meeting Briefing MD │
└──────────────────────────┘      └─────────────┬─────────────┘
                                                │ (status -> 'Meeting Booked' -> 'Summary Sent')
                                                ▼
┌──────────────────────────┐      ┌───────────────────────────┐
│         AGENT 5          │─────▶│ Synthetic Docs & QA Audit │
│   Compliance & Portability      │ 6-Point Acceptance Suite  │
└──────────────────────────┘      └───────────────────────────┘
```

### Agent Roles & Deliverables:
1. **Agent 1 (`agent1_intake_crm`)**:
   - Intake form validation (business type, turnover band, headcount, contact info).
   - Automated CRM `ClientRecord` provisioning (`status: 'New'`).
   - Thread-safe JSON-backed persistence repository (`CRMStore`).
   - Checklist assignment based on `CHECKLIST_CONFIG`.
2. **Agent 2 (`agent2_document`)**:
   - Swappable JSON/YAML checklist configurations.
   - Secure tokenized upload portal links (HMAC-SHA256, no client login required).
   - Document classification & structured key field extraction pipeline.
   - Confidence scoring & human review gating (< 0.85 &rarr; `needs_human_review: true`).
3. **Agent 3 (`agent3_followup`)**:
   - Gap detection engine comparing required documents against received documents.
   - Escalating 3-tier follow-up schedule (Chase 1 Day 2, Chase 2 Day 5, Chase 3 Day 9).
   - Real generated email artifacts (Subject, Plaintext, and HTML).
   - Status updates (`'Chasing'`).
4. **Agent 4 (`agent4_scheduling_summary`)**:
   - Gated booking calendar: strictly locked while `missing_items` exist, unlocks only when checklist is complete.
   - Pre-meeting factual staff summary generator with mandatory statutory disclaimer.
   - Markdown briefing renderer with structured tables.
   - Status transitions (`'Meeting Booked'`, `'Summary Sent'`).
5. **Agent 5 (`agent5_qa_compliance`)**:
   - Realistic synthetic document pack (Bank Statement, Accounts, Payroll, Passport, VAT Cert, noisy scan, omitted proof of address).
   - Compliance auditor scanning for prohibited tax/legal opinions.
   - Cross-vertical portability verification (Accountancy &harr; Legal Conveyancing &harr; Consulting).
   - 6-Point acceptance test suite.

---

## 📋 Final Acceptance Criteria Verification (7/7 Passed)

| Criterion | Target Requirement | Status | Verification Details |
| :--- | :--- | :---: | :--- |
| **Criterion 1** | Dummy client completes intake form | **PASS** | Validated for Apex Trading Ltd with all 7 fields |
| **Criterion 2** | CRM record created automatically from form | **PASS** | `ClientRecord` provisioned, status `New` &rarr; `Awaiting Documents` |
| **Criterion 3** | Client uploads synthetic documents | **PASS** | 5 documents ingested with high OCR confidence |
| **Criterion 4** | System identifies deliberately missing item | **PASS** | Omitted `proof_of_address` flagged, status updated to `Chasing` |
| **Criterion 5** | Real reminder generated for missing item | **PASS** | 3-tier escalating email artifacts generated with advice disclaimer |
| **Criterion 6** | Staff summary prepared once checklist complete | **PASS** | Gap cleared, briefing generated with key figures (£580k turnover, £42.5k bank balance), status updated to `Summary Sent` |
| **Auxiliary** | Compliance gating & vertical portability | **PASS** | Low confidence flagged (< 0.85), advice patterns blocked, Law Firm config swapped without code changes |

---

## 📁 Repository Structure

```
ps-admin-automation/
├── README.md                      # Project documentation & quickstart
├── contracts.py                   # Authoritative shared dataclasses & schemas
├── run_demo.py                    # Live end-to-end interactive demo runner
├── config/
│   ├── checklists.json            # Swappable checklist definitions
│   ├── checklists.yaml            # YAML formatted checklist definitions
│   └── config_loader.py           # Multi-vertical config loader
├── agent1_intake_crm/             # Agent 1: Intake & CRM
│   ├── intake_service.py
│   ├── crm_store.py
│   └── test_agent1.py
├── agent2_document/               # Agent 2: Document Ingestion & Extraction
│   ├── upload_portal.py
│   ├── classifier.py
│   ├── extractor.py
│   ├── pipeline.py
│   └── ingestion.py
├── agent3_followup/               # Agent 3: Gap Detection & Reminders
│   ├── gap_detector.py
│   ├── generator.py
│   ├── templates.py
│   ├── dispatcher.py
│   └── store.py
├── agent4_scheduling_summary/     # Agent 4: Gated Booking & Summary
│   ├── booking_gate.py
│   ├── summary_generator.py
│   └── briefing_renderer.py
├── agent5_qa_compliance/          # Agent 5: Compliance & Acceptance Testing
│   ├── compliance.py
│   ├── compliance_rules.md
│   ├── portability_spec.md
│   └── acceptance_test.py
├── synthetic_docs/                # Synthetic document pack & OCR fixtures
│   ├── loader.py
│   ├── bank_statement.txt / .json
│   ├── prior_year_accounts.txt / .json
│   ├── payroll_summary.txt / .json
│   ├── director_id.txt / .json
│   ├── vat_certificate.txt / .json
│   ├── vat_certificate_noisy.txt / .json
│   └── proof_of_address.txt / .json
└── test_agent*.py                 # Unit & integration test suites
```

---

## 🔄 Cross-Vertical Portability (Zero Code Changes)
To switch the platform to a Law Firm (e.g. Commercial Conveyancing), simply pass `"Law Firm"` and `"Conveyancing"` to the checklist config:
```python
from config.config_loader import get_checklist_for

law_config = get_checklist_for("Law Firm", "Conveyancing")
# Loads: ['id', 'proof_of_address', 'source_of_funds', 'property_title_deeds']
```
No Python code modifications are needed.
