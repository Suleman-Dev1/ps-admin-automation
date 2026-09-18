"""Comprehensive Test Suite for Agent 2 — Document Processing Agent.

Verifies:
1. Checklist config swappability across Accountancy and Legal verticals (JSON & YAML).
2. Secure tokenized upload portal (generation, validation, tampering, expiration).
3. Classification & extraction pipeline across all domain document types.
4. Confidence scoring and strict 0.85 human review flagging on noisy scans.
5. Strict DocumentRecord conformity to contracts.py.
6. Client document ingestion, gap recalculation, and status transitions (New -> Chasing -> Ready).
7. Interoperability with Agent 5 synthetic document fixtures.
"""
from datetime import datetime, timezone
from pathlib import Path
import json
import time
import unittest
import sys

# Ensure root workspace is on python path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from contracts import (
    ClientRecord,
    DocumentRecord,
    ChecklistConfig,
    ContactInfo,
    ClientStatus,
    VALID_STATUSES,
)
from agent2_document import (
    generate_upload_token,
    validate_upload_token,
    verify_upload_token,
    generate_upload_link,
    extract_token_from_url,
    classify_document,
    extract_key_fields,
    process_document,
    process_document_batch,
    ingest_client_documents,
    load_checklists,
    get_checklist_for,
)

SYNTHETIC_DIR = ROOT_DIR / "synthetic_docs"
CONFIG_DIR = ROOT_DIR / "config"


class TestChecklistConfig(unittest.TestCase):
    """Test Requirement 1: Swappable Checklist Configuration."""

    def test_json_and_yaml_configs_exist(self):
        json_path = CONFIG_DIR / "checklists.json"
        yaml_path = CONFIG_DIR / "checklists.yaml"
        self.assertTrue(json_path.exists(), "checklists.json must exist")
        self.assertTrue(yaml_path.exists(), "checklists.yaml must exist")

    def test_accountancy_ltd_config(self):
        for ext, path in [("json", CONFIG_DIR / "checklists.json"), ("yaml", CONFIG_DIR / "checklists.yaml")]:
            cfg = get_checklist_for("Ltd", "Year-end accounts", path)
            self.assertIsNotNone(cfg, f"Ltd Year-end accounts checklist missing in {ext}")
            self.assertIsInstance(cfg, ChecklistConfig)
            self.assertEqual(cfg.business_type, "Ltd")
            self.assertEqual(cfg.service, "Year-end accounts")

            expected_docs = [
                "bank_statement", "prior_year_accounts", "payroll_summary",
                "id", "proof_of_address", "vat_certificate"
            ]
            self.assertEqual(cfg.required_documents, expected_docs, f"Mismatch in required_documents in {ext}")

            expected_fields = [
                "business_type", "service_requested", "turnover_band",
                "employee_count", "contact"
            ]
            self.assertEqual(cfg.required_form_fields, expected_fields, f"Mismatch in required_form_fields in {ext}")

    def test_accountancy_sole_trader_config(self):
        for ext, path in [("json", CONFIG_DIR / "checklists.json"), ("yaml", CONFIG_DIR / "checklists.yaml")]:
            cfg = get_checklist_for("Sole Trader", "Self Assessment", path)
            self.assertIsNotNone(cfg, f"Sole Trader Self Assessment checklist missing in {ext}")
            self.assertIsInstance(cfg, ChecklistConfig)
            expected_docs = ["bank_statement", "id", "proof_of_address", "expense_records"]
            self.assertEqual(cfg.required_documents, expected_docs)

    def test_legal_vertical_swappability(self):
        """Proves cross-vertical swappability without code changes."""
        for ext, path in [("json", CONFIG_DIR / "checklists.json"), ("yaml", CONFIG_DIR / "checklists.yaml")]:
            cfg = get_checklist_for("Law Firm", "Conveyancing", path)
            self.assertIsNotNone(cfg, f"Law Firm Conveyancing checklist missing in {ext}")
            self.assertIsInstance(cfg, ChecklistConfig)
            expected_docs = ["id", "proof_of_address", "source_of_funds", "property_title_deeds"]
            self.assertEqual(cfg.required_documents, expected_docs)
            self.assertIn("property_address", cfg.required_form_fields)
            self.assertIn("transaction_value", cfg.required_form_fields)

    def test_config_loader_schema_conformity(self):
        configs = load_checklists(CONFIG_DIR / "checklists.json")
        self.assertGreaterEqual(len(configs), 3)
        for c in configs:
            self.assertIsInstance(c, ChecklistConfig)
            d = c.to_dict()
            self.assertIn("business_type", d)
            self.assertIn("service", d)
            self.assertIn("required_documents", d)
            self.assertIn("required_form_fields", d)
            # Verify roundtrip
            recreated = ChecklistConfig.from_dict(d)
            self.assertEqual(recreated, c)


class TestUploadPortal(unittest.TestCase):
    """Test Requirement 2: Secure Tokenized Upload Portal."""

    def test_token_generation_and_validation(self):
        client_id = "client_test_7781"
        token = generate_upload_token(client_id)
        self.assertTrue(token.startswith("upload_token_"))

        validated_id = validate_upload_token(token)
        self.assertEqual(validated_id, client_id)

    def test_upload_link_generation(self):
        client_id = "client_apex_001"
        link = generate_upload_link(client_id, base_url="https://portal.example.com/upload")
        self.assertIn("https://portal.example.com/upload?token=", link)

        extracted_token = extract_token_from_url(link)
        self.assertIsNotNone(extracted_token)
        self.assertEqual(validate_upload_token(extracted_token), client_id)

    def test_tampered_token_rejection(self):
        client_id = "client_secure_001"
        token = generate_upload_token(client_id)
        # Tamper with signature
        tampered = token[:-2] + ("ab" if token[-2:] != "ab" else "cd")
        is_valid, cid, err = verify_upload_token(tampered)
        self.assertFalse(is_valid)
        self.assertIsNone(validate_upload_token(tampered))
        self.assertIn("signature", err.lower())

    def test_expired_token_rejection(self):
        client_id = "client_expired_001"
        # Generate token expired 60 seconds ago
        expired_token = generate_upload_token(client_id, expires_in_seconds=-60)
        is_valid, cid, err = verify_upload_token(expired_token)
        self.assertFalse(is_valid)
        self.assertIsNone(validate_upload_token(expired_token))
        self.assertIn("expired", err.lower())


class TestClassificationAndExtraction(unittest.TestCase):
    """Test Requirement 3: Document Classification, Extraction, and Confidence Scoring."""

    def test_bank_statement_classification_and_extraction(self):
        path = SYNTHETIC_DIR / "bank_statement.txt"
        self.assertTrue(path.exists())
        doc = process_document(path, client_id="client_apex_001")

        self.assertEqual(doc.doc_type, "bank_statement")
        self.assertGreaterEqual(doc.confidence, 0.85)
        self.assertFalse(doc.needs_human_review)
        self.assertIn("bank_name", doc.key_fields)
        self.assertIn("closing_balance", doc.key_fields)
        self.assertIn("date_range", doc.key_fields)
        self.assertEqual(doc.key_fields["bank_name"], "Barclays Bank")
        self.assertEqual(doc.key_fields["closing_balance"], "£14,520.50")

    def test_prior_year_accounts_classification_and_extraction(self):
        path = SYNTHETIC_DIR / "prior_year_accounts.txt"
        self.assertTrue(path.exists())
        doc = process_document(path, client_id="client_apex_001")

        self.assertEqual(doc.doc_type, "prior_year_accounts")
        self.assertGreaterEqual(doc.confidence, 0.85)
        self.assertFalse(doc.needs_human_review)
        self.assertIn("turnover", doc.key_fields)
        self.assertIn("net_profit", doc.key_fields)
        self.assertIn("balance_sheet_total", doc.key_fields)
        self.assertEqual(doc.key_fields["turnover"], "£350,000.00")
        self.assertEqual(doc.key_fields["net_profit"], "£55,000.00")
        self.assertEqual(doc.key_fields["balance_sheet_total"], "£120,000.00")

    def test_vat_certificate_classification_and_extraction(self):
        path = SYNTHETIC_DIR / "vat_certificate.txt"
        self.assertTrue(path.exists())
        doc = process_document(path, client_id="client_apex_001")

        self.assertEqual(doc.doc_type, "vat_certificate")
        self.assertGreaterEqual(doc.confidence, 0.85)
        self.assertFalse(doc.needs_human_review)
        self.assertIn("vat_number", doc.key_fields)
        self.assertIn("effective_date", doc.key_fields)
        self.assertIn("987 6543 21", doc.key_fields["vat_number"])

    def test_id_classification_and_extraction(self):
        path = SYNTHETIC_DIR / "director_id.txt"
        self.assertTrue(path.exists())
        doc = process_document(path, client_id="client_apex_001")

        self.assertIn(doc.doc_type, ("id", "director_id"))
        self.assertGreaterEqual(doc.confidence, 0.85)
        self.assertFalse(doc.needs_human_review)
        self.assertIn("full_name", doc.key_fields)
        self.assertIn("document_number", doc.key_fields)
        self.assertIn("expiry", doc.key_fields)
        self.assertEqual(doc.key_fields["full_name"], "John David Smith")
        self.assertEqual(doc.key_fields["document_number"], "554981203")

    def test_payroll_summary_classification_and_extraction(self):
        path = SYNTHETIC_DIR / "payroll_summary.txt"
        self.assertTrue(path.exists())
        doc = process_document(path, client_id="client_apex_001")

        self.assertEqual(doc.doc_type, "payroll_summary")
        self.assertGreaterEqual(doc.confidence, 0.85)
        self.assertFalse(doc.needs_human_review)
        self.assertEqual(doc.key_fields["paye_reference"], "123/AB456")
        self.assertEqual(doc.key_fields["total_gross_pay"], "£84,000.00")
        self.assertEqual(doc.key_fields["total_tax"], "£14,200.00")

    def test_proof_of_address_classification_and_extraction(self):
        path = SYNTHETIC_DIR / "proof_of_address.txt"
        self.assertTrue(path.exists())
        doc = process_document(path, client_id="client_apex_001")

        self.assertEqual(doc.doc_type, "proof_of_address")
        self.assertGreaterEqual(doc.confidence, 0.85)
        self.assertFalse(doc.needs_human_review)
        self.assertEqual(doc.key_fields["resident_name"], "Jane Sarah Miller")
        self.assertIn("42 Baker Street", doc.key_fields["address"])

    def test_legal_vertical_classification_and_extraction(self):
        # Source of funds
        sof_path = SYNTHETIC_DIR / "source_of_funds.txt"
        self.assertTrue(sof_path.exists())
        sof_doc = process_document(sof_path, client_id="client_legal_001")
        self.assertEqual(sof_doc.doc_type, "source_of_funds")
        self.assertGreaterEqual(sof_doc.confidence, 0.85)
        self.assertFalse(sof_doc.needs_human_review)
        self.assertEqual(sof_doc.key_fields["amount"], "£85,000.00")

        # Property deeds
        deeds_path = SYNTHETIC_DIR / "property_title_deeds.txt"
        self.assertTrue(deeds_path.exists())
        deeds_doc = process_document(deeds_path, client_id="client_legal_001")
        self.assertEqual(deeds_doc.doc_type, "property_title_deeds")
        self.assertGreaterEqual(deeds_doc.confidence, 0.85)
        self.assertFalse(deeds_doc.needs_human_review)
        self.assertEqual(deeds_doc.key_fields["title_number"], "CS123456")
        self.assertEqual(deeds_doc.key_fields["registered_owner"], "Johnathan Vance")

    def test_noisy_scan_human_review_flag(self):
        """Confidence < 0.85 triggers needs_human_review = True."""
        noisy_path = SYNTHETIC_DIR / "vat_certificate_noisy.txt"
        self.assertTrue(noisy_path.exists())
        doc = process_document(noisy_path, client_id="client_apex_001")

        self.assertLess(doc.confidence, 0.85, f"Expected confidence < 0.85, got {doc.confidence}")
        self.assertTrue(doc.needs_human_review, "Degraded document must have needs_human_review = True")

    def test_noisy_scan_fallback_file(self):
        noisy_scan_path = SYNTHETIC_DIR / "noisy_scan.txt"
        self.assertTrue(noisy_scan_path.exists())
        doc = process_document(noisy_scan_path, client_id="client_test_999")
        self.assertLess(doc.confidence, 0.85)
        self.assertTrue(doc.needs_human_review)


class TestDocumentRecordContractConformity(unittest.TestCase):
    """Test strict conformity to contracts.py DocumentRecord schema."""

    def test_document_record_fields_and_types(self):
        rec = DocumentRecord(
            doc_id="doc_test_123",
            client_id="client_apex_001",
            doc_type="bank_statement",
            period_covered="01 Jan 2024 to 31 Jan 2024",
            key_fields={"bank_name": "Barclays Bank", "closing_balance": "£14,520.50"},
            confidence=0.98,
            needs_human_review=False,
            uploaded_at=datetime.now(timezone.utc).isoformat()
        )
        self.assertIsInstance(rec.doc_id, str)
        self.assertIsInstance(rec.client_id, str)
        self.assertIsInstance(rec.doc_type, str)
        self.assertIsInstance(rec.period_covered, str)
        self.assertIsInstance(rec.key_fields, dict)
        self.assertIsInstance(rec.confidence, float)
        self.assertIsInstance(rec.needs_human_review, bool)
        self.assertIsInstance(rec.uploaded_at, str)

        d = rec.to_dict()
        self.assertEqual(d["doc_id"], "doc_test_123")
        self.assertEqual(d["confidence"], 0.98)
        self.assertFalse(d["needs_human_review"])

        roundtrip = DocumentRecord.from_dict(d)
        self.assertEqual(roundtrip.doc_id, rec.doc_id)
        self.assertEqual(roundtrip.confidence, rec.confidence)
        self.assertEqual(roundtrip.key_fields, rec.key_fields)


class TestClientDocumentIngestion(unittest.TestCase):
    """Test Requirement 4: Client Ingestion and Status Transitions."""

    def setUp(self):
        contact = ContactInfo(
            name="John David Smith",
            email="john.smith@apextrading.co.uk",
            phone="+44 20 7946 0912"
        )
        self.client = ClientRecord(
            client_id="client_apex_001",
            business_type="Ltd",
            service_requested="Year-end accounts",
            turnover_band="£500k-£1m",
            employee_count=5,
            contact=contact,
            status=ClientStatus.NEW.value,
            checklist_required=[
                "bank_statement",
                "prior_year_accounts",
                "payroll_summary",
                "id",
                "proof_of_address",
                "vat_certificate"
            ],
            documents_received=[],
            missing_items=[
                "bank_statement",
                "prior_year_accounts",
                "payroll_summary",
                "id",
                "proof_of_address",
                "vat_certificate"
            ]
        )

    def test_partial_ingestion_transitions_to_chasing(self):
        """Feeding partial documents to 'New' client transitions status to 'Chasing'."""
        partial_docs = [
            SYNTHETIC_DIR / "bank_statement.txt",
            SYNTHETIC_DIR / "prior_year_accounts.txt",
            SYNTHETIC_DIR / "director_id.txt",
        ]
        updated_client = ingest_client_documents(self.client, partial_docs)

        self.assertEqual(len(updated_client.documents_received), 3)
        self.assertEqual(updated_client.status, ClientStatus.CHASING.value)
        # Missing items should only be payroll_summary, proof_of_address, vat_certificate
        self.assertNotIn("bank_statement", updated_client.missing_items)
        self.assertNotIn("prior_year_accounts", updated_client.missing_items)
        self.assertNotIn("id", updated_client.missing_items)
        self.assertIn("payroll_summary", updated_client.missing_items)
        self.assertIn("proof_of_address", updated_client.missing_items)
        self.assertIn("vat_certificate", updated_client.missing_items)

    def test_completing_ingestion_transitions_to_ready(self):
        """Feeding the remaining missing items transitions status from 'Chasing' to 'Ready'."""
        # 1. First partial ingestion
        partial_docs = [
            SYNTHETIC_DIR / "bank_statement.txt",
            SYNTHETIC_DIR / "prior_year_accounts.txt",
            SYNTHETIC_DIR / "director_id.txt",
        ]
        ingest_client_documents(self.client, partial_docs)
        self.assertEqual(self.client.status, ClientStatus.CHASING.value)

        # 2. Follow-up upload with remaining documents
        remaining_docs = [
            SYNTHETIC_DIR / "payroll_summary.txt",
            SYNTHETIC_DIR / "vat_certificate.txt",
            SYNTHETIC_DIR / "proof_of_address.txt",
        ]
        updated_client = ingest_client_documents(self.client, remaining_docs)

        self.assertEqual(len(updated_client.documents_received), 6)
        self.assertEqual(updated_client.missing_items, [])
        self.assertEqual(updated_client.status, ClientStatus.READY.value)

    def test_full_batch_ingestion_from_awaiting_documents(self):
        """Uploading all required documents in a single batch transitions directly to 'Ready'."""
        self.client.status = ClientStatus.AWAITING_DOCUMENTS.value
        all_docs = [
            SYNTHETIC_DIR / "bank_statement.txt",
            SYNTHETIC_DIR / "prior_year_accounts.txt",
            SYNTHETIC_DIR / "payroll_summary.txt",
            SYNTHETIC_DIR / "director_id.txt",
            SYNTHETIC_DIR / "proof_of_address.txt",
            SYNTHETIC_DIR / "vat_certificate.txt",
        ]
        updated_client = ingest_client_documents(self.client, all_docs)

        self.assertEqual(len(updated_client.documents_received), 6)
        self.assertEqual(len(updated_client.missing_items), 0)
        self.assertEqual(updated_client.status, ClientStatus.READY.value)


class TestAgent5Interoperability(unittest.TestCase):
    """Test Interoperability with Agent 5 synthetic document pack loader."""

    def test_load_agent5_synthetic_pack(self):
        loader_path = SYNTHETIC_DIR / "loader.py"
        self.assertTrue(loader_path.exists(), "Agent 5 loader.py must exist")

        from synthetic_docs.loader import (
            get_initial_document_batch,
            get_followup_document_batch,
            get_noisy_document,
            get_synthetic_client_profile,
        )

        client = get_synthetic_client_profile()
        self.assertEqual(client.status, ClientStatus.AWAITING_DOCUMENTS.value)

        # Ingest Agent 5 initial batch (omits proof_of_address)
        initial_batch = get_initial_document_batch()
        updated_client = ingest_client_documents(client, initial_batch)
        self.assertEqual(updated_client.status, ClientStatus.CHASING.value)
        self.assertEqual(updated_client.missing_items, ["proof_of_address"])

        # Ingest follow-up batch (satisfies proof_of_address)
        followup_batch = get_followup_document_batch()
        final_client = ingest_client_documents(updated_client, followup_batch)
        self.assertEqual(final_client.status, ClientStatus.READY.value)
        self.assertEqual(final_client.missing_items, [])

        # Check noisy document
        noisy_doc = get_noisy_document()
        self.assertLess(noisy_doc.confidence, 0.85)
        self.assertTrue(noisy_doc.needs_human_review)


if __name__ == "__main__":
    unittest.main(verbosity=2)
