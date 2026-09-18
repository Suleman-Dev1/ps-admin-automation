"""Reminder Generator for Agent 3.

Produces contract-compliant ReminderRecord instances alongside full
rendered email artifacts (subject, plain text, responsive HTML, upload link).
"""

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import os
import sys

# Ensure contracts can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from contracts import ClientRecord, ReminderRecord
from agent3_followup.gap_detector import detect_gaps
from agent3_followup.templates import render_reminder_content, DISCLAIMER_NOTICE


@dataclass
class GeneratedEmail:
    """Full rendered email artifact."""
    subject: str
    body_text: str
    body_html: str
    recipient_email: str
    recipient_name: str
    upload_url: str
    reminder_number: int
    missing_items: List[str]
    disclaimer: str = DISCLAIMER_NOTICE

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RenderedReminder:
    """Combines authoritative ReminderRecord with complete generated communication artifacts."""
    reminder_record: ReminderRecord
    email: GeneratedEmail

    def to_dict(self) -> Dict[str, Any]:
        return {
            "reminder_record": self.reminder_record.to_dict(),
            "email": self.email.to_dict()
        }


def generate_reminder(
    client_record: ClientRecord,
    reminder_number: int = 1,
    upload_base_url: str = "https://portal.ps-admin.com/upload",
    firm_name: str = "PS Professional Services",
    custom_sent_at: Optional[str] = None
) -> RenderedReminder:
    """Generate a contract-compliant ReminderRecord and full email artifact.

    Args:
        client_record: The ClientRecord requiring follow-up.
        reminder_number: 1 (Day 2 check-in), 2 (Day 5 review on hold), 3 (Day 9 final notice).
        upload_base_url: Base URL for document portal.
        firm_name: Firm title used in communication.
        custom_sent_at: Optional ISO timestamp override for testing/backdating.

    Returns:
        RenderedReminder containing the ReminderRecord and GeneratedEmail.
    """
    if reminder_number not in (1, 2, 3):
        # Allow numbers > 3 if needed, but standard escalation is 1, 2, 3
        if reminder_number < 1:
            raise ValueError(f"reminder_number must be >= 1, got {reminder_number}")

    # Ensure gap detection is fresh
    if not client_record.missing_items:
        detect_gaps(client_record)

    missing_items = list(client_record.missing_items)
    if not missing_items:
        raise ValueError(f"Client {client_record.client_id} has no missing items; cannot generate reminder.")

    sent_at = custom_sent_at or datetime.now(timezone.utc).isoformat()
    upload_url = f"{upload_base_url.rstrip('/')}/{client_record.client_id}"

    # Generate complete professional email artifacts
    subject, body_text, body_html = render_reminder_content(
        reminder_number=reminder_number,
        client_id=client_record.client_id,
        client_name=client_record.contact.name or client_record.client_id,
        service_requested=client_record.service_requested or "Administrative Onboarding",
        missing_items=missing_items,
        upload_url=upload_url,
        firm_name=firm_name
    )

    # Instantiate authoritative ReminderRecord strictly matching contracts.py
    reminder_record = ReminderRecord(
        client_id=client_record.client_id,
        missing_items=missing_items,
        reminder_number=reminder_number,
        sent_at=sent_at,
        channel="email"
    )

    email = GeneratedEmail(
        subject=subject,
        body_text=body_text,
        body_html=body_html,
        recipient_email=client_record.contact.email,
        recipient_name=client_record.contact.name,
        upload_url=upload_url,
        reminder_number=reminder_number,
        missing_items=missing_items,
        disclaimer=DISCLAIMER_NOTICE
    )

    return RenderedReminder(reminder_record=reminder_record, email=email)
