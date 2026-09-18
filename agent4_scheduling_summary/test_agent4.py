"""
Test Suite for Agent 4: Scheduling & Summary Agent
Covers booking gate eligibility, meeting booking transitions,
summary generation, advice disclaimer enforcement, and briefing rendering.
"""

import os
import sys
import json
import unittest
from datetime import datetime, timezone

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from contracts import (
    ClientRecord,
    ClientStatus,
    ContactInfo,
    DocumentRecord,
    SummaryRecord,
)

from agent4_scheduling_summary.booking_gate import (
    check_booking_eligibility,
    book_meeting,
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


class TestAgent4SchedulingSummary(unittest.TestCase):
    def setUp(self):
        self.sample_contact = ContactInfo(
            name="John Smith",
            email="john@apextrading.co.uk",
            phone="+44 20 7946 0912"
        )

        self.doc_bank = DocumentRecord(
            doc_id="doc_bank_001",
            client_id="client_apex_001",
            doc_type="bank_statement",
            period_covered="2024-01-01 to 2024-12-31",
            key_fields={
                "company_name": "Apex Trading Ltd",
                "bank_name": "Barclays Bank UK PLC",
                "closing_balance": 42580.20,
                "turnover": 620000.00,
                "currency": "GBP"
            },
            confidence=0.98,
            needs_human_review=False
        )

        self.doc_accounts = DocumentRecord(
            doc_id="doc_acc_002",
            client_id="client_apex_001",
            doc_type="prior_year_accounts",
            period_covered="2023-01-01 to 2023-12-31",
            key_fields={
                "turnover": 580000.00,
                "net_profit": 74500.00,
                "corporation_tax": 14155.00
            },
            confidence=0.95,
            needs_human_review=False
        )

        self.doc_vat = DocumentRecord(
            doc_id="doc_vat_003",
            client_id="client_apex_001",
            doc_type="vat_certificate",
            period_covered="2022-present",
            key_fields={
                "vat_number": "GB 987 6543 21",
                "registration_date": "2022-04-01"
            },
            confidence=0.99,
            needs_human_review=False
        )

    # -------------------------------------------------------------------------
    # 1. Booking Gate: Blocked State
    # -------------------------------------------------------------------------
    def test_booking_gate_blocked_when_documents_missing(self):
        """Verify that client with missing documents is locked out from booking."""
        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Year End Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.AWAITING_DOCUMENTS.value,
            checklist_required=["bank_statement", "prior_year_accounts", "vat_certificate"],
            documents_received=[self.doc_bank],
            missing_items=["prior_year_accounts", "vat_certificate"]
        )

        is_eligible, reason, booking_link = check_booking_eligibility(client)

        self.assertFalse(is_eligible)
        self.assertIn("Missing required onboarding documents:", reason)
        self.assertIn("prior_year_accounts", reason)
        self.assertIn("vat_certificate", reason)
        self.assertIsNone(booking_link)

        # Attempting to book meeting must raise BookingLockedError / ValueError
        initial_status = client.status
        with self.assertRaises(BookingLockedError) as ctx:
            book_meeting(client, slot_time="2026-09-25T14:00:00Z")

        self.assertIn("Cannot book meeting", str(ctx.exception))
        # Status remains untouched
        self.assertEqual(client.status, initial_status)

    # -------------------------------------------------------------------------
    # 2. Booking Gate: Unlocked State
    # -------------------------------------------------------------------------
    def test_booking_gate_unlocked_when_checklist_complete(self):
        """Verify that client with empty missing_items receives eligible booking status & link."""
        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Year End Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.READY.value,
            checklist_required=["bank_statement", "prior_year_accounts", "vat_certificate"],
            documents_received=[self.doc_bank, self.doc_accounts, self.doc_vat],
            missing_items=[]
        )

        is_eligible, reason, booking_link = check_booking_eligibility(client)

        self.assertTrue(is_eligible)
        self.assertEqual(reason, "All documents received")
        self.assertIsNotNone(booking_link)
        self.assertEqual(
            booking_link,
            f"{DEFAULT_BOOKING_BASE_URL}?client_id=client_apex_001"
        )

    # -------------------------------------------------------------------------
    # 3. Booking Gate: Meeting Booking & Status Transition
    # -------------------------------------------------------------------------
    def test_book_meeting_success_and_status_transition(self):
        """Verify meeting booking executes correctly and transitions status to 'Meeting Booked'."""
        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Year End Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.READY.value,
            checklist_required=["bank_statement"],
            documents_received=[self.doc_bank],
            missing_items=[]
        )

        slot = "2026-09-28T10:00:00Z"
        updated_client = book_meeting(client, slot_time=slot)

        self.assertEqual(updated_client.status, ClientStatus.MEETING_BOOKED.value)
        self.assertEqual(updated_client.status, "Meeting Booked")
        self.assertEqual(getattr(updated_client, "booked_slot", None), slot)
        self.assertIsNotNone(updated_client.updated_at)

        # Re-booking with empty slot time raises ValueError
        with self.assertRaises(ValueError):
            book_meeting(client, slot_time="")

    # -------------------------------------------------------------------------
    # 4. Summary Generation & Status Transition to 'Summary Sent'
    # -------------------------------------------------------------------------
    def test_summary_generation_and_status_transition(self):
        """Verify summary generation creates conforming SummaryRecord and transitions status to 'Summary Sent'."""
        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Year End Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.MEETING_BOOKED.value,
            checklist_required=["bank_statement", "prior_year_accounts", "vat_certificate"],
            documents_received=[self.doc_bank, self.doc_accounts, self.doc_vat],
            missing_items=[]
        )

        summary = generate_summary(client)

        # Verify return type & strict schema conformance
        self.assertIsInstance(summary, SummaryRecord)
        self.assertEqual(summary.client_id, "client_apex_001")
        self.assertEqual(summary.service_requested, "Year End Accounts")

        # Business profile validation
        self.assertIn("Apex Trading Ltd", summary.business_profile)
        self.assertIn("Ltd company", summary.business_profile)
        self.assertIn("Turnover £500k - £1m", summary.business_profile)
        self.assertIn("5 employees", summary.business_profile)
        self.assertIn("John Smith", summary.business_profile)
        self.assertIn("john@apextrading.co.uk", summary.business_profile)

        # Documents received is list of doc_type strings
        self.assertEqual(
            summary.documents_received,
            ["bank_statement", "prior_year_accounts", "vat_certificate"]
        )

        # Key figures extracted
        self.assertIn("closing_balance", summary.key_figures_extracted)
        self.assertEqual(summary.key_figures_extracted["closing_balance"], 42580.20)
        self.assertIn("turnover", summary.key_figures_extracted)
        self.assertEqual(summary.key_figures_extracted["turnover"], 620000.00)
        self.assertIn("net_profit", summary.key_figures_extracted)
        self.assertEqual(summary.key_figures_extracted["net_profit"], 74500.00)
        self.assertIn("vat_number", summary.key_figures_extracted)
        self.assertEqual(summary.key_figures_extracted["vat_number"], "GB 987 6543 21")

        # Open questions must be populated
        self.assertIsInstance(summary.open_questions, list)
        self.assertGreater(len(summary.open_questions), 0)

        # Mandatory Advice Disclaimer presence and content
        self.assertEqual(summary.advice_disclaimer, MANDATORY_ADVICE_DISCLAIMER)
        self.assertIn("NOTICE: Information only", summary.advice_disclaimer)
        self.assertIn("not professional tax, accounting, or legal advice", summary.advice_disclaimer)

        # Timestamp
        self.assertIsNotNone(summary.generated_at)

        # Client status transitioned to "Summary Sent"
        self.assertEqual(client.status, ClientStatus.SUMMARY_SENT.value)
        self.assertEqual(client.status, "Summary Sent")

    # -------------------------------------------------------------------------
    # 5. Flagged Items (Human Review & Confidence Threshold < 0.85)
    # -------------------------------------------------------------------------
    def test_flagged_items_detection(self):
        """Verify flagged_items captures needs_human_review=True and confidence < 0.85."""
        doc_low_conf = DocumentRecord(
            doc_id="doc_low_001",
            client_id="client_apex_001",
            doc_type="payroll_summary",
            period_covered="2024-Q1",
            key_fields={"monthly_payroll": 15000.0},
            confidence=0.78,  # Below 0.85 threshold
            needs_human_review=False
        )

        doc_review_needed = DocumentRecord(
            doc_id="doc_rev_002",
            client_id="client_apex_001",
            doc_type="id",
            period_covered="N/A",
            key_fields={"id_type": "passport"},
            confidence=0.99,
            needs_human_review=True  # Needs human review
        )

        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Payroll Services",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.READY.value,
            checklist_required=["bank_statement", "payroll_summary", "id"],
            documents_received=[self.doc_bank, doc_low_conf, doc_review_needed],
            missing_items=[]
        )

        summary = generate_summary(client)

        self.assertEqual(len(summary.flagged_items), 2)
        flag_texts = " | ".join(summary.flagged_items)
        self.assertIn("doc_low_001", flag_texts)
        self.assertIn("0.78", flag_texts)
        self.assertIn("doc_rev_002", flag_texts)
        self.assertIn("human review", flag_texts)

        # Clean doc (doc_bank) should not be flagged
        self.assertNotIn("doc_bank_001", flag_texts)

    # -------------------------------------------------------------------------
    # 6. Formatted Staff Briefing Output (Markdown)
    # -------------------------------------------------------------------------
    def test_render_briefing_markdown(self):
        """Verify rendering of beautiful Markdown briefing document for staff."""
        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Year End Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.MEETING_BOOKED.value,
            checklist_required=["bank_statement", "prior_year_accounts", "vat_certificate"],
            documents_received=[self.doc_bank, self.doc_accounts, self.doc_vat],
            missing_items=[]
        )
        setattr(client, "booked_slot", "2026-09-28T10:00:00Z")

        summary = generate_summary(client)
        markdown = render_briefing_markdown(summary, client_record=client)

        # Check critical elements
        self.assertIn("# 📋 Pre-Meeting Staff Briefing", markdown)
        self.assertIn("Apex Trading Ltd", markdown)
        self.assertIn("DISCLAIMER", markdown)
        self.assertIn(MANDATORY_ADVICE_DISCLAIMER, markdown)
        self.assertIn("Year End Accounts", markdown)
        self.assertIn("42,580.20", markdown)
        self.assertIn("GB 987 6543 21", markdown)
        self.assertIn("2026-09-28T10:00:00Z", markdown)
        self.assertIn("Recommended Discussion Points", markdown)

    # -------------------------------------------------------------------------
    # 7. Strict Contract Compliance & Serialization
    # -------------------------------------------------------------------------
    def test_contract_roundtrip_and_disclaimer_immutability(self):
        """Verify SummaryRecord serializes cleanly to/from dict and enforces non-empty disclaimer."""
        client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd company",
            service_requested="Year End Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.READY.value,
            checklist_required=["bank_statement"],
            documents_received=[self.doc_bank],
            missing_items=[]
        )

        summary = generate_summary(client)
        data = summary.to_dict()

        self.assertIsInstance(data, dict)
        self.assertEqual(data["client_id"], "client_apex_001")
        self.assertEqual(data["advice_disclaimer"], MANDATORY_ADVICE_DISCLAIMER)

        # Reconstruct from dict
        reconstructed = SummaryRecord.from_dict(data)
        self.assertEqual(reconstructed.client_id, summary.client_id)
        self.assertEqual(reconstructed.advice_disclaimer, summary.advice_disclaimer)
        self.assertEqual(reconstructed.key_figures_extracted, summary.key_figures_extracted)

        # Enforce non-empty disclaimer in contract
        with self.assertRaises(ValueError):
            SummaryRecord(
                client_id="client_001",
                business_profile="Test",
                service_requested="Test",
                documents_received=[],
                advice_disclaimer=""  # Rejected by contract post_init
            )

        with self.assertRaises(ValueError):
            SummaryRecord(
                client_id="client_001",
                business_profile="Test",
                service_requested="Test",
                documents_received=[],
                advice_disclaimer="   "  # Rejected by contract post_init
            )

    # -------------------------------------------------------------------------
    # 8. Synthetic Document Integration Test
    # -------------------------------------------------------------------------
    def test_integration_with_synthetic_documents(self):
        """Verify end-to-end processing using synthetic_docs/bank_statement.json."""
        synthetic_path = os.path.join(PROJECT_ROOT, "synthetic_docs", "bank_statement.json")
        if not os.path.exists(synthetic_path):
            self.skipTest(f"Synthetic document not found at {synthetic_path}")

        with open(synthetic_path, "r", encoding="utf-8") as f:
            doc_data = json.load(f)

        synth_doc = DocumentRecord.from_dict(doc_data)

        client = ClientRecord(
            client_id=synth_doc.client_id,
            business_type="Ltd company",
            service_requested="Annual Accounts",
            turnover_band="£500k - £1m",
            employee_count=5,
            contact=self.sample_contact,
            status=ClientStatus.READY.value,
            checklist_required=["bank_statement"],
            documents_received=[synth_doc],
            missing_items=[]
        )

        # Step 1: Check eligibility
        eligible, reason, link = check_booking_eligibility(client)
        self.assertTrue(eligible)
        self.assertIn("client_apex_001", link)

        # Step 2: Book meeting
        book_meeting(client, "2026-09-30T15:00:00Z")
        self.assertEqual(client.status, ClientStatus.MEETING_BOOKED.value)

        # Step 3: Generate Summary
        summary = generate_summary(client)
        self.assertEqual(client.status, ClientStatus.SUMMARY_SENT.value)
        self.assertEqual(summary.client_id, "client_apex_001")
        self.assertEqual(summary.key_figures_extracted["closing_balance"], 42580.20)
        self.assertEqual(summary.key_figures_extracted["turnover"], 620000.00)
        self.assertIn("Barclays Bank", summary.key_figures_extracted["bank_name"])

        # Step 4: Render Markdown
        briefing = render_briefing_markdown(summary, client)
        self.assertIn("Barclays Bank", briefing)
        self.assertIn("42,580.20", briefing)
        self.assertIn(MANDATORY_ADVICE_DISCLAIMER, briefing)


if __name__ == "__main__":
    unittest.main()
