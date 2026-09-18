"""
Summary Generator Module - Agent 4 (Scheduling & Summary)
Compiles pre-meeting administrative staff briefings conforming strictly to SummaryRecord schema.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contracts import ClientRecord, ClientStatus, DocumentRecord, SummaryRecord

MANDATORY_ADVICE_DISCLAIMER = (
    "NOTICE: Information only — not professional tax, accounting, or legal advice. "
    "This administrative summary extracts factual data for review by licensed professionals."
)


def _build_business_profile(client_record: ClientRecord) -> str:
    """
    Constructs a concise factual business profile string.
    Example: 'Apex Trading Ltd, Ltd company, Turnover £500k - £1m, 5 employees, Contact: John Smith (john@apextrading.co.uk)'
    """
    # 1. Look for business or company name in extracted doc fields
    business_name: Optional[str] = None
    for doc in client_record.documents_received:
        if isinstance(doc, DocumentRecord) and isinstance(doc.key_fields, dict):
            for candidate in ("company_name", "business_name", "entity_name", "client_name", "trading_name"):
                val = doc.key_fields.get(candidate)
                if val:
                    business_name = str(val).strip()
                    break
        if business_name:
            break

    # If not found in document key fields:
    if not business_name:
        btype_lower = (client_record.business_type or "").lower()
        if any(term in btype_lower for term in ("sole trader", "individual", "freelancer", "personal")):
            business_name = client_record.contact.name or client_record.client_id
        else:
            business_name = client_record.client_id

    parts: List[str] = [business_name]

    if client_record.business_type:
        parts.append(client_record.business_type)

    if client_record.turnover_band:
        parts.append(f"Turnover {client_record.turnover_band}")

    if client_record.employee_count is not None and client_record.employee_count > 0:
        parts.append(f"{client_record.employee_count} employees")
    elif client_record.employee_count == 0:
        parts.append("0 employees")

    contact_parts: List[str] = []
    if client_record.contact.name:
        contact_parts.append(client_record.contact.name)
    if client_record.contact.email:
        contact_parts.append(client_record.contact.email)
    elif client_record.contact.phone:
        contact_parts.append(client_record.contact.phone)

    if contact_parts:
        if len(contact_parts) > 1:
            parts.append(f"Contact: {contact_parts[0]} ({', '.join(contact_parts[1:])})")
        else:
            parts.append(f"Contact: {contact_parts[0]}")

    return ", ".join(parts)


def _aggregate_key_figures(client_record: ClientRecord) -> Dict[str, Any]:
    """
    Aggregates factual key figures extracted from all received documents.
    Preserves all extracted facts without losing context.
    """
    aggregated: Dict[str, Any] = {}
    for doc in client_record.documents_received:
        if not isinstance(doc, DocumentRecord) or not isinstance(doc.key_fields, dict):
            continue
        for k, v in doc.key_fields.items():
            if k not in aggregated:
                aggregated[k] = v
            else:
                # If distinct duplicate key exists, store scoped key
                if aggregated[k] != v:
                    scoped_key = f"{doc.doc_type}_{k}"
                    aggregated[scoped_key] = v

    # Convenience aliases for standard figures if present
    if "closing_balance" in aggregated and "bank_closing_balance" not in aggregated:
        aggregated["bank_closing_balance"] = aggregated["closing_balance"]

    return aggregated


def _extract_flagged_items(client_record: ClientRecord) -> List[str]:
    """
    Identifies all document items where needs_human_review is True or confidence < 0.85.
    """
    flagged: List[str] = []
    for doc in client_record.documents_received:
        if not isinstance(doc, DocumentRecord):
            continue
        flags: List[str] = []
        if doc.needs_human_review:
            flags.append("flagged for human review")
        if doc.confidence < 0.85:
            flags.append(f"low confidence ({doc.confidence:.2f} < 0.85)")

        if flags:
            flagged.append(f"Document '{doc.doc_type}' (ID: {doc.doc_id}): {', '.join(flags)}")

    return flagged


def _generate_open_questions(
    client_record: ClientRecord,
    key_figures: Dict[str, Any],
    flagged_items: List[str]
) -> List[str]:
    """
    Generates factual, administrative open questions for staff to ask during the meeting.
    Arises from missing details, unverified dates, low confidence items, or outstanding requirements.
    """
    questions: List[str] = []

    # 1. Missing item follow-ups
    if client_record.missing_items:
        for item in client_record.missing_items:
            questions.append(f"Request status update on outstanding onboarding item: {item}")

    # 2. Check for missing period coverage in received documents
    for doc in client_record.documents_received:
        if isinstance(doc, DocumentRecord):
            if not doc.period_covered or not doc.period_covered.strip():
                questions.append(
                    f"Confirm accounting/statement period covered for received document: '{doc.doc_type}' (ID: {doc.doc_id})"
                )

    # 3. Low confidence / human review follow-up questions
    for doc in client_record.documents_received:
        if isinstance(doc, DocumentRecord):
            if doc.needs_human_review:
                questions.append(f"Clarify and verify extracted figures for '{doc.doc_type}' with client during meeting")
            elif doc.confidence < 0.85:
                questions.append(f"Confirm extracted details for '{doc.doc_type}' due to OCR confidence below threshold ({doc.confidence:.0%})")

    # 4. Critical financial figure checks based on requested service
    srv_lower = (client_record.service_requested or "").lower()

    if "turnover" not in key_figures and "gross_sales" not in key_figures:
        questions.append("Verify exact annual turnover figure with client during consultation")

    if any(s in srv_lower for srv_lower_item in ("account", "tax", "audit") for s in [srv_lower_item]):
        if "net_profit" not in key_figures and "profit" not in key_figures:
            questions.append("Confirm net profit/loss position from recent management accounts or prior year filings")

    if "vat" in srv_lower or "vat_certificate" in [getattr(d, "doc_type", "") for d in client_record.documents_received]:
        if "vat_number" not in key_figures:
            questions.append("Confirm VAT registration number and effective registration date")

    # 5. Fallback general administrative checks if questions list is sparse
    if len(questions) < 2:
        questions.append("Confirm whether there have been any material changes in business activities, directors, or shareholding over the past 12 months")
        questions.append("Verify primary commercial bank accounts and third-party payment gateways currently in operation")

    # Remove duplicates while preserving order
    unique_questions: List[str] = []
    seen = set()
    for q in questions:
        if q not in seen:
            seen.add(q)
            unique_questions.append(q)

    return unique_questions


def generate_summary(client_record: ClientRecord) -> SummaryRecord:
    """
    Generates a pre-meeting staff SummaryRecord strictly conforming to contracts.py:
    - client_id: str
    - business_profile: concise factual summary
    - service_requested: str
    - documents_received: list of doc_types received
    - key_figures_extracted: aggregated dictionary of facts from documents_received
    - open_questions: list of factual questions for staff to ask
    - flagged_items: list of items where needs_human_review is true or confidence < 0.85
    - advice_disclaimer: NON-EMPTY MANDATORY statutory notice
    - generated_at: ISO timestamp

    Transitions client_record.status to 'Summary Sent'.
    """
    business_profile = _build_business_profile(client_record)
    key_figures = _aggregate_key_figures(client_record)
    flagged_items = _extract_flagged_items(client_record)
    open_questions = _generate_open_questions(client_record, key_figures, flagged_items)

    doc_types_received: List[str] = [
        doc.doc_type if isinstance(doc, DocumentRecord) else str(doc)
        for doc in client_record.documents_received
    ]

    now_iso = datetime.now(timezone.utc).isoformat()

    summary = SummaryRecord(
        client_id=client_record.client_id,
        business_profile=business_profile,
        service_requested=client_record.service_requested,
        documents_received=doc_types_received,
        key_figures_extracted=key_figures,
        open_questions=open_questions,
        flagged_items=flagged_items,
        advice_disclaimer=MANDATORY_ADVICE_DISCLAIMER,
        generated_at=now_iso,
    )

    # State transition on client_record
    client_record.status = ClientStatus.SUMMARY_SENT.value
    client_record.updated_at = now_iso

    return summary
