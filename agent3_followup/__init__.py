"""Agent 3 — Follow-up Agent: Gap-Detection and Automated Follow-up Reminders.

Provides:
- detect_gaps: Compares required documents against received documents,
               identifies missing items, and transitions status to 'Chasing'.
- generate_reminder: Generates ReminderRecord and rendered communication artifacts
                     with escalating tone across Chase 1 (Day 2), Chase 2 (Day 5),
                     and Chase 3 (Day 9).
- ReminderStore: In-memory or JSON-persisted record store for sent reminders.
- ReminderDispatcher: High-level coordinator for schedule-based and manual dispatching.
"""

from agent3_followup.gap_detector import detect_gaps
from agent3_followup.generator import (
    generate_reminder,
    RenderedReminder,
    GeneratedEmail,
)
from agent3_followup.store import ReminderStore
from agent3_followup.dispatcher import ReminderDispatcher
from agent3_followup.templates import DISCLAIMER_NOTICE

__all__ = [
    "detect_gaps",
    "generate_reminder",
    "RenderedReminder",
    "GeneratedEmail",
    "ReminderStore",
    "ReminderDispatcher",
    "DISCLAIMER_NOTICE",
]
