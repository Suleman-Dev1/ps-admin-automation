# Authoritative Shared Contract Definitions (Standard Library - Zero Dependency)
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Any, List, Optional
import json

class ClientStatus(str, Enum):
    NEW = "New"
    AWAITING_DOCUMENTS = "Awaiting Documents"
    CHASING = "Chasing"
    READY = "Ready"
    MEETING_BOOKED = "Meeting Booked"
    SUMMARY_SENT = "Summary Sent"

VALID_STATUSES = {s.value for s in ClientStatus}

@dataclass
class ContactInfo:
    name: str
    email: str
    phone: str

@dataclass
class DocumentRecord:
    doc_id: str
    client_id: str
    doc_type: str  # classified type, e.g. "bank_statement", "prior_year_accounts", "payroll_summary", "id", "vat_certificate"
    period_covered: str
    key_fields: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0  # 0.0 to 1.0
    needs_human_review: bool = False
    uploaded_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DocumentRecord":
        return cls(
            doc_id=data["doc_id"],
            client_id=data["client_id"],
            doc_type=data["doc_type"],
            period_covered=data.get("period_covered", ""),
            key_fields=data.get("key_fields", {}),
            confidence=float(data.get("confidence", 1.0)),
            needs_human_review=bool(data.get("needs_human_review", False)),
            uploaded_at=data.get("uploaded_at", datetime.now(timezone.utc).isoformat())
        )

@dataclass
class ChecklistConfig:
    business_type: str
    service: str
    required_documents: List[str]
    required_form_fields: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ChecklistConfig":
        return cls(
            business_type=data["business_type"],
            service=data["service"],
            required_documents=list(data.get("required_documents", [])),
            required_form_fields=list(data.get("required_form_fields", []))
        )

@dataclass
class ClientRecord:
    client_id: str
    business_type: str
    service_requested: str
    turnover_band: str
    employee_count: int
    contact: ContactInfo
    status: str = ClientStatus.NEW.value
    checklist_required: List[str] = field(default_factory=list)
    documents_received: List[DocumentRecord] = field(default_factory=list)
    missing_items: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __post_init__(self):
        if self.status not in VALID_STATUSES:
            raise ValueError(f"Invalid status: {self.status}. Must be one of {VALID_STATUSES}")

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        # Ensure documents_received are serialized cleanly
        res["documents_received"] = [d.to_dict() if isinstance(d, DocumentRecord) else d for d in self.documents_received]
        res["contact"] = asdict(self.contact) if isinstance(self.contact, ContactInfo) else self.contact
        return res

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ClientRecord":
        contact_raw = data.get("contact", {})
        contact = ContactInfo(
            name=contact_raw.get("name", ""),
            email=contact_raw.get("email", ""),
            phone=contact_raw.get("phone", "")
        ) if isinstance(contact_raw, dict) else contact_raw

        docs = [
            DocumentRecord.from_dict(d) if isinstance(d, dict) else d
            for d in data.get("documents_received", [])
        ]
        return cls(
            client_id=data["client_id"],
            business_type=data["business_type"],
            service_requested=data["service_requested"],
            turnover_band=data.get("turnover_band", ""),
            employee_count=int(data.get("employee_count", 0)),
            contact=contact,
            status=data.get("status", ClientStatus.NEW.value),
            checklist_required=list(data.get("checklist_required", [])),
            documents_received=docs,
            missing_items=list(data.get("missing_items", [])),
            created_at=data.get("created_at", datetime.now(timezone.utc).isoformat()),
            updated_at=data.get("updated_at", datetime.now(timezone.utc).isoformat())
        )

@dataclass
class ReminderRecord:
    client_id: str
    missing_items: List[str]
    reminder_number: int  # 1st, 2nd, 3rd chase
    sent_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    channel: str = "email"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ReminderRecord":
        return cls(
            client_id=data["client_id"],
            missing_items=list(data.get("missing_items", [])),
            reminder_number=int(data.get("reminder_number", 1)),
            sent_at=data.get("sent_at", datetime.now(timezone.utc).isoformat()),
            channel=data.get("channel", "email")
        )

@dataclass
class SummaryRecord:
    client_id: str
    business_profile: str
    service_requested: str
    documents_received: List[str]
    key_figures_extracted: Dict[str, Any] = field(default_factory=dict)
    open_questions: List[str] = field(default_factory=list)
    flagged_items: List[str] = field(default_factory=list)
    advice_disclaimer: str = "NOTICE: Information only — not professional tax, accounting, or legal advice. This administrative summary extracts factual data for review by licensed professionals."
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def __post_init__(self):
        if not self.advice_disclaimer or not self.advice_disclaimer.strip():
            raise ValueError("advice_disclaimer must always be present and non-empty.")

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SummaryRecord":
        return cls(
            client_id=data["client_id"],
            business_profile=data["business_profile"],
            service_requested=data["service_requested"],
            documents_received=list(data.get("documents_received", [])),
            key_figures_extracted=data.get("key_figures_extracted", {}),
            open_questions=list(data.get("open_questions", [])),
            flagged_items=list(data.get("flagged_items", [])),
            advice_disclaimer=data.get("advice_disclaimer", "NOTICE: Information only — not professional tax, accounting, or legal advice. This administrative summary extracts factual data for review by licensed professionals."),
            generated_at=data.get("generated_at", datetime.now(timezone.utc).isoformat())
        )
