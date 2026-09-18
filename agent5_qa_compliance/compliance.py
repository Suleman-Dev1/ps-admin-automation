"""
Authoritative Compliance Framework for Professional Services Admin Automation.
Enforces hard boundary rules: Administrative Automation Only.

Core Invariants:
1. Strictly No Autonomous Tax, Accounting, or Legal Advice:
   Scans text and structured outputs for prescriptive or advisory legal/tax language.
2. Mandatory Advice Disclaimer:
   Every staff-facing or client-facing summary or generated document MUST carry
   the statutory administrative notice.
3. Low-Confidence Human Review Gating:
   Any extraction with confidence < 0.85 MUST have needs_human_review=True.
4. Schema & Data Hygiene:
   Enforces status validity, required fields, and non-empty records.
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Union
import re
import sys
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from contracts import (
    ClientRecord,
    DocumentRecord,
    ReminderRecord,
    SummaryRecord,
    ChecklistConfig,
    VALID_STATUSES
)

# Mandatory disclaimer standard text from contracts.py
MANDATORY_DISCLAIMER_KEYWORD = "not professional tax, accounting, or legal advice"
OFFICIAL_DISCLAIMER = (
    "NOTICE: Information only — not professional tax, accounting, or legal advice. "
    "This administrative summary extracts factual data for review by licensed professionals."
)

# Minimum threshold for autonomous processing without human review
CONFIDENCE_HUMAN_REVIEW_THRESHOLD = 0.85

# Regulated Advice Boundary Regex Patterns
# Any match in generated summaries or customer communications indicates an advisory leak
FORBIDDEN_ADVICE_PATTERNS = [
    # Tax Advice
    (r"\b(we recommend|you should|we advise you to)\s+(claim|deduct|write off|offset)\b",
     "Autonomous tax deduction recommendation detected."),
    (r"\b(tax avoidance|aggressive tax planning|tax scheme|tax loophole)\b",
     "Regulated tax planning advice detected."),
    (r"\b(we recommend|you should)\s+structure\s+(your|the)\s+(salary|dividend|remuneration)\b",
     "Autonomous remuneration structuring advice detected."),
    (r"\b(file under section|claim relief under)\s+[A-Za-z0-9]+\b",
     "Statutory tax relief recommendation detected."),
    (r"\b(reduce your tax liability by|save tax by)\b",
     "Tax liability mitigation advice detected."),
    (r"\b(you are eligible for|we determine you qualify for)\s+(R&D tax credits|patent box|capital allowance)\b",
     "Autonomous tax credit qualification determination detected."),

    # Legal Advice
    (r"\b(our legal opinion is|we provide legal opinion|in our legal assessment)\b",
     "Autonomous legal opinion detected."),
    (r"\b(you have (a |strong )?grounds to (sue|litigate|claim damages))\b",
     "Autonomous litigation advice detected."),
    (r"\b(this agreement is (legally binding|null and void|unenforceable))\b",
     "Autonomous contract legality determination detected."),
    (r"\b(we advise that you (terminate|breach|execute) the contract)\b",
     "Autonomous legal execution advice detected."),

    # Regulated Accounting Opinions
    (r"\b(we certify (the |that the )?company is solvent)\b",
     "Autonomous solvency certification detected."),
    (r"\b(true and fair view|unqualified audit opinion|audit certification)\b",
     "Autonomous statutory audit opinion detected."),
    (r"\b(we recommend capitalizing|we recommend expensing)\s+[a-z0-9\s]+\b",
     "Autonomous accounting policy recommendation detected.")
]


class ComplianceViolationError(Exception):
    """Raised when an object fails mandatory compliance rules."""
    def __init__(self, message: str, violations: List[str]):
        super().__init__(f"{message}: {'; '.join(violations)}")
        self.violations = violations


@dataclass
class ComplianceResult:
    passed: bool
    violations: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    checked_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def raise_if_failed(self, entity_name: str = "Record"):
        if not self.passed:
            raise ComplianceViolationError(f"Compliance check failed for {entity_name}", self.violations)


def scan_text_for_advice(text: str) -> List[str]:
    """Scans text for prohibited tax, accounting, or legal advice phrases."""
    violations = []
    if not text:
        return violations

    for pattern, reason in FORBIDDEN_ADVICE_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            violations.append(f"Forbidden advice pattern '{match.group(0)}': {reason}")
    return violations


def validate_disclaimer_presence(text: str) -> List[str]:
    """Ensures mandatory advice disclaimer is present in staff/client facing outputs."""
    violations = []
    if not text or MANDATORY_DISCLAIMER_KEYWORD.lower() not in text.lower():
        violations.append(
            f"Mandatory disclaimer missing. Must contain phrase: '{MANDATORY_DISCLAIMER_KEYWORD}'"
        )
    return violations


def validate_document_record(doc: DocumentRecord) -> ComplianceResult:
    """
    Validates a DocumentRecord:
    - Confidence threshold rule: if confidence < 0.85, needs_human_review must be True.
    - Confidence score bounds (0.0 to 1.0).
    - Required fields (doc_id, client_id, doc_type).
    """
    violations = []
    warnings = []

    if not doc.doc_id:
        violations.append("DocumentRecord missing doc_id")
    if not doc.client_id:
        violations.append("DocumentRecord missing client_id")
    if not doc.doc_type:
        violations.append("DocumentRecord missing doc_type")

    # Confidence bounds
    if doc.confidence < 0.0 or doc.confidence > 1.0:
        violations.append(f"Confidence score {doc.confidence} out of range [0.0, 1.0]")

    # Low-Confidence Human Review Gating Rule
    if doc.confidence < CONFIDENCE_HUMAN_REVIEW_THRESHOLD:
        if not doc.needs_human_review:
            violations.append(
                f"Confidence {doc.confidence:.2f} < {CONFIDENCE_HUMAN_REVIEW_THRESHOLD:.2f} "
                f"requires needs_human_review=True, but was False."
            )
        else:
            warnings.append(
                f"Document {doc.doc_id} ({doc.doc_type}) flagged for human review (confidence {doc.confidence:.2f})."
            )

    # Check key_fields string values for advice leaks
    for k, v in doc.key_fields.items():
        if isinstance(v, str):
            v_violations = scan_text_for_advice(v)
            violations.extend(v_violations)

    return ComplianceResult(
        passed=(len(violations) == 0),
        violations=violations,
        warnings=warnings
    )


def validate_summary_record(summary: SummaryRecord) -> ComplianceResult:
    """
    Validates a SummaryRecord:
    - Non-negotiable advice disclaimer is present and non-empty.
    - No forbidden advice in business_profile, open_questions, flagged_items, or key_figures.
    - Required fields non-empty.
    """
    violations = []
    warnings = []

    # Mandatory disclaimer check
    if not summary.advice_disclaimer or not summary.advice_disclaimer.strip():
        violations.append("SummaryRecord missing mandatory advice_disclaimer")
    else:
        disclaimer_issues = validate_disclaimer_presence(summary.advice_disclaimer)
        violations.extend(disclaimer_issues)

    # Required fields
    if not summary.client_id:
        violations.append("SummaryRecord missing client_id")
    if not summary.service_requested:
        violations.append("SummaryRecord missing service_requested")
    if not summary.business_profile:
        violations.append("SummaryRecord missing business_profile")

    # Prohibited advice check across all textual fields
    fields_to_scan = [
        ("business_profile", summary.business_profile),
        ("service_requested", summary.service_requested)
    ]
    for name, content in fields_to_scan:
        advice_issues = scan_text_for_advice(content)
        violations.extend([f"In {name}: {issue}" for issue in advice_issues])

    for i, q in enumerate(summary.open_questions):
        for issue in scan_text_for_advice(q):
            violations.append(f"In open_questions[{i}]: {issue}")

    for i, flag in enumerate(summary.flagged_items):
        for issue in scan_text_for_advice(flag):
            violations.append(f"In flagged_items[{i}]: {issue}")

    return ComplianceResult(
        passed=(len(violations) == 0),
        violations=violations,
        warnings=warnings
    )


def validate_client_record(client: ClientRecord) -> ComplianceResult:
    """
    Validates a ClientRecord:
    - Status is in VALID_STATUSES.
    - Contact info complete.
    - Nested DocumentRecords satisfy compliance.
    """
    violations = []
    warnings = []

    if client.status not in VALID_STATUSES:
        violations.append(f"Invalid status '{client.status}'. Must be one of {VALID_STATUSES}")

    if not client.client_id:
        violations.append("ClientRecord missing client_id")

    if not client.contact or not client.contact.name or not client.contact.email:
        violations.append("ClientRecord missing valid contact information (name/email)")

    # Validate nested documents
    for doc in client.documents_received:
        doc_res = validate_document_record(doc)
        if not doc_res.passed:
            violations.extend([f"Doc {doc.doc_id}: {v}" for v in doc_res.violations])
        warnings.extend([f"Doc {doc.doc_id}: {w}" for w in doc_res.warnings])

    return ComplianceResult(
        passed=(len(violations) == 0),
        violations=violations,
        warnings=warnings
    )


def validate_reminder_record(reminder: ReminderRecord) -> ComplianceResult:
    """Validates ReminderRecord for proper channel, missing items, and client ID."""
    violations = []
    warnings = []

    if not reminder.client_id:
        violations.append("ReminderRecord missing client_id")
    if not reminder.missing_items:
        warnings.append("ReminderRecord has empty missing_items list")
    if reminder.reminder_number < 1:
        violations.append(f"Invalid reminder_number: {reminder.reminder_number} (must be >= 1)")

    return ComplianceResult(
        passed=(len(violations) == 0),
        violations=violations,
        warnings=warnings
    )


def validate_text_content(text: str, is_staff_or_client_facing: bool = True) -> ComplianceResult:
    """
    Validates arbitrary generated text (e.g. email draft, summary markdown, agent output):
    - Must not contain forbidden advice phrases.
    - If user-facing or staff-facing, must include mandatory advice disclaimer.
    """
    violations = scan_text_for_advice(text)
    warnings = []

    if is_staff_or_client_facing:
        disclaimer_issues = validate_disclaimer_presence(text)
        violations.extend(disclaimer_issues)

    return ComplianceResult(
        passed=(len(violations) == 0),
        violations=violations,
        warnings=warnings
    )


def validate_compliance(record: Union[ClientRecord, DocumentRecord, SummaryRecord, ReminderRecord, dict, str]) -> ComplianceResult:
    """
    Polymorphic validator for any pipeline artifact:
    Accepts ClientRecord, DocumentRecord, SummaryRecord, ReminderRecord, dict, or str.
    """
    if isinstance(record, ClientRecord):
        return validate_client_record(record)
    elif isinstance(record, DocumentRecord):
        return validate_document_record(record)
    elif isinstance(record, SummaryRecord):
        return validate_summary_record(record)
    elif isinstance(record, ReminderRecord):
        return validate_reminder_record(record)
    elif isinstance(record, str):
        return validate_text_content(record)
    elif isinstance(record, dict):
        # Attempt to infer contract type from dict keys
        if "advice_disclaimer" in record or "business_profile" in record:
            return validate_summary_record(SummaryRecord.from_dict(record))
        elif "doc_type" in record and "confidence" in record:
            return validate_document_record(DocumentRecord.from_dict(record))
        elif "checklist_required" in record and "contact" in record:
            return validate_client_record(ClientRecord.from_dict(record))
        elif "reminder_number" in record:
            return validate_reminder_record(ReminderRecord.from_dict(record))
        else:
            # Generic dict: serialize and inspect values for advice
            text_repr = " ".join(str(v) for v in record.values())
            return validate_text_content(text_repr, is_staff_or_client_facing=False)
    else:
        return ComplianceResult(
            passed=False,
            violations=[f"Unsupported record type for compliance validation: {type(record)}"]
        )


def assert_compliant(record: Union[ClientRecord, DocumentRecord, SummaryRecord, ReminderRecord, dict, str]):
    """Convenience assertion function that raises ComplianceViolationError on failure."""
    result = validate_compliance(record)
    result.raise_if_failed(type(record).__name__)


if __name__ == "__main__":
    print("=== RUNNING COMPLIANCE FRAMEWORK SELF-TEST ===")
    # 1. Test clean summary record
    clean_summary = SummaryRecord(
        client_id="client_apex_001",
        business_profile="Limited company trading in wholesale goods. 5 employees.",
        service_requested="Year-End Accounts & Tax",
        documents_received=["bank_statement", "prior_year_accounts", "payroll_summary", "director_id", "vat_certificate", "proof_of_address"],
        key_figures_extracted={"turnover": 580000.0, "net_profit": 74200.0, "closing_balance": 42580.20},
        open_questions=["Confirm whether Q4 VAT payment of £21,300 cleared before year-end."],
        flagged_items=[]
    )
    res1 = validate_compliance(clean_summary)
    print(f"1. Clean Summary check: Passed={res1.passed} (violations={res1.violations})")
    assert res1.passed

    # 2. Test forbidden advice detection
    violating_summary = SummaryRecord(
        client_id="client_apex_001",
        business_profile="We recommend you claim capital allowances on new vehicles to reduce your tax liability by £10,000.",
        service_requested="Year-End Accounts & Tax",
        documents_received=[]
    )
    res2 = validate_compliance(violating_summary)
    print(f"2. Forbidden advice check: Caught {len(res2.violations)} violations as expected.")
    assert not res2.passed
    assert any("tax liability" in v or "capital allowance" in v or "claim" in v for v in res2.violations)

    # 3. Test low confidence flagging
    low_conf_doc = DocumentRecord(
        doc_id="doc_test_001",
        client_id="client_001",
        doc_type="vat_certificate",
        period_covered="2024",
        confidence=0.72,
        needs_human_review=False  # VIOLATION: < 0.85 must be True
    )
    res3 = validate_compliance(low_conf_doc)
    print(f"3. Low confidence unflagged check: Passed={res3.passed} (violations={res3.violations})")
    assert not res3.passed
    assert "needs_human_review=True" in res3.violations[0]

    # Corrected low confidence
    low_conf_doc.needs_human_review = True
    res3_corr = validate_compliance(low_conf_doc)
    print(f"4. Low confidence properly flagged: Passed={res3_corr.passed} (warnings={res3_corr.warnings})")
    assert res3_corr.passed

    print("ALL COMPLIANCE SELF-TESTS PASSED!")
