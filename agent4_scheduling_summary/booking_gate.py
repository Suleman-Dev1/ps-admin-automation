"""
Booking Gate Module - Agent 4 (Scheduling & Summary)
Enforces gated calendar booking rules based on document checklist completion.
"""

from datetime import datetime, timezone
from typing import Optional, Tuple

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from contracts import ClientRecord, ClientStatus


class BookingGateError(Exception):
    """Base exception for booking gate operations."""
    pass


class BookingLockedError(BookingGateError, ValueError):
    """Raised when an action is attempted on a locked booking gate."""
    pass


DEFAULT_BOOKING_BASE_URL = "https://booking.firm.example/schedule"


def check_booking_eligibility(
    client_record: ClientRecord,
    base_booking_url: str = DEFAULT_BOOKING_BASE_URL
) -> Tuple[bool, str, Optional[str]]:
    """
    Evaluates whether a client is eligible to book a meeting.

    Rules:
    - If `client_record.missing_items` is non-empty:
        LOCKED -> returns (False, "Missing required onboarding documents: <items>", None)
    - If `client_record.missing_items` is empty:
        UNLOCKED -> returns (True, "All documents received", "https://booking.firm.example/schedule?client_id=...")
    """
    missing_items = client_record.missing_items or []
    if len(missing_items) > 0:
        missing_str = ", ".join(missing_items)
        return (
            False,
            f"Missing required onboarding documents: {missing_str}",
            None,
        )

    booking_link = f"{base_booking_url}?client_id={client_record.client_id}"
    return (
        True,
        "All documents received",
        booking_link,
    )


def book_meeting(client_record: ClientRecord, slot_time: str) -> ClientRecord:
    """
    Validates eligibility and books a meeting slot.

    - Validates eligibility via check_booking_eligibility().
    - If locked (missing items), raises BookingLockedError.
    - If unlocked, transitions `client_record.status` to "Meeting Booked"
      and updates `client_record.updated_at`.
    - Returns the updated ClientRecord.
    """
    if not slot_time or not slot_time.strip():
        raise ValueError("slot_time must be provided and non-empty.")

    is_eligible, reason, _ = check_booking_eligibility(client_record)
    if not is_eligible:
        raise BookingLockedError(
            f"Cannot book meeting for client '{client_record.client_id}': {reason}"
        )

    client_record.status = ClientStatus.MEETING_BOOKED.value
    client_record.updated_at = datetime.now(timezone.utc).isoformat()
    # Record slot time dynamically for administrative tracking
    setattr(client_record, "booked_slot", slot_time.strip())

    return client_record
