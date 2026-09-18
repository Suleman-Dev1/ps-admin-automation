"""Reminder Store for recording and persisting sent reminders and rendered artifacts.

Supports in-memory operations and JSON persistence (e.g., sent_reminders.json),
as well as exporting full rendered HTML/text communication artifacts to disk.
"""

import json
import os
import sys
from typing import List, Dict, Any, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from contracts import ReminderRecord
from agent3_followup.generator import RenderedReminder, GeneratedEmail


class ReminderStore:
    """Stores sent reminders in-memory or persisted to a JSON file."""

    def __init__(self, storage_path: Optional[str] = None):
        """Initialize the store.

        Args:
            storage_path: Optional path to sent_reminders.json. If None, operates purely in-memory.
        """
        self.storage_path = storage_path
        self._reminders: List[RenderedReminder] = []
        if self.storage_path and os.path.exists(self.storage_path):
            self.load()

    def record(self, rendered_reminder: RenderedReminder) -> None:
        """Record a sent reminder and persist if storage_path is set."""
        self._reminders.append(rendered_reminder)
        if self.storage_path:
            self.save()

    def get_by_client_id(self, client_id: str) -> List[RenderedReminder]:
        """Retrieve all rendered reminders for a specific client."""
        return [r for r in self._reminders if r.reminder_record.client_id == client_id]

    def get_all(self) -> List[RenderedReminder]:
        """Retrieve all recorded rendered reminders."""
        return list(self._reminders)

    def get_reminder_records(self) -> List[ReminderRecord]:
        """Retrieve all authoritative ReminderRecord instances."""
        return [r.reminder_record for r in self._reminders]

    def count_for_client(self, client_id: str) -> int:
        """Count how many reminders have been sent to this client."""
        return len(self.get_by_client_id(client_id))

    def save(self) -> None:
        """Save stored reminders to JSON file."""
        if not self.storage_path:
            return
        os.makedirs(os.path.dirname(os.path.abspath(self.storage_path)), exist_ok=True)
        data = [r.to_dict() for r in self._reminders]
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def load(self) -> None:
        """Load stored reminders from JSON file."""
        if not self.storage_path or not os.path.exists(self.storage_path):
            return
        with open(self.storage_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self._reminders = []
        for item in data:
            rec_dict = item.get("reminder_record", {})
            email_dict = item.get("email", {})
            record = ReminderRecord.from_dict(rec_dict)
            email = GeneratedEmail(
                subject=email_dict.get("subject", ""),
                body_text=email_dict.get("body_text", ""),
                body_html=email_dict.get("body_html", ""),
                recipient_email=email_dict.get("recipient_email", ""),
                recipient_name=email_dict.get("recipient_name", ""),
                upload_url=email_dict.get("upload_url", ""),
                reminder_number=email_dict.get("reminder_number", 1),
                missing_items=email_dict.get("missing_items", []),
                disclaimer=email_dict.get("disclaimer", "")
            )
            self._reminders.append(RenderedReminder(reminder_record=record, email=email))

    def export_communications(self, output_dir: str) -> List[str]:
        """Export all rendered communications as .html and .txt files to output_dir.

        Returns:
            List of generated file paths.
        """
        os.makedirs(output_dir, exist_ok=True)
        written_paths = []
        for r in self._reminders:
            cid = r.reminder_record.client_id
            tier = r.reminder_record.reminder_number
            base_name = f"{cid}_chase_{tier}"

            html_path = os.path.join(output_dir, f"{base_name}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(r.email.body_html)
            written_paths.append(html_path)

            txt_path = os.path.join(output_dir, f"{base_name}.txt")
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(f"SUBJECT: {r.email.subject}\n\n")
                f.write(r.email.body_text)
            written_paths.append(txt_path)

        return written_paths

    def clear(self) -> None:
        """Clear all stored reminders."""
        self._reminders.clear()
        if self.storage_path and os.path.exists(self.storage_path):
            try:
                os.remove(self.storage_path)
            except OSError:
                pass
