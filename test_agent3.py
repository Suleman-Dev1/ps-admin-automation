"""Comprehensive Test Suite for Agent 3 (Follow-up & Reminders).

Tests:
1. Gap-Detection Logic:
   - Accurately identifies missing documents.
   - Sets client_record.missing_items.
   - Transitions status from "New" / "Awaiting Documents" to "Chasing".
   - Transitions to "Ready" when all checklist requirements are satisfied.
2. Escalating Reminders (Chase 1, 2, 3):
   - Strict conformity with ReminderRecord schema in contracts.py.
   - Round-trip serialization (to_dict / from_dict).
   - Escalating tone verification:
     * Chase 1: Polite, welcoming intake check-in.
     * Chase 2: Direct, structured notice that review is on hold.
     * Chase 3: Urgent final notice before file is marked inactive.
   - Complete email artifacts (subject, text, HTML, secure upload link, itemized missing items).
   - Mandatory Disclaimer presence ("Information only — not professional advice").
3. Dispatcher & Persistence Store:
   - In-memory and JSON persistence (sent_reminders.json).
   - Schedule progression based on elapsed days (Day 2, Day 5, Day 9).
   - Communication file exports (.html and .txt).
"""

import os
import sys
import unittest
import json
import shutil

# Ensure workspace root is in python path
WORKSPACE_ROOT = os.path.abspath(os.path.dirname(__file__))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from contracts import (
    ClientRecord,
    DocumentRecord,
    ContactInfo,
    ClientStatus,
    ReminderRecord
)
from agent3_followup import (
    detect_gaps,
    generate_reminder,
    RenderedReminder,
    GeneratedEmail,
    ReminderStore,
    ReminderDispatcher,
    DISCLAIMER_NOTICE
)


class TestAgent3Followup(unittest.TestCase):

    def setUp(self):
        """Set up standard test fixtures."""
        self.test_output_dir = os.path.join(WORKSPACE_ROOT, "test_output_agent3")
        os.makedirs(self.test_output_dir, exist_ok=True)
        self.sent_json_path = os.path.join(self.test_output_dir, "test_sent_reminders.json")
        if os.path.exists(self.sent_json_path):
            os.remove(self.sent_json_path)

        self.contact = ContactInfo(
            name="Alice Smith",
            email="alice.smith@example.com",
            phone="+44 20 7946 0991"
        )
        self.doc_bank = DocumentRecord(
            doc_id="doc-101",
            client_id="client-001",
            doc_type="bank_statement",
            period_covered="2026-Q1"
        )
        self.doc_id = DocumentRecord(
            doc_id="doc-102",
            client_id="client-001",
            doc_type="id",
            period_covered="2026-2036"
        )

    def tearDown(self):
        """Clean up test artifacts."""
        if os.path.exists(self.test_output_dir):
            shutil.rmtree(self.test_output_dir, ignore_errors=True)

    def test_01_gap_detection_missing_items(self):
        """Test gap detection correctly flags missing items and transitions status to 'Chasing'."""
        client = ClientRecord(
            client_id="client-001",
            business_type="limited_company",
            service_requested="Annual Accounts & Tax Filing",
            turnover_band="£250k-£500k",
            employee_count=5,
            contact=self.contact,
            status=ClientStatus.NEW.value,
            checklist_required=["bank_statement", "id", "proof_of_address"],
            documents_received=[self.doc_bank, self.doc_id]  # missing 'proof_of_address'
        )

        missing = detect_gaps(client)

        self.assertEqual(missing, ["proof_of_address"])
        self.assertEqual(client.missing_items, ["proof_of_address"])
        self.assertEqual(client.status, ClientStatus.CHASING.value)
        self.assertIsNotNone(client.updated_at)

    def test_02_gap_detection_multiple_missing(self):
        """Test gap detection with multiple missing items."""
        client = ClientRecord(
            client_id="client-002",
            business_type="sole_trader",
            service_requested="Self Assessment",
            turnover_band="£50k-£100k",
            employee_count=1,
            contact=self.contact,
            status=ClientStatus.AWAITING_DOCUMENTS.value,
            checklist_required=["bank_statement", "id", "proof_of_address", "prior_year_accounts"],
            documents_received=[self.doc_id]
        )

        missing = detect_gaps(client)

        self.assertEqual(missing, ["bank_statement", "proof_of_address", "prior_year_accounts"])
        self.assertEqual(client.missing_items, missing)
        self.assertEqual(client.status, ClientStatus.CHASING.value)

    def test_03_gap_detection_all_received(self):
        """Test gap detection when all documents are present transitions to Ready."""
        doc_poa = DocumentRecord(
            doc_id="doc-103",
            client_id="client-001",
            doc_type="proof_of_address",
            period_covered="2026-02"
        )
        client = ClientRecord(
            client_id="client-001",
            business_type="limited_company",
            service_requested="Annual Accounts & Tax Filing",
            turnover_band="£250k-£500k",
            employee_count=5,
            contact=self.contact,
            status=ClientStatus.CHASING.value,
            checklist_required=["bank_statement", "id", "proof_of_address"],
            documents_received=[self.doc_bank, self.doc_id, doc_poa]
        )

        missing = detect_gaps(client)

        self.assertEqual(missing, [])
        self.assertEqual(client.missing_items, [])
        self.assertEqual(client.status, ClientStatus.READY.value)

    def test_04_reminder_record_schema_and_serialization(self):
        """Verify generated ReminderRecord conforms strictly to contracts.py schema."""
        client = ClientRecord(
            client_id="client-001",
            business_type="limited_company",
            service_requested="Corporate Tax",
            turnover_band="£100k-£250k",
            employee_count=2,
            contact=self.contact,
            status=ClientStatus.CHASING.value,
            checklist_required=["proof_of_address"],
            documents_received=[]
        )

        rendered = generate_reminder(client, reminder_number=1)
        record = rendered.reminder_record

        # Check instance type and fields
        self.assertIsInstance(record, ReminderRecord)
        self.assertEqual(record.client_id, "client-001")
        self.assertEqual(record.missing_items, ["proof_of_address"])
        self.assertEqual(record.reminder_number, 1)
        self.assertEqual(record.channel, "email")
        self.assertTrue(isinstance(record.sent_at, str))

        # Check round-trip serialization
        rec_dict = record.to_dict()
        self.assertEqual(rec_dict["client_id"], "client-001")
        self.assertEqual(rec_dict["missing_items"], ["proof_of_address"])
        self.assertEqual(rec_dict["reminder_number"], 1)
        self.assertEqual(rec_dict["channel"], "email")

        restored = ReminderRecord.from_dict(rec_dict)
        self.assertEqual(restored.client_id, record.client_id)
        self.assertEqual(restored.missing_items, record.missing_items)
        self.assertEqual(restored.reminder_number, record.reminder_number)
        self.assertEqual(restored.sent_at, record.sent_at)
        self.assertEqual(restored.channel, record.channel)

    def test_05_escalating_tone_and_content(self):
        """Verify escalating tone across Chase 1, Chase 2, and Chase 3 reminders."""
        client = ClientRecord(
            client_id="client-001",
            business_type="limited_company",
            service_requested="VAT Return Filing",
            turnover_band="£500k-£1m",
            employee_count=8,
            contact=self.contact,
            status=ClientStatus.NEW.value,
            checklist_required=["proof_of_address", "bank_statement"],
            documents_received=[]
        )

        # Chase 1 (Day 2): Polite, friendly intake check-in
        chase1 = generate_reminder(client, reminder_number=1)
        self.assertEqual(chase1.reminder_record.reminder_number, 1)
        self.assertIn("Action Required", chase1.email.subject)
        # Friendly and welcoming phrasing
        self.assertTrue("Welcome" in chase1.email.body_html or "delighted" in chase1.email.body_text)
        self.assertIn("smoothly", chase1.email.body_text.lower())
        self.assertIn("https://portal.ps-admin.com/upload/client-001", chase1.email.upload_url)
        self.assertIn("Proof of Address", chase1.email.body_text)
        self.assertIn("Bank Statements", chase1.email.body_text)
        self.assertIn("Information only — not professional", chase1.email.disclaimer)
        self.assertIn(DISCLAIMER_NOTICE, chase1.email.body_text)
        self.assertIn(DISCLAIMER_NOTICE, chase1.email.body_html)

        # Chase 2 (Day 5): Direct, structured follow-up; review on hold
        chase2 = generate_reminder(client, reminder_number=2)
        self.assertEqual(chase2.reminder_record.reminder_number, 2)
        self.assertIn("on hold", chase2.email.subject.lower())
        self.assertIn("ON HOLD", chase2.email.body_text)
        self.assertIn("cannot proceed", chase2.email.body_text.lower())
        self.assertIn(DISCLAIMER_NOTICE, chase2.email.body_text)
        self.assertIn(DISCLAIMER_NOTICE, chase2.email.body_html)

        # Chase 3 (Day 9): Urgent final notice before file is marked inactive
        chase3 = generate_reminder(client, reminder_number=3)
        self.assertEqual(chase3.reminder_record.reminder_number, 3)
        self.assertIn("FINAL NOTICE", chase3.email.subject)
        self.assertIn("INACTIVE", chase3.email.body_text)
        self.assertIn("48 hours", chase3.email.body_text)
        self.assertIn("terminated", chase3.email.body_text.lower())
        self.assertIn(DISCLAIMER_NOTICE, chase3.email.body_text)
        self.assertIn(DISCLAIMER_NOTICE, chase3.email.body_html)

    def test_06_reminder_dispatcher_and_schedule(self):
        """Verify ReminderDispatcher schedule evaluation and persistence."""
        store = ReminderStore(storage_path=self.sent_json_path)
        dispatcher = ReminderDispatcher(store=store)

        client = ClientRecord(
            client_id="client-003",
            business_type="partnership",
            service_requested="Partnership Tax Return",
            turnover_band="£100k-£250k",
            employee_count=3,
            contact=self.contact,
            status=ClientStatus.NEW.value,
            checklist_required=["proof_of_address"],
            documents_received=[]
        )

        # Day 1: Not due yet
        r_day1 = dispatcher.evaluate_schedule_trigger(client, days_elapsed=1)
        self.assertIsNone(r_day1)
        self.assertEqual(store.count_for_client("client-003"), 0)

        # Day 2: Chase 1 triggered
        r_day2 = dispatcher.evaluate_schedule_trigger(client, days_elapsed=2)
        self.assertIsNotNone(r_day2)
        self.assertEqual(r_day2.reminder_record.reminder_number, 1)
        self.assertEqual(store.count_for_client("client-003"), 1)

        # Day 3: Chase 1 already sent, Chase 2 not due yet
        r_day3 = dispatcher.evaluate_schedule_trigger(client, days_elapsed=3)
        self.assertIsNone(r_day3)

        # Day 5: Chase 2 triggered
        r_day5 = dispatcher.evaluate_schedule_trigger(client, days_elapsed=5)
        self.assertIsNotNone(r_day5)
        self.assertEqual(r_day5.reminder_record.reminder_number, 2)
        self.assertEqual(store.count_for_client("client-003"), 2)

        # Day 9: Chase 3 triggered
        r_day9 = dispatcher.evaluate_schedule_trigger(client, days_elapsed=9)
        self.assertIsNotNone(r_day9)
        self.assertEqual(r_day9.reminder_record.reminder_number, 3)
        self.assertEqual(store.count_for_client("client-003"), 3)

        # Verify sent_reminders.json exists and contains 3 records
        self.assertTrue(os.path.exists(self.sent_json_path))
        with open(self.sent_json_path, "r", encoding="utf-8") as f:
            persisted = json.load(f)
        self.assertEqual(len(persisted), 3)
        self.assertEqual(persisted[0]["reminder_record"]["reminder_number"], 1)
        self.assertEqual(persisted[1]["reminder_record"]["reminder_number"], 2)
        self.assertEqual(persisted[2]["reminder_record"]["reminder_number"], 3)

        # Test reload from file into a fresh store
        new_store = ReminderStore(storage_path=self.sent_json_path)
        self.assertEqual(new_store.count_for_client("client-003"), 3)
        reloaded_records = new_store.get_reminder_records()
        self.assertEqual(len(reloaded_records), 3)
        self.assertIsInstance(reloaded_records[0], ReminderRecord)

    def test_07_export_communication_artifacts(self):
        """Verify rendered communication artifacts can be exported as HTML and TXT."""
        store = ReminderStore(storage_path=self.sent_json_path)
        dispatcher = ReminderDispatcher(store=store)

        client = ClientRecord(
            client_id="client-004",
            business_type="limited_company",
            service_requested="Bookkeeping",
            turnover_band="£50k-£100k",
            employee_count=2,
            contact=self.contact,
            status=ClientStatus.NEW.value,
            checklist_required=["bank_statement", "proof_of_address"],
            documents_received=[]
        )

        rendered = dispatcher.check_and_dispatch(client, force_tier=1)
        self.assertIsNotNone(rendered)

        export_dir = os.path.join(self.test_output_dir, "exports")
        files = store.export_communications(export_dir)
        self.assertGreaterEqual(len(files), 2)

        html_file = os.path.join(export_dir, "client-004_chase_1.html")
        txt_file = os.path.join(export_dir, "client-004_chase_1.txt")
        self.assertTrue(os.path.exists(html_file))
        self.assertTrue(os.path.exists(txt_file))

        with open(html_file, "r", encoding="utf-8") as f:
            html_content = f.read()
            self.assertIn("<!DOCTYPE html>", html_content)
            self.assertIn("Proof of Address", html_content)
            self.assertIn(DISCLAIMER_NOTICE, html_content)

        with open(txt_file, "r", encoding="utf-8") as f:
            txt_content = f.read()
            self.assertIn("SUBJECT:", txt_content)
            self.assertIn("Bank Statements", txt_content)
            self.assertIn(DISCLAIMER_NOTICE, txt_content)


if __name__ == "__main__":
    print("=" * 70)
    print("RUNNING AGENT 3 FOLLOW-UP & REMINDER TEST SUITE")
    print("=" * 70)
    unittest.main(verbosity=2)
