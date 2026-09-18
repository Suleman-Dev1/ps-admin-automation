"""
Agent 4: Scheduling & Summary Package
Gated Booking and Staff Summary System for Professional Services Automation.
"""

from agent4_scheduling_summary.booking_gate import (
    check_booking_eligibility,
    book_meeting,
    BookingGateError,
    BookingLockedError,
    DEFAULT_BOOKING_BASE_URL,
)

from agent4_scheduling_summary.summary_generator import (
    generate_summary,
    MANDATORY_ADVICE_DISCLAIMER,
)

from agent4_scheduling_summary.briefing_renderer import (
    render_briefing_markdown,
    render_staff_briefing,
)

from contracts import (
    ClientRecord,
    ClientStatus,
    DocumentRecord,
    SummaryRecord,
    ContactInfo,
    ChecklistConfig,
    ReminderRecord,
)

__all__ = [
    "check_booking_eligibility",
    "book_meeting",
    "BookingGateError",
    "BookingLockedError",
    "DEFAULT_BOOKING_BASE_URL",
    "generate_summary",
    "MANDATORY_ADVICE_DISCLAIMER",
    "render_briefing_markdown",
    "render_staff_briefing",
    "ClientRecord",
    "ClientStatus",
    "DocumentRecord",
    "SummaryRecord",
    "ContactInfo",
    "ChecklistConfig",
    "ReminderRecord",
]
