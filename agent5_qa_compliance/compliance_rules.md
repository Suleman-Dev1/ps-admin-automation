# Compliance & Regulatory Rules Specification
**System Architecture:** Professional Services Admin Automation  
**Enforcement Authority:** Agent 5 — Compliance & QA Agent  
**Shared Contract Reference:** `contracts.py`  

---

## 1. Executive Summary & Hard Boundary
> **ADMINISTRATIVE AUTOMATION ONLY**  
> Under UK regulatory frameworks (including SRA Standards and Regulations for legal services, and ICAEW / ACCA Code of Ethics for accountancy services), automated systems must **never** provide, imply, or simulate autonomous tax, accounting, or legal advice.

The pipeline is strictly designed and audited as an **administrative orchestrator**:
- Intake collection & data hygiene
- Document cataloguing & secure storage
- Factual OCR field extraction
- Gap detection & checklist matching
- Follow-up chasing & escalation notices
- Objective, factual pre-meeting briefing summaries

---

## 2. Invariant Rules & Regulatory Boundaries

### Rule 1: Zero Autonomous Regulated Advice
**Severity:** CRITICAL / BLOCKING  
The system must never generate statements that recommend legal courses of action, prescribe tax-saving strategies, assert contract enforceability, or certify financial solvency/audit opinions.

| Forbidden Regulated Advice (VIOLATION) | Permitted Administrative Statement (COMPLIANT) |
|:---|:---|
| *"You should claim £14,000 in capital allowances on machinery to reduce your tax bill."* | *"Client reported £28,500 in tangible fixed asset additions for the year ended 31 Dec 2024."* |
| *"We advise structuring executive remuneration as 80% dividends and 20% salary."* | *"Payroll summary indicates Month 12 director gross salary of £6,500.00."* |
| *"In our legal assessment, the lease break clause is invalid."* | *"Commercial lease document contains a 5-year break option dated 31 March 2027."* |
| *"We certify that Apex Trading Ltd is solvent."* | *"Balance sheet reports net current assets of £88,280.20 and cash reserves of £42,580.20."* |

### Rule 2: Mandatory Advice Disclaimer on All Deliverables
**Severity:** CRITICAL / BLOCKING  
Every client-facing communication (intake response, checklist notification, chase email) and staff-facing document (pre-meeting summary, dossier) must prominently include the statutory disclaimer:

```text
NOTICE: Information only — not professional tax, accounting, or legal advice. 
This administrative summary extracts factual data for review by licensed professionals.
```

In code, this is enforced on `SummaryRecord.advice_disclaimer` and validated in `compliance.py` by `validate_disclaimer_presence()`.

### Rule 3: Low-Confidence Extraction Gating (< 0.85)
**Severity:** HIGH / REVIEW REQUIRED  
Automated extraction (OCR / LLM extraction) carries risk of hallucination or scan corruption:
- If `confidence >= 0.85`: Document may proceed through automated gap checklist evaluation.
- If `confidence < 0.85`: The document **must** set `needs_human_review = True`.
- Any document with `confidence < 0.85` where `needs_human_review == False` is immediately flagged as a compliance violation by `validate_document_record()`.
- Documents flagged for human review are highlighted in the pre-meeting summary under `flagged_items` so professional staff can visually inspect the source scan.

### Rule 4: Gated Workflow Progression (Zero Incomplete Checklists)
**Severity:** HIGH / AUDIT GATED  
- Workflow state `Ready` or `Summary Sent` can **only** be attained when `missing_items` is empty (`len(missing_items) == 0`).
- If any required checklist item (such as `proof_of_address`) is omitted, status must remain `Awaiting Documents` or `Chasing`.
- Gated meeting booking and pre-meeting summary generation cannot transition a client to `Ready` while required documents are absent.

---

## 3. Automated Validation Engine (`compliance.py`)

All agents and pipeline stages can import and execute automated compliance validation:

```python
from agent5_qa_compliance.compliance import (
    validate_compliance,
    assert_compliant,
    ComplianceViolationError
)

# Example: Validate a summary record before dispatching to staff
result = validate_compliance(summary_record)
if not result.passed:
    # Immediately halt pipeline and raise audit violation
    raise ComplianceViolationError("Summary failed compliance", result.violations)
```

### Validator Functions:
1. `validate_compliance(record)`: Polymorphic entry point accepting `ClientRecord`, `DocumentRecord`, `SummaryRecord`, `ReminderRecord`, `dict`, or raw text.
2. `validate_summary_record(summary)`: Ensures disclaimer existence, non-empty profile, and complete absence of forbidden advisory patterns.
3. `validate_document_record(doc)`: Ensures confidence threshold gating (`< 0.85 -> needs_human_review=True`), valid score bounds, and metadata integrity.
4. `validate_text_content(text, is_staff_or_client_facing)`: Scans markdown or plain-text strings for regex patterns indicating unauthorized advice.
5. `assert_compliant(record)`: Hard assertion helper for automated test suites.

---

## 4. Audit & Verification Trail
Every validation execution stamps:
- `checked_at`: ISO 8601 UTC timestamp.
- `violations`: Exhaustive list of rule breaches.
- `warnings`: Actionable warnings (e.g. scan flagged for human review).

This specification guarantees complete compliance with the 5-agent architecture and authoritative contracts in `contracts.py`.
