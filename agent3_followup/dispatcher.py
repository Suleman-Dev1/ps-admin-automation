"""Reminder Dispatcher for Agent 3.

Orchestrates gap detection, reminder scheduling, escalation tier selection,
and recording to the store.
"""

from typing import List, Optional
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from contracts import ClientRecord
from agent3_followup.gap_detector import detect_gaps
from agent3_followup.generator import generate_reminder, RenderedReminder
from agent3_followup.store import ReminderStore


class ReminderDispatcher:
    """Dispatches follow-up reminders with schedule & tone escalation."""

    def __init__(
        self,
        store: Optional[ReminderStore] = None,
        upload_base_url: str = "https://portal.ps-admin.com/upload",
        firm_name: str = "PS Professional Services"
    ):
        self.store = store or ReminderStore()
        self.upload_base_url = upload_base_url
        self.firm_name = firm_name

    def check_and_dispatch(
        self,
        client_record: ClientRecord,
        force_tier: Optional[int] = None,
        custom_sent_at: Optional[str] = None
    ) -> Optional[RenderedReminder]:
        """Run gap detection and dispatch the appropriate escalating reminder.

        Args:
            client_record: The ClientRecord to inspect and chase.
            force_tier: Explicit reminder tier (1, 2, or 3). If None, advances
                        based on previously sent reminders for this client.
            custom_sent_at: Optional ISO timestamp override.

        Returns:
            RenderedReminder if missing items exist and reminder was generated,
            or None if no gaps are present.
        """
        # Run gap detection
        missing = detect_gaps(client_record)
        if not missing:
            return None

        # Determine reminder tier
        if force_tier is not None:
            tier = force_tier
        else:
            previous_count = self.store.count_for_client(client_record.client_id)
            tier = min(previous_count + 1, 3)

        rendered = generate_reminder(
            client_record=client_record,
            reminder_number=tier,
            upload_base_url=self.upload_base_url,
            firm_name=self.firm_name,
            custom_sent_at=custom_sent_at
        )

        # Record in store
        self.store.record(rendered)
        return rendered

    def evaluate_schedule_trigger(
        self,
        client_record: ClientRecord,
        days_elapsed: int,
        custom_sent_at: Optional[str] = None
    ) -> Optional[RenderedReminder]:
        """Dispatch reminder according to formal elapsed day milestones:
        - Day 2 to 4: Chase 1 (if not already sent)
        - Day 5 to 8: Chase 2 (if Chase 1 was sent and Chase 2 not sent)
        - Day 9+: Chase 3 (if Chase 2 was sent and Chase 3 not sent)

        Args:
            client_record: The ClientRecord.
            days_elapsed: Number of days since onboarding intake started.
            custom_sent_at: Optional timestamp override.

        Returns:
            RenderedReminder if triggered, or None.
        """
        missing = detect_gaps(client_record)
        if not missing:
            return None

        sent_history = self.store.get_by_client_id(client_record.client_id)
        sent_tiers = {r.reminder_record.reminder_number for r in sent_history}

        target_tier = None
        if days_elapsed >= 9:
            if 3 not in sent_tiers:
                target_tier = 3
        elif days_elapsed >= 5:
            if 2 not in sent_tiers:
                target_tier = 2
        elif days_elapsed >= 2:
            if 1 not in sent_tiers:
                target_tier = 1

        if target_tier is None:
            return None

        return self.check_and_dispatch(
            client_record=client_record,
            force_tier=target_tier,
            custom_sent_at=custom_sent_at
        )
