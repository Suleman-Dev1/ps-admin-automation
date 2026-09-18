"""Test Suite for Agent 1 (Intake & CRM).

Verifies:
1. Intake submission produces a valid ClientRecord strictly adhering to contracts.py.
2. Field-level validation for business_type, service, turnover, employees, contact, and dates.
3. Client ID generation format (CLI-YYYYMMDD-XXXX) and uniqueness.
4. Checklist resolution from config file and fallback stubs.
5. CRMStore persistence, retrieval, status updates, and listing.
6. Round-trip serialization/deserialization with contracts.py.
7. Downstream contract interoperability with gap detector.
"""

import json
import os
import re
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

# Ensure repo root is on sys.path
_REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

from contracts import (
    ClientRecord,
    ContactInfo,
    DocumentRecord,
    ClientStatus,
    VALID_STATUSES,
)
from agent1_intake_crm.crm_store import CRMStore
from agent1_intake_crm.intake_service import (
    IntakeService,
    IntakePayload,
    generate_client_id,
    resolve_checklist,
    load_checklist_configs,
    submit_client_intake,
    DEFAULT_LTD_YEAR_END_CHECKLIST,
)


class TestIntakeSubmission(unittest.TestCase):
    """Test intake submission and schema conformity."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.store_path = os.path.join(self.temp_dir.name, "crm_clients.json")
        self.store = CRMStore(storage_path=self.store_path)
        self.service = IntakeService(crm_store=self.store)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_ltd_year_end_intake_success(self):
        """Verify standard Ltd + Year-end accounts submission strictly adheres to ClientRecord."""
        payload = {
            "business_type": "Ltd",
            "service_requested": "Year-end accounts",
            "turnover_band": "£250k - £500k",
            "employee_count": 5,
            "relevant_date": "2025-12-31",
            "contact": {
                "name": "Sarah Jenkins",
                "email": "sarah.jenkins@acmecorp.co.uk",
                "phone": "+44 20 7946 0958",
            },
            "existing_provider": "Previous Accountant Ltd",
            "notes": "Transitioning for new fiscal year",
        }

        record = self.service.submit_intake(payload)

        # 1. Type validation
        self.assertIsInstance(record, ClientRecord)
        self.assertIsInstance(record.contact, ContactInfo)

        # 2. Client ID format: CLI-YYYYMMDD-XXXX
        id_pattern = r"^CLI-\d{8}-[A-Z0-9]{4}$"
        self.assertRegex(record.client_id, id_pattern)

        # 3. Core fields matching intake
        self.assertEqual(record.business_type, "Ltd")
        self.assertEqual(record.service_requested, "Year-end accounts")
        self.assertEqual(record.turnover_band, "£250k - £500k")
        self.assertEqual(record.employee_count, 5)
        self.assertEqual(record.contact.name, "Sarah Jenkins")
        self.assertEqual(record.contact.email, "sarah.jenkins@acmecorp.co.uk")
        self.assertEqual(record.contact.phone, "+44 20 7946 0958")

        # 4. Status requirement: strictly initial 'New'
        self.assertEqual(record.status, ClientStatus.NEW.value)
        self.assertIn(record.status, VALID_STATUSES)

        # 5. Checklist required matching specification for Ltd + Year-end accounts
        expected_checklist = [
            "bank_statement",
            "prior_year_accounts",
            "payroll_summary",
            "id",
            "proof_of_address",
            "vat_certificate",
        ]
        self.assertEqual(record.checklist_required, expected_checklist)

        # 6. Missing items initialized to full checklist
        self.assertEqual(record.missing_items, expected_checklist)

        # 7. Documents received initially empty
        self.assertEqual(record.documents_received, [])

        # 8. Timestamps are valid ISO format
        datetime.fromisoformat(record.created_at)
        datetime.fromisoformat(record.updated_at)

        # 9. Serialization round-trip with contracts.py
        data_dict = record.to_dict()
        rehydrated = ClientRecord.from_dict(data_dict)
        self.assertEqual(record.client_id, rehydrated.client_id)
        self.assertEqual(record.business_type, rehydrated.business_type)
        self.assertEqual(record.service_requested, rehydrated.service_requested)
        self.assertEqual(record.contact.email, rehydrated.contact.email)
        self.assertEqual(record.checklist_required, rehydrated.checklist_required)
        self.assertEqual(record.missing_items, rehydrated.missing_items)

        # 10. Persisted in CRM store
        stored = self.store.get(record.client_id)
        self.assertIsNotNone(stored)
        self.assertEqual(stored.client_id, record.client_id)

        # 11. Supplementary metadata preserved
        meta = self.store.get_metadata(record.client_id)
        self.assertEqual(meta.get("relevant_date"), "2025-12-31")
        self.assertEqual(meta.get("existing_provider"), "Previous Accountant Ltd")

    def test_convenience_function_submit_client_intake(self):
        """Verify the functional wrapper works seamlessly."""
        record = submit_client_intake(
            business_type="Sole Trader",
            service_requested="Year-end accounts",
            turnover_band="£100k - £250k",
            employee_count=1,
            contact={"name": "John Doe", "email": "john@example.com", "phone": "07700900123"},
            relevant_date="2025-04-05",
            crm_store=self.store,
        )
        self.assertIsInstance(record, ClientRecord)
        self.assertEqual(record.business_type, "Sole Trader")
        self.assertEqual(record.status, "New")
        self.assertTrue(len(record.checklist_required) > 0)


class TestChecklistResolution(unittest.TestCase):
    """Test checklist determination for different business types and services."""

    def test_ltd_year_end_checklist(self):
        docs, cfg = resolve_checklist("Ltd", "Year-end accounts")
        self.assertEqual(docs, DEFAULT_LTD_YEAR_END_CHECKLIST)

    def test_sole_trader_year_end_checklist(self):
        docs, cfg = resolve_checklist("Sole Trader", "Year-end accounts")
        self.assertIn("bank_statement", docs)
        self.assertIn("id", docs)
        self.assertIn("proof_of_address", docs)
        self.assertIn("prior_year_accounts", docs)
        self.assertNotIn("vat_certificate", docs)

    def test_ltd_vat_checklist(self):
        docs, cfg = resolve_checklist("Ltd", "VAT")
        self.assertIn("bank_statement", docs)
        self.assertIn("sales_invoices", docs)
        self.assertIn("purchase_receipts", docs)
        self.assertIn("vat_certificate", docs)

    def test_ltd_payroll_checklist(self):
        docs, cfg = resolve_checklist("Ltd", "Payroll")
        self.assertIn("payroll_summary", docs)
        self.assertIn("p45_p46_forms", docs)
        self.assertIn("pension_details", docs)

    def test_fallback_when_config_missing(self):
        """When passing an empty config dictionary, Ltd + Year-end accounts still falls back to default stub."""
        docs, _ = resolve_checklist("Ltd", "Year-end accounts", custom_configs={})
        self.assertEqual(docs, DEFAULT_LTD_YEAR_END_CHECKLIST)

    def test_generic_fallback_for_unknown_service(self):
        docs, _ = resolve_checklist("Charity", "Bespoke Audit", custom_configs={})
        self.assertEqual(docs, ["bank_statement", "id", "proof_of_address"])


class TestValidationErrors(unittest.TestCase):
    """Test strict validation of intake inputs."""

    def setUp(self):
        self.service = IntakeService(crm_store=CRMStore(in_memory=True))

    def test_missing_business_type_fails(self):
        with self.assertRaises(ValueError) as ctx:
            self.service.submit_intake({
                "business_type": "",
                "service_requested": "Year-end accounts",
                "turnover_band": "£100k - £250k",
                "employee_count": 0,
                "contact": {"name": "Alice", "email": "alice@test.com", "phone": "12345"},
            })
        self.assertIn("business_type must not be empty", str(ctx.exception))

    def test_invalid_email_fails(self):
        with self.assertRaises(ValueError) as ctx:
            self.service.submit_intake({
                "business_type": "Ltd",
                "service_requested": "Year-end accounts",
                "turnover_band": "£100k - £250k",
                "employee_count": 2,
                "contact": {"name": "Alice", "email": "not-an-email", "phone": "12345"},
            })
        self.assertIn("invalid", str(ctx.exception))

    def test_negative_employee_count_fails(self):
        with self.assertRaises(ValueError) as ctx:
            self.service.submit_intake({
                "business_type": "Ltd",
                "service_requested": "Year-end accounts",
                "turnover_band": "£100k - £250k",
                "employee_count": -5,
                "contact": {"name": "Alice", "email": "alice@test.com", "phone": "12345"},
            })
        self.assertIn("employee_count must be >= 0", str(ctx.exception))

    def test_invalid_date_format_fails(self):
        with self.assertRaises(ValueError) as ctx:
            self.service.submit_intake({
                "business_type": "Ltd",
                "service_requested": "Year-end accounts",
                "turnover_band": "£100k - £250k",
                "employee_count": 1,
                "relevant_date": "31/12/2025",  # Not ISO YYYY-MM-DD
                "contact": {"name": "Alice", "email": "alice@test.com", "phone": "12345"},
            })
        self.assertIn("must follow ISO YYYY-MM-DD format", str(ctx.exception))


class TestCRMStoreOperations(unittest.TestCase):
    """Test persistent and in-memory operations of CRMStore."""

    def test_crud_and_filtering(self):
        store = CRMStore(in_memory=True)
        self.assertEqual(store.count(), 0)

        record1 = ClientRecord(
            client_id="CLI-20260918-0001",
            business_type="Ltd",
            service_requested="Year-end accounts",
            turnover_band="£100k - £250k",
            employee_count=3,
            contact=ContactInfo(name="Bob", email="bob@example.com", phone="012345"),
            status=ClientStatus.NEW.value,
            checklist_required=["bank_statement", "id"],
            missing_items=["bank_statement", "id"],
        )

        record2 = ClientRecord(
            client_id="CLI-20260918-0002",
            business_type="Sole Trader",
            service_requested="VAT",
            turnover_band="£50k - £100k",
            employee_count=0,
            contact=ContactInfo(name="Carol", email="carol@example.com", phone="067890"),
            status=ClientStatus.AWAITING_DOCUMENTS.value,
            checklist_required=["bank_statement"],
            missing_items=["bank_statement"],
        )

        # Save
        store.save(record1)
        store.save(record2)
        self.assertEqual(store.count(), 2)

        # Retrieve
        fetched1 = store.get("CLI-20260918-0001")
        self.assertIsNotNone(fetched1)
        self.assertEqual(fetched1.contact.name, "Bob")

        # Non-existent
        self.assertIsNone(store.get("NON-EXISTENT"))

        # List all
        all_records = store.list_all()
        self.assertEqual(len(all_records), 2)

        # Filter by status
        new_records = store.filter_by_status(ClientStatus.NEW.value)
        self.assertEqual(len(new_records), 1)
        self.assertEqual(new_records[0].client_id, "CLI-20260918-0001")

        # Update status
        updated = store.update_status("CLI-20260918-0001", ClientStatus.CHASING.value)
        self.assertEqual(updated.status, ClientStatus.CHASING.value)

        # Invalid status rejected
        with self.assertRaises(ValueError):
            store.update_status("CLI-20260918-0001", "NonExistentStatus")

        # Delete
        self.assertTrue(store.delete("CLI-20260918-0001"))
        self.assertIsNone(store.get("CLI-20260918-0001"))
        self.assertEqual(store.count(), 1)

    def test_json_file_persistence_reloading(self):
        """Verify records survive store reload from JSON file."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            file_path = os.path.join(tmp_dir, "crm_clients.json")
            store1 = CRMStore(storage_path=file_path)

            record = ClientRecord(
                client_id="CLI-20260918-9999",
                business_type="Ltd",
                service_requested="Year-end accounts",
                turnover_band="£500k - £1m",
                employee_count=12,
                contact=ContactInfo(name="David", email="david@corp.co.uk", phone="0111222333"),
                status=ClientStatus.NEW.value,
                checklist_required=["bank_statement", "prior_year_accounts"],
                missing_items=["bank_statement", "prior_year_accounts"],
            )
            store1.save(record, metadata={"existing_provider": "OldFirm Ltd"})

            # Re-instantiate a second CRMStore pointing to the same file
            store2 = CRMStore(storage_path=file_path)
            loaded = store2.get("CLI-20260918-9999")
            self.assertIsNotNone(loaded)
            self.assertEqual(loaded.business_type, "Ltd")
            self.assertEqual(loaded.turnover_band, "£500k - £1m")
            self.assertEqual(loaded.employee_count, 12)
            self.assertEqual(loaded.contact.email, "david@corp.co.uk")

            metadata = store2.get_metadata("CLI-20260918-9999")
            self.assertEqual(metadata.get("existing_provider"), "OldFirm Ltd")


class TestDownstreamInteroperability(unittest.TestCase):
    """Test interoperability with Agent 3 gap detector using generated ClientRecord."""

    def test_gap_detector_with_new_intake_record(self):
        try:
            from agent3_followup.gap_detector import detect_gaps
        except ImportError:
            self.skipTest("Agent 3 gap detector not found.")

        service = IntakeService(crm_store=CRMStore(in_memory=True))
        record = service.submit_intake({
            "business_type": "Ltd",
            "service_requested": "Year-end accounts",
            "turnover_band": "£100k - £250k",
            "employee_count": 2,
            "contact": {"name": "Grace", "email": "grace@example.com", "phone": "07890123456"},
        })

        # Gap detection on fresh intake
        missing = detect_gaps(record)
        self.assertEqual(len(missing), 6)
        self.assertEqual(record.status, ClientStatus.CHASING.value)

        # Simulate receiving 1 document
        bank_doc = DocumentRecord(
            doc_id="doc-bank-001",
            client_id=record.client_id,
            doc_type="bank_statement",
            period_covered="2025-01-01 to 2025-12-31",
            confidence=0.99,
        )
        record.documents_received.append(bank_doc)

        missing_after = detect_gaps(record)
        self.assertEqual(len(missing_after), 5)
        self.assertNotIn("bank_statement", missing_after)


if __name__ == "__main__":
    unittest.main(verbosity=2)
